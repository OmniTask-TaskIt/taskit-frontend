import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import OtpVerificationPage from './OtpVerificationPage';
import { authService } from '../services/authService';
import { makeAxiosError } from '../../../test/helpers';

vi.mock('../services/authService', () => ({
  authService: { verifyOtp: vi.fn(), resendOtp: vi.fn() },
}));

function LocationProbe() {
  return <div data-testid="location">{useLocation().pathname}</div>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/verify-otp']}>
      <LocationProbe />
      <Routes>
        <Route path="/verify-otp" element={<OtpVerificationPage />} />
        <Route path="*" element={null} />
      </Routes>
    </MemoryRouter>
  );
}

describe('OtpVerificationPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('muestra el correo al que se envió el código y 6 casillas', () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    renderPage();

    expect(screen.getByText(/ana@gmail\.com/)).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
  });

  it('no envía si el código está incompleto', async () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole('textbox')[0]);
    await user.keyboard('123');
    await user.click(screen.getByRole('button', { name: /verificar código/i }));

    expect(screen.getByText('Por favor completa los 6 dígitos del código.')).toBeInTheDocument();
    expect(authService.verifyOtp).not.toHaveBeenCalled();
  });

  it('sin correo guardado pide registrarse de nuevo', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole('textbox')[0]);
    await user.keyboard('123456');
    await user.click(screen.getByRole('button', { name: /verificar código/i }));

    expect(screen.getByText(/el email es obligatorio/i)).toBeInTheDocument();
    expect(authService.verifyOtp).not.toHaveBeenCalled();
  });

  it('código correcto: verifica y va al LOGIN con el correo ya llenado (el backend no devuelve tokens)', async () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    // Respuesta real de POST /auth/verify-otp: solo un mensaje, sin accessToken ni refreshToken.
    vi.mocked(authService.verifyOtp).mockResolvedValue({ message: 'Correo verificado exitosamente. Ya puede iniciar sesión.' });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole('textbox')[0]);
    await user.keyboard('123456');
    await user.click(screen.getByRole('button', { name: /verificar código/i }));

    expect(await screen.findByText(/código verificado con éxito/i)).toBeInTheDocument();
    expect(authService.verifyOtp).toHaveBeenCalledWith('ana@gmail.com', '123456');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/login'), { timeout: 3000 });
    expect(localStorage.getItem('accessToken')).toBeNull(); // verificar no inicia sesión
  });

  it('acepta pegar el código completo', async () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    vi.mocked(authService.verifyOtp).mockResolvedValue({ message: 'ok' });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole('textbox')[0]);
    await user.paste('654321');
    await user.click(screen.getByRole('button', { name: /verificar código/i }));

    await waitFor(() => expect(authService.verifyOtp).toHaveBeenCalledWith('ana@gmail.com', '654321'));
  });

  it('código inválido: muestra el mensaje del servidor', async () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    vi.mocked(authService.verifyOtp).mockRejectedValue(makeAxiosError({ message: 'OTP expirado' }));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole('textbox')[0]);
    await user.keyboard('111111');
    await user.click(screen.getByRole('button', { name: /verificar código/i }));

    expect(await screen.findByText('OTP expirado')).toBeInTheDocument();
  });

  it('reenviar código: llama al servicio y confirma; si falla avisa', async () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    vi.mocked(authService.resendOtp).mockResolvedValueOnce({});
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /reenviar/i }));
    expect(await screen.findByText(/nuevo código reenviado/i)).toBeInTheDocument();
    expect(authService.resendOtp).toHaveBeenCalledWith('ana@gmail.com');

    vi.mocked(authService.resendOtp).mockRejectedValueOnce(new Error('x'));
    await user.click(screen.getByRole('button', { name: /reenviar/i }));
    expect(await screen.findByText(/no se pudo reenviar/i)).toBeInTheDocument();
  });
});
