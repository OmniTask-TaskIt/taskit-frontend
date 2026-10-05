import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import SelectRolePage from './SelectRolePage';
import { authService } from '../services/authService';
import { authStore } from '../services/authStore';

vi.mock('../services/authService', () => ({ authService: { switchRole: vi.fn() } }));

function LocationProbe() {
  return <div data-testid="location">{useLocation().pathname}</div>;
}
function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/select-role']}>
      <LocationProbe />
      <Routes>
        <Route path="/select-role" element={<SelectRolePage />} />
        <Route path="*" element={null} />
      </Routes>
    </MemoryRouter>
  );
}

describe('SelectRolePage', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it.each([
    ['Demandante', 'SEEKER'],
    ['Prestador', 'PROVIDER'],
  ])('elegir "%s" cambia el rol a %s, guarda los tokens nuevos y va al dashboard', async (label, role) => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    vi.mocked(authService.switchRole).mockResolvedValue({ accessToken: 'acc-nuevo', refreshToken: 'ref-nuevo' });
    renderPage();

    await userEvent.click(screen.getByText(label));

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/dashboard'));
    expect(authService.switchRole).toHaveBeenCalledWith('ana@gmail.com', role);
    expect(authStore.getAccessToken()).toBe('acc-nuevo');
    expect(authStore.getRefreshToken()).toBe('ref-nuevo');
  });

  it('sin correo de sesión avisa y no llama al backend', async () => {
    renderPage();

    await userEvent.click(screen.getByText('Demandante'));

    expect(screen.getByText(/no se encontró el correo de sesión/i)).toBeInTheDocument();
    expect(authService.switchRole).not.toHaveBeenCalled();
  });

  it('si el backend falla muestra el error y se queda en la pantalla', async () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(authService.switchRole).mockRejectedValue(new Error('500'));
    renderPage();

    await userEvent.click(screen.getByText('Prestador'));

    expect(await screen.findByText(/no se pudo asignar el rol/i)).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/select-role');
  });
});
