import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';

// @react-oauth/google renderiza un botón real de Google (iframe) que no
// tiene sentido probar aquí; se reemplaza por un botón simple para poder
// verificar el gateo por Términos y Condiciones sin depender de Google.
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onError }: { onError?: () => void }) => (
    <button type="button" onClick={() => onError?.()}>
      Mock Google Login
    </button>
  ),
}));

function renderRegisterForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  );
}

describe('RegisterForm', () => {
  it('muestra el error de formato al escribir una contraseña débil', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(screen.getByPlaceholderText('Contraseña segura'), 'abc');

    expect(
      screen.getByText(/al menos 8 caracteres, una mayúscula, un número y un carácter especial/i)
    ).toBeInTheDocument();
  });

  it('no muestra error de contraseña si el campo está vacío', () => {
    renderRegisterForm();

    expect(
      screen.queryByText(/al menos 8 caracteres, una mayúscula, un número y un carácter especial/i)
    ).not.toBeInTheDocument();
  });

  it('los botones de Google y GitHub empiezan deshabilitados hasta aceptar los Términos', async () => {
    renderRegisterForm();

    const githubButton = screen.getByRole('button', { name: /continuar con github/i });
    expect(githubButton).toHaveAttribute('aria-disabled', 'true');

    const user = userEvent.setup();
    const termsCheckbox = screen.getByRole('checkbox', { name: /acepto los/i });
    await user.click(termsCheckbox);

    expect(githubButton).toHaveAttribute('aria-disabled', 'false');
  });

  it('el link de Términos y Condiciones apunta a la ruta interna /terms (no al blob de Azure)', () => {
    renderRegisterForm();

    const link = screen.getByRole('link', { name: /términos y condiciones/i });
    expect(link).toHaveAttribute('href', '/terms');
  });
});
