import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { registerMessages, useRegister } from './useRegister';
import { authService } from '../services/authService';
import { makeAxiosError } from '../../../test/helpers';

vi.mock('../services/authService', () => ({ authService: { register: vi.fn() } }));

function LocationProbe() {
  return <div data-testid="location">{useLocation().pathname}</div>;
}
const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/register']}>
    <LocationProbe />
    {children}
  </MemoryRouter>
);

const change = (name: string, value: string, type = 'text') =>
  ({ target: { name, value, type, checked: value === 'true' } }) as unknown as ChangeEvent<HTMLInputElement>;
const submit = () => ({ preventDefault: () => {} }) as FormEvent;

/** Llena el formulario; cada campo va en su propio act() porque el hook usa estado no funcional. */
function setup(fields: Partial<{ name: string; email: string; password: string; terms: boolean }> = {}) {
  const { name = 'Ana', email = 'ana@gmail.com', password = 'Secreta1!', terms = true } = fields;
  const hook = renderHook(() => useRegister(), { wrapper });
  act(() => hook.result.current.handleChange(change('name', name)));
  act(() => hook.result.current.handleChange(change('email', email)));
  act(() => hook.result.current.handleChange(change('password', password)));
  if (terms) act(() => hook.result.current.handleChange(change('acceptedTerms', 'true', 'checkbox')));
  return hook;
}

describe('useRegister', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('valida formato de correo y contraseña en vivo', () => {
    const { result } = setup({ email: 'no-es-correo', password: 'abc' });

    expect(result.current.isEmailValid).toBe(false);
    expect(result.current.isPasswordValid).toBe(false);

    act(() => result.current.handleChange(change('email', 'ana@gmail.com')));
    act(() => result.current.handleChange(change('password', 'Secreta1!')));

    expect(result.current.isEmailValid).toBe(true);
    expect(result.current.isPasswordValid).toBe(true);
  });

  it('no registra si no se aceptaron los Términos', async () => {
    const { result } = setup({ terms: false });

    await act(() => result.current.handleSubmit(submit()));

    expect(result.current.error).toMatch(/debe aceptar los términos/i);
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('no registra con un correo inválido', async () => {
    const { result } = setup({ email: 'ana@' });

    await act(() => result.current.handleSubmit(submit()));

    expect(result.current.error).toBe(registerMessages.emailRegex);
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('no registra con una contraseña débil', async () => {
    const { result } = setup({ password: 'abcdefgh' });

    await act(() => result.current.handleSubmit(submit()));

    expect(result.current.error).toBe(registerMessages.passwordRegex);
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('registro exitoso: envía los datos, recuerda el correo y navega a /verify-otp', async () => {
    vi.mocked(authService.register).mockResolvedValue({});
    const { result } = setup();
    act(() => result.current.setRole('PROVIDER'));

    await act(() => result.current.handleSubmit(submit()));

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'ana@gmail.com',
      password: 'Secreta1!',
      role: 'PROVIDER',
      acceptedTerms: true,
    });
    expect(localStorage.getItem('userEmail')).toBe('ana@gmail.com');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/verify-otp'));
  });

  it.each([
    ['cuerpo REAL del backend (message = detalle, error = etiqueta)', { error: 'Petición inválida', message: 'El usuario ya está registrado.' }],
    ['cuerpo antiguo (solo error)', { error: 'El correo ya está registrado' }],
  ])('correo ya registrado, %s: avisa y redirige al LOGIN', async (_nombre, body) => {
    vi.mocked(authService.register).mockRejectedValue(makeAxiosError(body, 400));
    const { result } = setup();

    await act(() => result.current.handleSubmit(submit()));

    expect(result.current.error).toMatch(/ya está registrado/i);
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/login'), { timeout: 3000 });
  });

  it('un error de validación muestra el detalle (message), no la etiqueta genérica', async () => {
    vi.mocked(authService.register).mockRejectedValue(
      makeAxiosError({ error: 'Error de validación', message: 'La contraseña no cumple los requisitos' }, 400)
    );
    const { result } = setup();

    await act(() => result.current.handleSubmit(submit()));

    expect(result.current.error).toBe('La contraseña no cumple los requisitos');
  });

  it('error del servidor: muestra su mensaje; error desconocido: mensaje genérico', async () => {
    vi.mocked(authService.register).mockRejectedValueOnce(makeAxiosError({ message: 'Servicio de correo caído' }, 502));
    const { result } = setup();

    await act(() => result.current.handleSubmit(submit()));
    expect(result.current.error).toBe('Servicio de correo caído');

    vi.mocked(authService.register).mockRejectedValueOnce(new Error('boom'));
    await act(() => result.current.handleSubmit(submit()));
    expect(result.current.error).toBe('Ocurrió un error inesperado.');
    expect(result.current.loading).toBe(false);
  });
});
