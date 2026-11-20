import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { adminService } from '../../services/adminService';
import TaskReportsTab from './TaskReportsTab';

vi.mock('../../services/adminService', () => ({
  adminService: {
    listTaskReports: vi.fn(),
    listTaskReportsByUser: vi.fn(),
  },
}));

describe('TaskReportsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminService.listTaskReports).mockResolvedValue([]);
    vi.mocked(adminService.listTaskReportsByUser).mockResolvedValue([]);
  });

  it('carga todos los reportes al abrir', async () => {
    vi.mocked(adminService.listTaskReports).mockResolvedValue([
      { id: 'report-1', taskId: 'task-7', reason: 'No completó la tarea', users: ['u1', 'u2'] },
    ]);
    render(<TaskReportsTab />);

    expect(await screen.findByText('No completó la tarea')).toBeInTheDocument();
    expect(screen.getByText('task-7')).toBeInTheDocument();
    expect(screen.getByText('Participantes: u1, u2')).toBeInTheDocument();
    expect(adminService.listTaskReports).toHaveBeenCalledOnce();
  });

  it('filtra los reportes por ID del usuario', async () => {
    const user = userEvent.setup();
    vi.mocked(adminService.listTaskReportsByUser).mockResolvedValue([
      { id: 'report-2', taskId: 'task-9', reason: 'Problema reportado', users: ['user-42'] },
    ]);
    render(<TaskReportsTab />);

    const field = screen.getByRole('textbox', { name: /filtrar por id de usuario/i });
    await user.type(field, 'user-42');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => expect(adminService.listTaskReportsByUser).toHaveBeenCalledWith('user-42'));
    expect(await screen.findByText('Problema reportado')).toBeInTheDocument();
    expect(screen.getByText('user-42')).toBeInTheDocument();
  });
});
