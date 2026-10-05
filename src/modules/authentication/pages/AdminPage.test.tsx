import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from './AdminPage';

vi.mock('../Components/admin/UsersTab', () => ({ default: () => <div>TAB-USUARIOS</div> }));
vi.mock('../Components/admin/VerificationsTab', () => ({ default: () => <div>TAB-VERIFICACIONES</div> }));
vi.mock('../Components/admin/ReportsTab', () => ({ default: () => <div>TAB-REPORTES</div> }));

describe('AdminPage', () => {
  it('abre en Usuarios y navega entre las tres pestañas', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );
    expect(screen.getByText('TAB-USUARIOS')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /verificaciones/i }));
    expect(screen.getByText('TAB-VERIFICACIONES')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reportes/i }));
    expect(screen.getByText('TAB-REPORTES')).toBeInTheDocument();

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
});
