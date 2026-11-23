import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from './AdminPage';
import { logoutAndRedirect } from '../services/logout';
import { ADMIN_THEME_KEY } from '../services/adminTheme';

vi.mock('../services/logout', () => ({ logoutAndRedirect: vi.fn().mockResolvedValue(undefined) }));

vi.mock('../Components/admin/UsersTab', () => ({ default: () => <div>TAB-USUARIOS</div> }));
vi.mock('../Components/admin/VerificationsTab', () => ({ default: () => <div>TAB-VERIFICACIONES</div> }));
vi.mock('../Components/admin/ReportsTab', () => ({ default: () => <div>TAB-REPORTES-PERFIL</div> }));
vi.mock('../Components/admin/TaskReportsTab', () => ({ default: () => <div>TAB-REPORTES-TAREA</div> }));

describe('AdminPage', () => {
  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('abre en Usuarios y navega entre las pestañas de administración', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );
    expect(screen.getByText('TAB-USUARIOS')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /verificaciones/i }));
    expect(screen.getByText('TAB-VERIFICACIONES')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reportes de perfil/i }));
    expect(screen.getByText('TAB-REPORTES-PERFIL')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reportes de tarea/i }));
    expect(screen.getByText('TAB-REPORTES-TAREA')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /usuarios/i }));
    expect(screen.getByText('TAB-USUARIOS')).toBeInTheDocument();
  });

  it('permite volver al dashboard', () => {
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /volver al dashboard/i })).toHaveAttribute('href', '/dashboard');
  });

  it('arranca en modo oscuro y el botón sol/luna alterna y recuerda el modo', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );
    const root = container.querySelector('.admin-theme');
    const toggle = screen.getByRole('switch', { name: /cambiar a modo día/i });
    expect(root).toHaveAttribute('data-theme', 'dark');
    expect(toggle).toBeChecked();

    await user.click(toggle);
    expect(root).toHaveAttribute('data-theme', 'light');
    expect(screen.getByRole('switch', { name: /cambiar a modo noche/i })).not.toBeChecked();
    expect(localStorage.getItem(ADMIN_THEME_KEY)).toBe('light');

    await user.click(screen.getByRole('switch'));
    expect(root).toHaveAttribute('data-theme', 'dark');
  });

  it('respeta el modo día guardado la próxima vez que se abre el panel', () => {
    localStorage.setItem(ADMIN_THEME_KEY, 'light');
    const { container } = render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );
    expect(container.querySelector('.admin-theme')).toHaveAttribute('data-theme', 'light');
  });

  it('cierra la sesión desde el botón "Cerrar sesión"', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));
    expect(logoutAndRedirect).toHaveBeenCalledTimes(1);
  });
});
