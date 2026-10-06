import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActiveSessionsSection from './ActiveSessionsSection';
import { sessionService } from '../../services/sessionService';
import { makeAxiosError } from '../../../../test/helpers';
import type { ActiveSession } from '../../types/session.types';

vi.mock('../../services/sessionService', () => ({ sessionService: { list: vi.fn(), revoke: vi.fn() } }));

const actual: ActiveSession = {
  id: 's1',
  deviceInfo: 'Chrome en Windows',
  ipAddress: '203.0.113.5',
  createdAt: '2026-10-05T14:00:00Z',
  lastActiveAt: '2026-10-06T15:30:00Z',
  current: true,
};
const otra: ActiveSession = {
  id: 's2',
  deviceInfo: 'Safari en iOS',
  ipAddress: '198.51.100.7',
  createdAt: 'fecha-invalida',
  lastActiveAt: '2026-10-04T09:00:00Z',
  current: false,
};

describe('ActiveSessionsSection (RF-AUTH-10)', () => {
  afterEach(() => vi.clearAllMocks());

  it('lista las sesiones, marca la actual y solo permite cerrar las demás', async () => {
    vi.mocked(sessionService.list).mockResolvedValue([actual, otra]);
    render(<ActiveSessionsSection />);

    expect(await screen.findByText('Chrome en Windows')).toBeInTheDocument();
    expect(screen.getByText('Este dispositivo')).toBeInTheDocument();
    expect(screen.getByText('Safari en iOS')).toBeInTheDocument();
    expect(screen.getByText('IP 198.51.100.7')).toBeInTheDocument();
    // una fecha inválida no rompe la pantalla
    expect(screen.getByText(/Inició: —/)).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /cerrar sesión de chrome en windows/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cerrar sesión de safari en ios/i })).toBeInTheDocument();
  });

  it('muestra un estado de carga mientras consulta', () => {
    vi.mocked(sessionService.list).mockReturnValue(new Promise(() => {}));
    render(<ActiveSessionsSection />);

    expect(screen.getByRole('status')).toHaveTextContent(/cargando sesiones/i);
  });

  it('cierra una sesión remota y la quita de la lista', async () => {
    vi.mocked(sessionService.list).mockResolvedValue([actual, otra]);
    vi.mocked(sessionService.revoke).mockResolvedValue({ message: 'ok' });
    const user = userEvent.setup();
    render(<ActiveSessionsSection />);

    await user.click(await screen.findByRole('button', { name: /cerrar sesión de safari en ios/i }));

    expect(sessionService.revoke).toHaveBeenCalledWith('s2');
    await waitFor(() => expect(screen.queryByText('Safari en iOS')).not.toBeInTheDocument());
    expect(screen.getByText(/cerraste la sesión de safari en ios/i)).toBeInTheDocument();
    expect(screen.getByText('Chrome en Windows')).toBeInTheDocument();
  });

  it('avisa si no se pudo cerrar la sesión y la deja en la lista', async () => {
    vi.mocked(sessionService.list).mockResolvedValue([actual, otra]);
    vi.mocked(sessionService.revoke).mockRejectedValue(makeAxiosError({ message: 'Sesión no encontrada' }, 404));
    const user = userEvent.setup();
    render(<ActiveSessionsSection />);

    await user.click(await screen.findByRole('button', { name: /cerrar sesión de safari en ios/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Sesión no encontrada');
    expect(screen.getByText('Safari en iOS')).toBeInTheDocument();
  });

  it('usa un mensaje genérico si el error no trae detalle al cerrar una sesión', async () => {
    vi.mocked(sessionService.list).mockResolvedValue([actual, otra]);
    vi.mocked(sessionService.revoke).mockRejectedValue(new Error('Network Error'));
    const user = userEvent.setup();
    render(<ActiveSessionsSection />);

    await user.click(await screen.findByRole('button', { name: /cerrar sesión de safari en ios/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo cerrar la sesión/i);
  });

  it('muestra el error de carga y permite reintentar', async () => {
    vi.mocked(sessionService.list).mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce([actual]);
    const user = userEvent.setup();
    render(<ActiveSessionsSection />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudieron cargar tus sesiones/i);

    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    expect(await screen.findByText('Chrome en Windows')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('indica cuando no hay sesiones activas', async () => {
    vi.mocked(sessionService.list).mockResolvedValue([]);
    render(<ActiveSessionsSection />);

    expect(await screen.findByText(/no hay sesiones activas/i)).toBeInTheDocument();
  });

  it('no pisa otro cierre en curso: bloquea los botones mientras se revoca', async () => {
    const tercera: ActiveSession = { ...otra, id: 's3', deviceInfo: 'Firefox en Linux', createdAt: '2026-10-01T10:00:00Z' };
    vi.mocked(sessionService.list).mockResolvedValue([actual, otra, tercera]);
    vi.mocked(sessionService.revoke).mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<ActiveSessionsSection />);

    await user.click(await screen.findByRole('button', { name: /cerrar sesión de safari en ios/i }));

    expect(screen.getByRole('button', { name: /cerrar sesión de firefox en linux/i })).toBeDisabled();
  });
});
