import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import LoginForm from './LoginForm';
import { authService } from '../../services/authService';
import { authStore } from '../../services/authStore';
import { makeAxiosError } from '../../../../test/helpers';

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <button type="button">Mock Google Login</button>,
}));
vi.mock('../../services/authService', () => ({
  authService: { login: vi.fn(), googleLogin: vi.fn() },
}));

function LocationProbe() {
  return <div data-testid="location">{useLocation().pathname}</div>;
}

function renderLogin(state?: { verifiedEmail?: string; prefillEmail?: string }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/login', state }]}>
      <LocationProbe />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="*" element={null} />
      </Routes>
    </MemoryRouter>
  );
}

async function fillAndSubmit(email = 'ana@gmail.com', password = 'Secreta1!') {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText('Correo electrónico'), email);
  await user.type(screen.getByPlaceholderText('Contraseña'), password);
  await user.click(screen.getByRole('button', { name: /^entrar$/i }));
}

describe('LoginForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('inicia sesión: guarda tokens y correo y navega a /select-role', async () => {
    vi.mocked(authService.login).mockResolvedValue({ accessToken: 'acc', refreshToken: 'ref' });
    renderLogin();

    await fillAndSubmit();

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/select-role'));
    expect(authService.login).toHaveBeenCalledWith({ email: 'ana@gmail.com', password: 'Secreta1!' });
    expect(authStore.getAccessToken()).toBe('acc');
    expect(authStore.getRefreshToken()).toBe('ref');
    expect(localStorage.getItem('userEmail')).toBe('ana@gmail.com');
  });

  it('credenciales inválidas: muestra un mensaje claro y se queda en /login', async () => {
    vi.mocked(authService.login).mockRejectedValue(makeAxiosError({ message: 'Credenciales inválidas' }, 401));
    renderLogin();

    await fillAndSubmit();

    expect(await screen.findByText(/no está registrado en taskit o la contraseña es incorrecta/i)).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
    expect(authStore.getAccessToken()).toBeNull();
  });

  it('cuenta sin verificar: avisa y redirige al código OTP', async () => {
    vi.mocked(authService.login).mockRejectedValue(makeAxiosError({ message: 'Debes verificar tu cuenta con el OTP' }, 403));
    renderLogin();

    await fillAndSubmit();

    expect(await screen.findByText(/aún no has verificado tu cuenta/i)).toBeInTheDocument();
    expect(localStorage.getItem('userEmail')).toBe('ana@gmail.com');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/verify-otp'), { timeout: 3000 });
  });

  it('muestra el mensaje del servidor cuando no es un caso conocido', async () => {
    vi.mocked(authService.login).mockRejectedValue(makeAxiosError({ message: 'Demasiados intentos, espera 15 minutos' }, 429));
    renderLogin();

    await fillAndSubmit();

    expect(await screen.findByText('Demasiados intentos, espera 15 minutos')).toBeInTheDocument();
  });

  it('error que no es de red/servidor: mensaje genérico', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('boom'));
    renderLogin();

    await fillAndSubmit();

    expect(await screen.findByText(/error inesperado al conectar con el servidor/i)).toBeInTheDocument();
  });

  it('Google y GitHub quedan bloqueados hasta aceptar los Términos, y avisan si se intenta', async () => {
    const user = userEvent.setup();
    renderLogin();
    const github = screen.getByRole('button', { name: /continuar con github/i });

    expect(github).toHaveAttribute('aria-disabled', 'true');
    await user.click(github);
    expect(
      await screen.findByText('Debes aceptar los Términos y Condiciones para continuar con GitHub.')
    ).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /google o github/i }));
    expect(github).toHaveAttribute('aria-disabled', 'false');
  });

  it('el link de Términos apunta a la ruta interna /terms', () => {
    renderLogin();

    expect(screen.getByRole('link', { name: /términos y condiciones/i })).toHaveAttribute('href', '/terms');
  });

  it('al volver de verificar el OTP: correo ya llenado y aviso de cuenta verificada', () => {
    renderLogin({ verifiedEmail: 'ana@gmail.com' });

    expect(screen.getByPlaceholderText('Correo electrónico')).toHaveValue('ana@gmail.com');
    expect(screen.getByRole('status')).toHaveTextContent(/cuenta verificada/i);
  });

  it('al intentar registrar un correo existente: solo precarga el correo, sin aviso de verificada', () => {
    renderLogin({ prefillEmail: 'ana@gmail.com' });

    expect(screen.getByPlaceholderText('Correo electrónico')).toHaveValue('ana@gmail.com');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('entrando directo a /login no hay aviso ni correo precargado', () => {
    renderLogin();

    expect(screen.getByPlaceholderText('Correo electrónico')).toHaveValue('');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('con una cuenta sin verificar, el MENSAJE REAL del backend lleva al código OTP', async () => {
    // AccountRestrictedException (403) de LoginUseCase, tal cual lo envía el backend.
    vi.mocked(authService.login).mockRejectedValue(
      makeAxiosError(
        {
          status: 403,
          error: 'Cuenta restringida',
          message: 'Debes verificar tu cuenta con el código OTP enviado a tu correo antes de iniciar sesión.',
        },
        403
      )
    );
    renderLogin();

    await fillAndSubmit();

    expect(await screen.findByText(/aún no has verificado tu cuenta/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/verify-otp'), { timeout: 3000 });
  });

  it('con 2FA activo: guarda el reto, no guarda tokens y navega a /verify-2fa (RF-AUTH-9)', async () => {
    vi.mocked(authService.login).mockResolvedValue({ twoFactorRequired: true, challengeId: 'ch-1', email: 'ana@gmail.com' });
    renderLogin();

    await fillAndSubmit();

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/verify-2fa'));
    expect(JSON.parse(sessionStorage.getItem('twoFactorChallenge') ?? 'null')).toEqual({
      challengeId: 'ch-1',
      email: 'ana@gmail.com',
    });
    expect(authStore.getAccessToken()).toBeNull();
    sessionStorage.clear();
  });
});
