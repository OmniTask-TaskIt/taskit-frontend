import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportProfileModal from './ReportProfileModal';
import { profileService } from '../services/profileService';

vi.mock('../services/profileService', () => ({
  profileService: { reportProfile: vi.fn() },
}));

describe('ReportProfileModal', () => {
  afterEach(() => vi.clearAllMocks());

  it('envía el reporte con el motivo seleccionado y muestra la confirmación', async () => {
    vi.mocked(profileService.reportProfile).mockResolvedValueOnce({
      id: 'r1',
      reporterId: 'u1',
      revieweeId: 'u2',
      reason: 'Comportamiento inapropiado',
      comment: '',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    });

    const user = userEvent.setup();
    render(<ReportProfileModal userId="u2" userName="Robin" onClose={() => {}} />);

    await user.click(screen.getByRole('button', { name: /enviar reporte/i }));

    expect(profileService.reportProfile).toHaveBeenCalledWith('u2', 'Comportamiento inapropiado', '');
    expect(await screen.findByText(/reporte enviado/i)).toBeInTheDocument();
  });

  it('muestra un mensaje específico cuando el backend responde 409 (reporte ya abierto)', async () => {
    const axiosError = Object.assign(new Error('Conflict'), {
      isAxiosError: true,
      response: { status: 409, data: { message: 'Ya tienes un reporte abierto contra este usuario.' } },
    });
    vi.mocked(profileService.reportProfile).mockRejectedValueOnce(axiosError);

    const user = userEvent.setup();
    render(<ReportProfileModal userId="u2" userName="Robin" onClose={() => {}} />);

    await user.click(screen.getByRole('button', { name: /enviar reporte/i }));

    expect(await screen.findByText(/ya tienes un reporte abierto/i)).toBeInTheDocument();
  });

  it('el textarea de comentario respeta el límite de 1000 caracteres', () => {
    render(<ReportProfileModal userId="u2" userName="Robin" onClose={() => {}} />);
    expect(screen.getByPlaceholderText(/describe brevemente/i)).toHaveAttribute('maxLength', '1000');
  });

  it('llama a onClose al hacer clic en Cancelar', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ReportProfileModal userId="u2" userName="Robin" onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
