import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import TwoFactorLoginPage from './TwoFactorLoginPage';
import { authService } from '../services/authService';
import { authStore } from '../services/authStore';
import { twoFactorChallenge } from '../services/twoFactorChallenge';
import { makeAxiosError, makeJwt } from '../../../test/helpers';

vi.mock('../services/authService', () => ({ authService: { verifyTwoFactorLogin: vi.fn() } }));

function LocationProbe() {
  return <div data-testid="location">{useLocation().pathname}</div>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/verify-2fa']}>
      <LocationProbe />
      <Routes>
        <Route path="/verify-2fa" element={<TwoFactorLoginPage />} />
        <Route path="*" element={null} />
      </Routes>
    </MemoryRouter>
  );
}

const typeCode = async (code: string) => {
  await userEvent.type(screen.getByLabelText(/código de verificación/i), code);
};
const submit = () => userEvent.click(screen.getByRole('button', { name: /verificar y entrar/i }));

describe('TwoFactorLoginPage (RF-AUTH-9)', () => {
  beforeEach(() => twoFactorChallenge.start({ challengeId: 'ch-1', email: 'ana@gmail.com' }));
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('sin reto abierto vuelve al login', () => {
    sessionStorage.clear();
    renderPage();

    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });

  it('muestra a qué correo se envió el código', () => {
    renderPage();

    expect(screen.getByText(/ana@gmail.com/)).toBeInTheDocument();
  });

  it('con el código correcto guarda tokens, limpia el reto y va a /select-role', async () => {
    vi.mocked(authService.verifyTwoFactorLogin).mockResolvedValue({
      accessToken: makeJwt({ role: 'SEEKER' }),
      refreshToken: 'ref',
      email: 'ana@gmail.com',
    });
    renderPage();

    await typeCode('123456');
    await submit();

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/select-role'));
    expect(authService.verifyTwoFactorLogin).toHaveBeenCalledWith('ch-1', '123456');
    expect(authStore.getRefreshToken()).toBe('ref');
    expect(localStorage.getItem('userEmail')).toBe('ana@gmail.com');
    expect(twoFactorChallenge.get()).toBeNull();
  });

  it('el administrador va directo a /admin', async () => {
    vi.mocked(authService.verifyTwoFactorLogin).mockResolvedValue({
      accessToken: makeJwt({ role: 'ADMIN' }),
      refreshToken: 'ref',
      email: 'admin@taskit.com',
    });
    renderPage();

    await typeCode('123456');
    await submit();

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/admin'));
  });

  it('exige los 6 dígitos antes de llamar al backend', async () => {
    renderPage();

    await typeCode('123');
    await submit();

    expect(screen.getByRole('alert')).toHaveTextContent(/6 dígitos/i);
    expect(authService.verifyTwoFactorLogin).not.toHaveBeenCalled();
  });

  it('solo acepta dígitos en el campo', async () => {
    renderPage();

    await typeCode('12ab34');

    expect(screen.getByLabelText(/código de verificación/i)).toHaveValue('1234');
  });

  it('con un código incorrecto muestra el mensaje del backend y conserva el reto', async () => {
    vi.mocked(authService.verifyTwoFactorLogin).mockRejectedValue(
      makeAxiosError({ message: 'Código inválido o expirado' }, 400)
    );
    renderPage();

    await typeCode('000000');
    await submit();

    expect(await screen.findByRole('alert')).toHaveTextContent('Código inválido o expirado');
    expect(screen.getByTestId('location')).toHaveTextContent('/verify-2fa');
    expect(twoFactorChallenge.get()).not.toBeNull();
  });

  it('si el servidor no devuelve token lo avisa', async () => {
    vi.mocked(authService.verifyTwoFactorLogin).mockResolvedValue({});
    renderPage();

    await typeCode('123456');
    await submit();

    expect(await screen.findByRole('alert')).toHaveTextContent(/token de acceso válido/i);
    expect(authStore.getAccessToken()).toBeNull();
  });

  it('"Volver al inicio de sesión" descarta el reto', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /volver al inicio de sesión/i }));

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/login'));
    expect(twoFactorChallenge.get()).toBeNull();
  });
});
