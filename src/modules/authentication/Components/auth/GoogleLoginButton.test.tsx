import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import GoogleLoginButton from './GoogleLoginButton';
import { authService } from '../../services/authService';
import { authStore } from '../../services/authStore';
import { makeAxiosError, makeJwt } from '../../../../test/helpers';

// El botón real de Google vive en un iframe; se reemplaza por uno que dispara los callbacks.
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError }: { onSuccess: (r: { credential?: string }) => void; onError: () => void }) => (
    <>
      <button onClick={() => onSuccess({ credential: window.__GOOGLE_CREDENTIAL__ })}>google-ok</button>
      <button onClick={onError}>google-error</button>
    </>
  ),
}));
vi.mock('../../services/authService', () => ({ authService: { googleLogin: vi.fn() } }));

declare global {
  interface Window {
    __GOOGLE_CREDENTIAL__?: string;
  }
}

function LocationProbe() {
  return <div data-testid="location">{useLocation().pathname}</div>;
}
const renderButton = (props: Partial<React.ComponentProps<typeof GoogleLoginButton>> = {}) => {
  const onError = vi.fn();
  const utils = render(
    <MemoryRouter initialEntries={['/login']}>
      <LocationProbe />
      <Routes>
        <Route path="*" element={<GoogleLoginButton onError={onError} {...props} />} />
      </Routes>
    </MemoryRouter>
  );
  return { onError, ...utils };
};

describe('GoogleLoginButton', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.__GOOGLE_CREDENTIAL__ = undefined;
  });

  it('login correcto: envía el credential con acceptedTerms=true, guarda tokens y va a /select-role', async () => {
    window.__GOOGLE_CREDENTIAL__ = makeJwt({ sub: 'ana@gmail.com' });
    vi.mocked(authService.googleLogin).mockResolvedValue({ accessToken: 'acc', refreshToken: 'ref', email: 'ana@gmail.com' });
    renderButton();

    await userEvent.click(screen.getByText('google-ok'));

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/select-role'));
    expect(authService.googleLogin).toHaveBeenCalledWith(window.__GOOGLE_CREDENTIAL__, true);
    expect(authStore.getAccessToken()).toBe('acc');
    expect(localStorage.getItem('userEmail')).toBe('ana@gmail.com');
  });

  it('sin credential avisa y no llama al backend', async () => {
    const { onError } = renderButton();

    await userEvent.click(screen.getByText('google-ok'));

    expect(onError).toHaveBeenCalledWith('No se pudo obtener las credenciales de Google.');
    expect(authService.googleLogin).not.toHaveBeenCalled();
  });

  it('el backend rechaza: muestra su mensaje', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    window.__GOOGLE_CREDENTIAL__ = 'a.b.c';
    vi.mocked(authService.googleLogin).mockRejectedValue(makeAxiosError({ message: 'Cuenta bloqueada' }, 403));
    const { onError } = renderButton();

    await userEvent.click(screen.getByText('google-ok'));

    await waitFor(() => expect(onError).toHaveBeenCalledWith('Cuenta bloqueada'));
    expect(authStore.getAccessToken()).toBeNull();
  });

  it('el servidor responde sin accessToken: error', async () => {
    window.__GOOGLE_CREDENTIAL__ = 'a.b.c';
    vi.mocked(authService.googleLogin).mockResolvedValue({});
    const { onError } = renderButton();

    await userEvent.click(screen.getByText('google-ok'));

    await waitFor(() => expect(onError).toHaveBeenCalledWith('El servidor no devolvió un token de acceso válido.'));
  });

  it('error del widget de Google: mensaje para reintentar', async () => {
    const { onError } = renderButton();

    await userEvent.click(screen.getByText('google-error'));

    expect(onError).toHaveBeenCalledWith('Error al autenticar con Google. Por favor, inténtalo de nuevo.');
  });

  it('deshabilitado (Términos sin aceptar): una capa bloquea el click y avisa', async () => {
    const onBlockedClick = vi.fn();
    const { container } = renderButton({ disabled: true, onBlockedClick });

    await userEvent.click(container.querySelector('.cursor-not-allowed') as HTMLElement);

    expect(onBlockedClick).toHaveBeenCalled();
    expect(authService.googleLogin).not.toHaveBeenCalled();
  });
});
