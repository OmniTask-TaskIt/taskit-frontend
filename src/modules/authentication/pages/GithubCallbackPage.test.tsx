import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import GithubCallbackPage from './GithubCallbackPage';
import { authService } from '../services/authService';
import { authStore } from '../services/authStore';
import { makeAxiosError } from '../../../test/helpers';

vi.mock('../services/authService', () => ({ authService: { githubLogin: vi.fn() } }));

function LocationProbe() {
  return <div data-testid="location">{useLocation().pathname}</div>;
}
/**
 * Simula el regreso de GitHub. Por defecto el `state` de la URL coincide con el que
 * este navegador generó al salir; pasa `state: 'otro'` o `state: null` para simular un ataque.
 */
function renderCallback(query: string, { state = 'estado-valido' }: { state?: string | null } = {}) {
  sessionStorage.setItem('githubOauthState', 'estado-valido');
  const url = new URLSearchParams(query);
  if (state !== null) url.set('state', state);
  const qs = url.toString();
  window.history.pushState({}, '', `/auth/github/callback${qs ? `?${qs}` : ''}`);
  return render(
    <MemoryRouter initialEntries={['/auth/github/callback']}>
      <LocationProbe />
      <Routes>
        <Route path="/auth/github/callback" element={<GithubCallbackPage />} />
        <Route path="*" element={null} />
      </Routes>
    </MemoryRouter>
  );
}

describe('GithubCallbackPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('con el code y los Términos aceptados: inicia sesión, guarda tokens y va a /select-role', async () => {
    sessionStorage.setItem('githubOauthTermsAccepted', 'true');
    vi.mocked(authService.githubLogin).mockResolvedValue({ accessToken: 'acc', refreshToken: 'ref', email: 'gh@taskit.com' });

    renderCallback('?code=abc123');

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/select-role'));
    expect(authService.githubLogin).toHaveBeenCalledWith('abc123', true);
    expect(authStore.getAccessToken()).toBe('acc');
    expect(localStorage.getItem('userEmail')).toBe('gh@taskit.com');
    expect(sessionStorage.getItem('githubOauthTermsAccepted')).toBeNull();
  });

  it('sin la marca de Términos envía acceptedTerms=false', async () => {
    vi.mocked(authService.githubLogin).mockResolvedValue({ accessToken: 'acc', refreshToken: 'ref' });

    renderCallback('?code=abc123');

    await waitFor(() => expect(authService.githubLogin).toHaveBeenCalledWith('abc123', false));
  });

  it('si el usuario cancela en GitHub muestra el aviso y no llama al backend', () => {
    renderCallback('?error=access_denied');

    expect(screen.getByText('Inicio de sesión con GitHub cancelado.')).toBeInTheDocument();
    expect(authService.githubLogin).not.toHaveBeenCalled();
  });

  it('sin code avisa', () => {
    renderCallback('');

    expect(screen.getByText(/no se recibió el código de autorización/i)).toBeInTheDocument();
    expect(authService.githubLogin).not.toHaveBeenCalled();
  });

  it('si el backend rechaza (p. ej. no aceptó Términos) muestra su mensaje', async () => {
    vi.mocked(authService.githubLogin).mockRejectedValue(makeAxiosError({ message: 'Debe aceptar los términos' }));

    renderCallback('?code=abc123');

    expect(await screen.findByText('Debe aceptar los términos')).toBeInTheDocument();
    expect(authStore.getAccessToken()).toBeNull();
  });

  it('si el servidor responde sin accessToken lo trata como error', async () => {
    vi.mocked(authService.githubLogin).mockResolvedValue({});

    renderCallback('?code=abc123');

    expect(await screen.findByText(/no devolvió un token de acceso válido/i)).toBeInTheDocument();
  });

  describe('protección CSRF (state)', () => {
    it('state distinto al generado: rechaza, no llama al backend y descarta la aceptación de Términos', async () => {
      sessionStorage.setItem('githubOauthTermsAccepted', 'true');

      renderCallback('?code=codigo-de-otra-cuenta', { state: 'valor-del-atacante' });

      expect(await screen.findByText(/no se pudo verificar la seguridad/i)).toBeInTheDocument();
      expect(authService.githubLogin).not.toHaveBeenCalled();
      expect(authStore.getAccessToken()).toBeNull();
      expect(sessionStorage.getItem('githubOauthTermsAccepted')).toBeNull();
    });

    it('sin state en la URL: rechaza', async () => {
      renderCallback('?code=abc', { state: null });

      expect(await screen.findByText(/no se pudo verificar la seguridad/i)).toBeInTheDocument();
      expect(authService.githubLogin).not.toHaveBeenCalled();
    });

    it('si este navegador nunca inició el flujo (nada guardado): rechaza', async () => {
      renderCallback('?code=abc');
      sessionStorage.clear();
      // (render ya consumió; se vuelve a montar sin valor guardado)
      window.history.pushState({}, '', '/auth/github/callback?code=abc&state=estado-valido');
      render(
        <MemoryRouter>
          <GithubCallbackPage />
        </MemoryRouter>
      );

      expect((await screen.findAllByText(/no se pudo verificar la seguridad/i)).length).toBeGreaterThan(0);
    });

    it('el state es de un solo uso: queda consumido tras un login exitoso', async () => {
      vi.mocked(authService.githubLogin).mockResolvedValue({ accessToken: 'acc', refreshToken: 'ref' });

      renderCallback('?code=abc');

      await waitFor(() => expect(authService.githubLogin).toHaveBeenCalledTimes(1));
      expect(sessionStorage.getItem('githubOauthState')).toBeNull();
    });
  });
});
