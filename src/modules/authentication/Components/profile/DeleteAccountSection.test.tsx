import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteAccountSection from './DeleteAccountSection';
import { profileService } from '../../services/profileService';
import { authStore } from '../../services/authStore';
import { redirectToLogin } from '../../../../utils/navigation';
import { makeJwt } from '../../../../test/helpers';

vi.mock('../../services/profileService', () => ({ profileService: { deleteAccount: vi.fn() } }));
vi.mock('../../../../utils/navigation', () => ({ redirectToLogin: vi.fn() }));

const EMAIL = 'ana@gmail.com';

async function openModal() {
  const user = userEvent.setup();
  render(<DeleteAccountSection />);
  await user.click(screen.getByRole('button', { name: /eliminar mi cuenta/i }));
  return user;
}
const confirmButton = () => screen.getByRole('button', { name: /eliminar para siempre/i });

describe('DeleteAccountSection (eliminar cuenta)', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const login = () => {
    authStore.setTokens(makeJwt({ sub: EMAIL }), makeJwt({ sub: EMAIL }));
    localStorage.setItem('userEmail', EMAIL);
  };

  it('muestra la advertencia pero no abre nada hasta pulsar el botón', () => {
    login();
    render(<DeleteAccountSection />);

    expect(screen.getByText(/no se puede\s+deshacer/i)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('el botón de confirmar queda bloqueado hasta escribir el correo exacto', async () => {
    login();
    const user = await openModal();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();

    await user.type(screen.getByRole('textbox'), 'otro@gmail.com');
    expect(confirmButton()).toBeDisabled();

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), '  ANA@gmail.com ');
    expect(confirmButton()).toBeEnabled(); // ignora mayúsculas y espacios
    expect(profileService.deleteAccount).not.toHaveBeenCalled();
  });

  it('confirmar elimina la cuenta con el correo de la sesión, limpia todo y vuelve al login', async () => {
    login();
    vi.mocked(profileService.deleteAccount).mockResolvedValue({});
    const user = await openModal();

    await user.type(screen.getByRole('textbox'), EMAIL);
    await user.click(confirmButton());

    await waitFor(() => expect(redirectToLogin).toHaveBeenCalledTimes(1));
    expect(profileService.deleteAccount).toHaveBeenCalledWith(EMAIL);
    expect(authStore.getAccessToken()).toBeNull();
    expect(authStore.getRefreshToken()).toBeNull();
    expect(localStorage.getItem('userEmail')).toBeNull();
  });

  it('si el backend falla avisa, NO borra la sesión local y permite reintentar', async () => {
    login();
    vi.mocked(profileService.deleteAccount).mockRejectedValue(new Error('500'));
    const user = await openModal();

    await user.type(screen.getByRole('textbox'), EMAIL);
    await user.click(confirmButton());

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo eliminar la cuenta/i);
    expect(redirectToLogin).not.toHaveBeenCalled();
    expect(authStore.getAccessToken()).not.toBeNull();
    expect(confirmButton()).toBeEnabled();
  });

  it('cancelar, la X y Escape cierran el modal sin llamar al backend', async () => {
    login();
    const user = await openModal();

    await user.click(screen.getByRole('button', { name: /^cancelar$/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /eliminar mi cuenta/i }));
    await user.click(screen.getByRole('button', { name: /^cerrar$/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /eliminar mi cuenta/i }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    expect(profileService.deleteAccount).not.toHaveBeenCalled();
  });

  it('sin correo de sesión no permite confirmar', async () => {
    const user = await openModal();

    await user.type(screen.getByRole('textbox'), 'x');
    expect(confirmButton()).toBeDisabled();
  });
});
