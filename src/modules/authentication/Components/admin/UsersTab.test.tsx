import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsersTab from './UsersTab';
import { adminService } from '../../services/adminService';
import type { AdminUser } from '../../types/admin.types';

vi.mock('../../services/adminService', async () => {
  const actual = await vi.importActual<typeof import('../../services/adminService')>('../../services/adminService');
  return { ...actual, adminService: { listUsers: vi.fn(), updateUserStatus: vi.fn() } };
});

const activeUser: AdminUser = {
  id: 'u1',
  email: 'robin@taskit.com',
  name: 'Robin',
  role: 'SEEKER',
  authProvider: 'LOCAL',
  accountStatus: 'ACTIVE',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('UsersTab', () => {
  afterEach(() => vi.clearAllMocks());

  it('lista los usuarios y permite suspender a uno activo con un motivo', async () => {
    vi.mocked(adminService.listUsers).mockResolvedValue({
      content: [activeUser],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    vi.mocked(adminService.updateUserStatus).mockResolvedValue({ ...activeUser, accountStatus: 'SUSPENDED' });

    const user = userEvent.setup();
    render(<UsersTab />);

    expect(await screen.findByText('Robin')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /suspender/i }));
    await user.type(screen.getByRole('textbox', { name: /motivo/i }), 'Reportes acumulados');
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }));

    expect(adminService.updateUserStatus).toHaveBeenCalledWith('u1', 'SUSPENDED', 'Reportes acumulados');
    expect(await screen.findByText('Suspendida')).toBeInTheDocument();
  });

  it('muestra un mensaje cuando no hay usuarios', async () => {
    vi.mocked(adminService.listUsers).mockResolvedValue({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });

    render(<UsersTab />);

    expect(await screen.findByText(/no se encontraron usuarios/i)).toBeInTheDocument();
  });
});
