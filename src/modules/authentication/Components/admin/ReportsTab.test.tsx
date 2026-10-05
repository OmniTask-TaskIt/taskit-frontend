import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportsTab from './ReportsTab';
import { adminService } from '../../services/adminService';
import type { AdminReport } from '../../types/profile.types';

vi.mock('../../services/adminService', () => ({
  adminService: { listReports: vi.fn(), resolveReport: vi.fn() },
}));

const report = (overrides: Partial<AdminReport> = {}): AdminReport => ({
  id: 'r1',
  reporterId: 'reporter-1',
  revieweeId: 'reviewee-1',
  reason: 'Fraude',
  comment: 'Pidió dinero por fuera de la app',
  status: 'OPEN',
  createdAt: '2026-05-01T10:00:00Z',
  ...overrides,
});
const page = (content: AdminReport[]) => ({ content, page: 0, size: 10, totalElements: content.length, totalPages: 1 });

describe('ReportsTab', () => {
  afterEach(() => vi.clearAllMocks());

  it('carga por defecto los reportes abiertos', async () => {
    vi.mocked(adminService.listReports).mockResolvedValue(page([report()]));
    render(<ReportsTab />);

    expect(await screen.findByText('Fraude')).toBeInTheDocument();
    expect(screen.getByText('Pidió dinero por fuera de la app')).toBeInTheDocument();
    expect(adminService.listReports).toHaveBeenCalledWith({ status: 'OPEN', page: 0, size: 10 });
  });

  it('"Todos" consulta sin filtro de estado', async () => {
    vi.mocked(adminService.listReports).mockResolvedValue(page([report()]));
    const user = userEvent.setup();
    render(<ReportsTab />);
    await screen.findByText('Fraude');

    await user.click(screen.getByRole('button', { name: /^todos$/i }));

    await waitFor(() => expect(adminService.listReports).toHaveBeenLastCalledWith({ status: undefined, page: 0, size: 10 }));
  });

  it('lista vacía y error de carga', async () => {
    vi.mocked(adminService.listReports).mockResolvedValueOnce(page([]));
    const { unmount } = render(<ReportsTab />);
    expect(await screen.findByText(/no hay reportes con ese filtro/i)).toBeInTheDocument();
    unmount();

    vi.mocked(adminService.listReports).mockRejectedValueOnce(new Error('500'));
    render(<ReportsTab />);
    expect(await screen.findByText(/no se pudo cargar la lista de reportes/i)).toBeInTheDocument();
  });

  it('resolver: pide una nota, llama al backend y actualiza la tarjeta', async () => {
    vi.mocked(adminService.listReports).mockResolvedValue(page([report()]));
    vi.mocked(adminService.resolveReport).mockResolvedValue(
      report({ status: 'RESOLVED', resolutionNote: 'Cuenta suspendida' })
    );
    const user = userEvent.setup();
    render(<ReportsTab />);
    await screen.findByText('Fraude');

    await user.click(screen.getByRole('button', { name: /^resolver$/i }));
    await user.type(screen.getByRole('textbox'), 'Cuenta suspendida');
    await user.click(screen.getAllByRole('button', { name: /^resolver$/i }).at(-1)!);

    await waitFor(() => expect(adminService.resolveReport).toHaveBeenCalledWith('r1', 'RESOLVED', 'Cuenta suspendida'));
    expect(await screen.findByText(/cuenta suspendida/i)).toBeInTheDocument();
  });

  it('descartar envía el estado DISMISSED', async () => {
    vi.mocked(adminService.listReports).mockResolvedValue(page([report()]));
    vi.mocked(adminService.resolveReport).mockResolvedValue(report({ status: 'DISMISSED' }));
    const user = userEvent.setup();
    render(<ReportsTab />);
    await screen.findByText('Fraude');

    await user.click(screen.getByRole('button', { name: /^descartar$/i }));
    await user.type(screen.getByRole('textbox'), 'Sin evidencia');
    await user.click(screen.getAllByRole('button', { name: /^descartar$/i }).at(-1)!);

    await waitFor(() => expect(adminService.resolveReport).toHaveBeenCalledWith('r1', 'DISMISSED', 'Sin evidencia'));
  });

  it('muestra nombres y correos de las personas del reporte; si la cuenta ya no existe, su ID', async () => {
    vi.mocked(adminService.listReports).mockResolvedValue(
      page([
        report({
          reporterName: 'Ana Pérez',
          reporterEmail: 'ana@gmail.com',
          revieweeName: null,
          revieweeEmail: null,
        }),
      ])
    );
    render(<ReportsTab />);

    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('(ana@gmail.com)')).toBeInTheDocument();
    expect(screen.getByText('reviewee-1')).toBeInTheDocument(); // cuenta eliminada → ID
  });

  it('al resolver conserva los nombres (la respuesta del PATCH no los trae)', async () => {
    vi.mocked(adminService.listReports).mockResolvedValue(
      page([report({ reporterName: 'Ana Pérez', reporterEmail: 'ana@gmail.com' })])
    );
    // ReportResponseDTO: sin reporterName/reporterEmail
    vi.mocked(adminService.resolveReport).mockResolvedValue(report({ status: 'RESOLVED', resolutionNote: 'Listo' }));
    const user = userEvent.setup();
    render(<ReportsTab />);
    await screen.findByText('Ana Pérez');

    await user.click(screen.getByRole('button', { name: /^resolver$/i }));
    await user.type(screen.getByRole('textbox'), 'Listo');
    await user.click(screen.getAllByRole('button', { name: /^resolver$/i }).at(-1)!);

    await screen.findByText(/resolución: listo/i);
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
  });
});
