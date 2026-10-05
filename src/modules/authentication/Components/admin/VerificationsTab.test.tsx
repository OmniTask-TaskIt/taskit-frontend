import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VerificationsTab from './VerificationsTab';
import { adminService } from '../../services/adminService';
import type { Profile } from '../../types/profile.types';

vi.mock('../../services/adminService', () => ({
  adminService: { listVerifications: vi.fn(), getVerificationDocumentAccess: vi.fn(), resolveVerification: vi.fn() },
}));

const profile = (overrides: Partial<Profile> = {}): Profile => ({
  userId: 'u1',
  fullName: 'Robin Plomero',
  description: '',
  photoUrl: '',
  categories: [],
  locationCoverage: '',
  reputationScore: 5,
  totalReviews: 0,
  identityVerificationStatus: 'PENDING_REVIEW',
  ...overrides,
});
const page = (content: Profile[], extra = {}) => ({ content, page: 0, size: 10, totalElements: content.length, totalPages: 1, ...extra });

describe('VerificationsTab (cola de verificaciones)', () => {
  afterEach(() => vi.clearAllMocks());

  it('carga por defecto la cola EN REVISIÓN', async () => {
    vi.mocked(adminService.listVerifications).mockResolvedValue(page([profile()]));
    render(<VerificationsTab />);

    expect(await screen.findByText('Robin Plomero')).toBeInTheDocument();
    expect(adminService.listVerifications).toHaveBeenCalledWith({ status: 'PENDING_REVIEW', page: 0, size: 10 });
    expect(screen.getByRole('button', { name: /aprobar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rechazar/i })).toBeInTheDocument();
  });

  it('cola vacía: mensaje claro', async () => {
    vi.mocked(adminService.listVerifications).mockResolvedValue(page([]));
    render(<VerificationsTab />);

    expect(await screen.findByText(/no hay verificaciones con ese estado/i)).toBeInTheDocument();
  });

  it('error de carga: avisa', async () => {
    vi.mocked(adminService.listVerifications).mockRejectedValue(new Error('500'));
    render(<VerificationsTab />);

    expect(await screen.findByText(/no se pudo cargar la cola/i)).toBeInTheDocument();
  });

  it('cambiar de filtro vuelve a consultar y no ofrece aprobar/rechazar sobre ya resueltos', async () => {
    vi.mocked(adminService.listVerifications)
      .mockResolvedValueOnce(page([profile()]))
      .mockResolvedValueOnce(page([profile({ identityVerificationStatus: 'VERIFIED' })]));
    const user = userEvent.setup();
    render(<VerificationsTab />);
    await screen.findByText('Robin Plomero');

    await user.click(screen.getByRole('button', { name: /^verificados$/i }));

    await waitFor(() =>
      expect(adminService.listVerifications).toHaveBeenLastCalledWith({ status: 'VERIFIED', page: 0, size: 10 })
    );
    await waitFor(() => expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: /ver documento/i })).toBeInTheDocument();
  });

  it('aprobar: confirma en el modal, llama al backend y saca el perfil de la cola', async () => {
    vi.mocked(adminService.listVerifications).mockResolvedValue(page([profile()]));
    vi.mocked(adminService.resolveVerification).mockResolvedValue(profile({ identityVerificationStatus: 'VERIFIED' }));
    const user = userEvent.setup();
    render(<VerificationsTab />);
    await screen.findByText('Robin Plomero');

    await user.click(screen.getByRole('button', { name: /^aprobar$/i }));
    const confirm = screen.getAllByRole('button', { name: /^aprobar$/i }).at(-1)!;
    await user.click(confirm);

    await waitFor(() => expect(adminService.resolveVerification).toHaveBeenCalledWith('u1', 'APPROVED', ''));
    await waitFor(() => expect(screen.queryByText('Robin Plomero')).not.toBeInTheDocument());
  });

  it('rechazar exige un motivo', async () => {
    vi.mocked(adminService.listVerifications).mockResolvedValue(page([profile()]));
    vi.mocked(adminService.resolveVerification).mockResolvedValue(profile({ identityVerificationStatus: 'REJECTED' }));
    const user = userEvent.setup();
    render(<VerificationsTab />);
    await screen.findByText('Robin Plomero');

    await user.click(screen.getByRole('button', { name: /^rechazar$/i }));
    await user.click(screen.getAllByRole('button', { name: /^rechazar$/i }).at(-1)!);
    expect(await screen.findByText('Este campo es obligatorio.')).toBeInTheDocument();
    expect(adminService.resolveVerification).not.toHaveBeenCalled();

    await user.type(screen.getByRole('textbox', { name: /motivo/i }), 'Documento ilegible');
    await user.click(screen.getAllByRole('button', { name: /^rechazar$/i }).at(-1)!);

    await waitFor(() =>
      expect(adminService.resolveVerification).toHaveBeenCalledWith('u1', 'REJECTED', 'Documento ilegible')
    );
  });

  it('ver documento abre el enlace temporal en otra pestaña sin opener', async () => {
    vi.mocked(adminService.listVerifications).mockResolvedValue(page([profile()]));
    vi.mocked(adminService.getVerificationDocumentAccess).mockResolvedValue({
      url: 'https://storage/doc?sig=1', expiresAt: '', documentType: 'CC', contentType: 'image/png', submittedAt: '',
    });
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();
    render(<VerificationsTab />);
    await screen.findByText('Robin Plomero');

    await user.click(screen.getByRole('button', { name: /ver documento/i }));

    await waitFor(() => expect(open).toHaveBeenCalledWith('https://storage/doc?sig=1', '_blank', 'noopener,noreferrer'));
    open.mockRestore();
  });

  it('ver documento sin archivo subido: muestra el aviso', async () => {
    vi.mocked(adminService.listVerifications).mockResolvedValue(page([profile()]));
    vi.mocked(adminService.getVerificationDocumentAccess).mockRejectedValue(new Error('404'));
    const user = userEvent.setup();
    render(<VerificationsTab />);
    await screen.findByText('Robin Plomero');

    await user.click(screen.getByRole('button', { name: /ver documento/i }));

    expect(await screen.findByText(/no se pudo obtener el enlace al documento/i)).toBeInTheDocument();
  });

  it('pagina: Siguiente pide la página 1', async () => {
    vi.mocked(adminService.listVerifications)
      .mockResolvedValueOnce(page([profile()], { totalPages: 2 }))
      .mockResolvedValueOnce(page([profile({ userId: 'u2', fullName: 'Otra Persona' })], { page: 1, totalPages: 2 }));
    const user = userEvent.setup();
    render(<VerificationsTab />);
    await screen.findByText('Robin Plomero');
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /página siguiente/i }));

    expect(await screen.findByText('Otra Persona')).toBeInTheDocument();
    expect(adminService.listVerifications).toHaveBeenLastCalledWith({ status: 'PENDING_REVIEW', page: 1, size: 10 });
  });
});
