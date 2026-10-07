import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TwoFactorSection from './TwoFactorSection';
import { twoFactorService } from '../../services/twoFactorService';
import { makeAxiosError } from '../../../../test/helpers';

vi.mock('../../services/twoFactorService', () => ({
  twoFactorService: {
    status: vi.fn(),
    requestEnable: vi.fn(),
    confirmEnable: vi.fn(),
    requestDisable: vi.fn(),
    confirmDisable: vi.fn(),
  },
}));

const codeInput = () => screen.getByLabelText(/código de verificación/i);

describe('TwoFactorSection (RF-AUTH-9)', () => {
  afterEach(() => vi.clearAllMocks());

  it('muestra el estado desactivado y ofrece activar', async () => {
    vi.mocked(twoFactorService.status).mockResolvedValue(false);
    render(<TwoFactorSection />);

    expect(await screen.findByText('Desactivada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Activar' })).toBeInTheDocument();
  });

  it('activa en dos pasos: pide el código, lo confirma y queda activada', async () => {
    vi.mocked(twoFactorService.status).mockResolvedValue(false);
    vi.mocked(twoFactorService.requestEnable).mockResolvedValue({ message: 'Te enviamos un código a tu correo.' });
    vi.mocked(twoFactorService.confirmEnable).mockResolvedValue({ message: 'Verificación en dos pasos activada.' });
    const user = userEvent.setup();
    render(<TwoFactorSection />);

    await user.click(await screen.findByRole('button', { name: 'Activar' }));
    expect(await screen.findByText('Te enviamos un código a tu correo.')).toBeInTheDocument();

    await user.type(codeInput(), '123456');
    await user.click(screen.getByRole('button', { name: /confirmar y activar/i }));

    expect(twoFactorService.confirmEnable).toHaveBeenCalledWith('123456');
    expect(await screen.findByText('Activada')).toBeInTheDocument();
    expect(screen.getByText('Verificación en dos pasos activada.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Desactivar' })).toBeInTheDocument();
  });

  it('desactiva en dos pasos: pide el código, lo confirma y queda desactivada', async () => {
    vi.mocked(twoFactorService.status).mockResolvedValue(true);
    vi.mocked(twoFactorService.requestDisable).mockResolvedValue({ message: 'Código enviado.' });
    vi.mocked(twoFactorService.confirmDisable).mockResolvedValue({ message: 'Verificación en dos pasos desactivada.' });
    const user = userEvent.setup();
    render(<TwoFactorSection />);

    expect(await screen.findByText('Activada')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Desactivar' }));
    await user.type(await screen.findByLabelText(/código de verificación/i), '654321');
    await user.click(screen.getByRole('button', { name: /confirmar y desactivar/i }));

    expect(twoFactorService.confirmDisable).toHaveBeenCalledWith('654321');
    expect(await screen.findByText('Desactivada')).toBeInTheDocument();
  });

  it('exige los 6 dígitos antes de confirmar', async () => {
    vi.mocked(twoFactorService.status).mockResolvedValue(false);
    vi.mocked(twoFactorService.requestEnable).mockResolvedValue({ message: 'Código enviado.' });
    const user = userEvent.setup();
    render(<TwoFactorSection />);

    await user.click(await screen.findByRole('button', { name: 'Activar' }));
    await user.type(await screen.findByLabelText(/código de verificación/i), '12');
    await user.click(screen.getByRole('button', { name: /confirmar y activar/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/6 dígitos/i);
    expect(twoFactorService.confirmEnable).not.toHaveBeenCalled();
  });

  it('un código incorrecto muestra el error y deja reintentar', async () => {
    vi.mocked(twoFactorService.status).mockResolvedValue(false);
    vi.mocked(twoFactorService.requestEnable).mockResolvedValue({ message: 'Código enviado.' });
    vi.mocked(twoFactorService.confirmEnable).mockRejectedValue(makeAxiosError({ message: 'Código inválido o expirado' }, 400));
    const user = userEvent.setup();
    render(<TwoFactorSection />);

    await user.click(await screen.findByRole('button', { name: 'Activar' }));
    await user.type(await screen.findByLabelText(/código de verificación/i), '000000');
    await user.click(screen.getByRole('button', { name: /confirmar y activar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Código inválido o expirado');
    expect(codeInput()).toBeInTheDocument();
  });

  it('si no se pudo enviar el código lo avisa y no abre el formulario', async () => {
    vi.mocked(twoFactorService.status).mockResolvedValue(false);
    vi.mocked(twoFactorService.requestEnable).mockRejectedValue(new Error('Network Error'));
    const user = userEvent.setup();
    render(<TwoFactorSection />);

    await user.click(await screen.findByRole('button', { name: 'Activar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo enviar el código/i);
    expect(screen.queryByLabelText(/código de verificación/i)).not.toBeInTheDocument();
  });

  it('cancelar vuelve al estado inicial', async () => {
    vi.mocked(twoFactorService.status).mockResolvedValue(false);
    vi.mocked(twoFactorService.requestEnable).mockResolvedValue({ message: 'Código enviado.' });
    const user = userEvent.setup();
    render(<TwoFactorSection />);

    await user.click(await screen.findByRole('button', { name: 'Activar' }));
    await user.click(await screen.findByRole('button', { name: /cancelar/i }));

    expect(screen.getByRole('button', { name: 'Activar' })).toBeInTheDocument();
    expect(screen.queryByLabelText(/código de verificación/i)).not.toBeInTheDocument();
  });

  it('si falla la consulta del estado muestra el error', async () => {
    vi.mocked(twoFactorService.status).mockRejectedValue(new Error('Network Error'));
    render(<TwoFactorSection />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo consultar el estado/i);
  });
});
