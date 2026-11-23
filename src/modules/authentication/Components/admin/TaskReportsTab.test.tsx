import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { adminService } from '../../services/adminService';
import TaskReportsTab from './TaskReportsTab';

vi.mock('../../../tasks/services/taskService', () => ({
  taskService: {
    getCreatedTasks: vi.fn(),
    getAssignedTasks: vi.fn(),
  },
}));

vi.mock('../../services/adminService', () => ({
  adminService: {
    listTaskReports: vi.fn(),
    listTaskReportsByUser: vi.fn(),
    getTaskReportMessages: vi.fn(),
    getTaskReportFiles: vi.fn(),
    deleteTaskReport: vi.fn(),
    getTaskReportCreatedBy: vi.fn(),
    resolveTaskReport: vi.fn(),
  },
}));

vi.mock('../../../chat/services/reportService', () => ({
  reportService: {
    uploadEvidence: vi.fn(),
  },
}));

import { taskService } from '../../../tasks/services/taskService';
import { reportService } from '../../../chat/services/reportService';

describe('TaskReportsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminService.listTaskReports).mockResolvedValue([]);
    vi.mocked(adminService.listTaskReportsByUser).mockResolvedValue([]);
    vi.mocked(adminService.getTaskReportMessages).mockResolvedValue([]);
    vi.mocked(adminService.getTaskReportFiles).mockResolvedValue([]);
    vi.mocked(adminService.deleteTaskReport).mockResolvedValue(undefined);
    vi.mocked(adminService.getTaskReportCreatedBy).mockResolvedValue('');
    vi.mocked(adminService.resolveTaskReport).mockResolvedValue(undefined);
    vi.mocked(taskService.getCreatedTasks).mockResolvedValue([]);
    vi.mocked(taskService.getAssignedTasks).mockResolvedValue([]);
    vi.mocked(reportService.uploadEvidence).mockResolvedValue('https://example.test/file.jpg');
  });

  it('carga todos los reportes al abrir', async () => {
    vi.mocked(adminService.listTaskReports).mockResolvedValue([
      { id: 'report-1', taskId: 'task-7', reason: 'No completó la tarea', users: ['u1', 'u2'] },
    ]);
    vi.mocked(taskService.getCreatedTasks).mockResolvedValue([
      { taskId: 'task-7', taskName: 'Arreglar la puerta', taskDescription: '', taskStatus: 'REPORTED', taskOwner: 'u1', creationDate: '', category: 'ARREGLOS', price: 100, ownerApproval: false, assigneeApproval: false },
    ]);
    render(<TaskReportsTab />);

    expect(await screen.findByText('No completó la tarea')).toBeInTheDocument();
    expect(await screen.findByText('Arreglar la puerta')).toBeInTheDocument();
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

  it('usa el ID fijo de la sesión sin mostrar filtros manuales', async () => {
    vi.mocked(adminService.listTaskReportsByUser).mockResolvedValue([
      { id: 'report-session', taskId: 'task-session', reason: 'Reporte de mi sesión', users: ['session-user'] },
    ]);

    render(<TaskReportsTab fixedUserId="session-user" />);

    expect(await screen.findByText('Reporte de mi sesión')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /filtrar por id de usuario/i })).not.toBeInTheDocument();
    expect(adminService.listTaskReportsByUser).toHaveBeenCalledWith('session-user');
  });

  it('muestra reportes con estilos legibles en modo fijo de sesión', async () => {
    vi.mocked(adminService.listTaskReportsByUser).mockResolvedValue([
      { id: 'report-session', taskId: 'task-session', taskName: 'Reparar equipo', reason: 'Problema visible', users: ['session-user'] },
    ]);

    render(<TaskReportsTab fixedUserId="session-user" />);

    const reason = await screen.findByText('Problema visible');
    expect(reason).toBeInTheDocument();
    expect(reason).toHaveClass('text-adm-text');
    expect(screen.getByText('Reparar equipo')).toBeInTheDocument();
  });

  it('abre los mensajes y archivos adjuntos de un reporte', async () => {
    const user = userEvent.setup();
    vi.mocked(adminService.listTaskReports).mockResolvedValue([
      { id: 'report-1', taskId: 'task-7', taskName: 'Arreglar la puerta', reason: 'Incumplimiento', users: ['u1', 'u2'], createdBy: 'u1' },
    ]);
    vi.mocked(adminService.getTaskReportMessages).mockResolvedValue([
      { messageId: 'm1', chatId: 'chat-1', senderId: 'u1', content: 'No terminé el trabajo', timestamp: '2026-11-20T10:00:00Z' },
    ]);
    vi.mocked(adminService.getTaskReportFiles).mockResolvedValue([
      { taskId: 'task-7', fileName: 'evidencia.jpg', key: 'reports/evidencia.jpg', url: 'https://example.test/evidencia.jpg', size: 2048, lastModified: '2026-11-20T10:00:00Z' },
    ]);
    render(<TaskReportsTab />);

    await user.click(await screen.findByRole('button', { name: 'Ver mensajes' }));
    expect(await screen.findByText('No terminé el trabajo')).toBeInTheDocument();
    expect(adminService.getTaskReportMessages).toHaveBeenCalledWith('report-1');

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    await user.click(screen.getByRole('button', { name: 'Ver archivos adjuntos' }));
    expect(await screen.findByRole('link', { name: /evidencia.jpg/i })).toHaveAttribute('href', 'https://example.test/evidencia.jpg');
    expect(adminService.getTaskReportFiles).toHaveBeenCalledWith('task-7');
  });

  it('oculta agregar y eliminar en el modo administrador', async () => {
    vi.mocked(adminService.listTaskReports).mockResolvedValue([
      { id: 'report-admin', taskId: 'task-7', reason: 'Solo lectura', users: ['u1', 'u2'] },
    ]);
    render(<TaskReportsTab />);

    expect(await screen.findByText('Solo lectura')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agregar archivos' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar reporte' })).not.toBeInTheDocument();
  });

  it('filtra reportes abiertos y resueltos en el panel administrador', async () => {
    const user = userEvent.setup();
    vi.mocked(adminService.listTaskReports).mockResolvedValue([
      { id: 'open-1', taskId: 'task-1', reason: 'Abierto', users: ['u1', 'u2'], status: 'OPEN' },
      { id: 'resolved-1', taskId: 'task-2', reason: 'Resuelto', users: ['u1', 'u2'], status: 'RESOLVED' },
    ]);
    render(<TaskReportsTab />);

    expect(await screen.findByText('Abierto')).toBeInTheDocument();
    expect(screen.queryByText('Resuelto')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Resueltos' }));
    expect(await screen.findByText('Resuelto')).toBeInTheDocument();
    expect(screen.queryByText('Abierto')).not.toBeInTheDocument();
  });

  it('permite resolver un reporte abierto desde el panel administrador', async () => {
    const user = userEvent.setup();
    vi.mocked(adminService.listTaskReports).mockResolvedValue([
      { id: 'open-1', taskId: 'task-1', reason: 'Resolver este reporte', users: ['u1', 'u2'], status: 'OPEN' },
    ]);
    render(<TaskReportsTab />);

    await user.click(await screen.findByRole('button', { name: 'Resolver' }));
    expect(screen.getByRole('heading', { name: /resolver este reporte de tarea/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Resolver reporte' }));

    await waitFor(() => expect(adminService.resolveTaskReport).toHaveBeenCalledWith('open-1'));
    expect(await screen.findByText('Reporte resuelto correctamente.')).toBeInTheDocument();
  });

  it('informa si el backend todavía no tiene disponible el endpoint de estado', async () => {
    const user = userEvent.setup();
    vi.mocked(adminService.listTaskReports).mockResolvedValue([
      { id: 'open-1', taskId: 'task-1', reason: 'Resolver este reporte', users: ['u1', 'u2'], status: 'OPEN' },
    ]);
    vi.mocked(adminService.resolveTaskReport).mockRejectedValue({
      response: { status: 404 },
    });
    render(<TaskReportsTab />);

    await user.click(await screen.findByRole('button', { name: 'Resolver' }));
    await user.click(screen.getByRole('button', { name: 'Resolver reporte' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El backend no tiene disponible el endpoint'
    );
  });

  it('permite agregar archivos usando el reportId del reporte', async () => {
    const user = userEvent.setup();
    vi.mocked(adminService.listTaskReports).mockResolvedValue([
      { id: 'report-1', taskId: 'task-7', taskName: 'Arreglar la puerta', reason: 'Incumplimiento', users: ['u1', 'u2'], createdBy: 'u1' },
    ]);
    vi.mocked(adminService.listTaskReportsByUser).mockResolvedValue([
      { id: 'report-1', taskId: 'task-7', taskName: 'Arreglar la puerta', reason: 'Incumplimiento', users: ['u1', 'u2'], createdBy: 'u1' },
    ]);
    const { container } = render(<TaskReportsTab fixedUserId="u1" />);

    const fileInput = container.querySelector('input[aria-label="Agregar archivos al reporte"]') as HTMLInputElement;
    const file = new File(['contenido'], 'prueba.jpg', { type: 'image/jpeg' });

    await user.click(await screen.findByRole('button', { name: 'Agregar archivos' }));
    await user.upload(fileInput, file);
    await waitFor(() => expect(reportService.uploadEvidence).toHaveBeenCalledWith(file, 'report-1'));
    expect(await screen.findByRole('status')).toHaveTextContent('Archivo agregado al reporte.');
  });

  it('permite agregar archivos a un participante distinto del creador', async () => {
    vi.mocked(adminService.listTaskReportsByUser).mockResolvedValue([
      { id: 'report-1', taskId: 'task-7', reason: 'Incumplimiento', users: ['u1', 'u2'], createdBy: 'u1' },
    ]);
    render(<TaskReportsTab fixedUserId="u2" />);

    expect(await screen.findByRole('button', { name: 'Agregar archivos' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar reporte' })).not.toBeInTheDocument();
  });

  it('filtra reportes abiertos y resueltos en el panel de usuario común', async () => {
    const user = userEvent.setup();
    vi.mocked(adminService.listTaskReportsByUser).mockResolvedValue([
      { id: 'open-1', taskId: 'task-1', reason: 'Reporte abierto', users: ['u1', 'u2'], status: 'OPEN', createdBy: 'u1' },
      { id: 'resolved-1', taskId: 'task-2', reason: 'Reporte resuelto', users: ['u1', 'u2'], status: 'RESOLVED', createdBy: 'u1' },
    ]);
    render(<TaskReportsTab fixedUserId="u1" />);

    expect(await screen.findByText('Reporte abierto')).toBeInTheDocument();
    expect(screen.queryByText('Reporte resuelto')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Resolver' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Resueltos' }));
    expect(await screen.findByText('Reporte resuelto')).toBeInTheDocument();
    expect(screen.queryByText('Reporte abierto')).not.toBeInTheDocument();
  });

  it('pide confirmación antes de eliminar un reporte', async () => {
    const user = userEvent.setup();
    vi.mocked(adminService.listTaskReports).mockResolvedValue([
      { id: 'report-delete', taskId: 'task-7', reason: 'Eliminarme', users: ['u1', 'u2'], createdBy: 'u1' },
    ]);
    vi.mocked(adminService.listTaskReportsByUser).mockResolvedValue([
      { id: 'report-delete', taskId: 'task-7', reason: 'Eliminarme', users: ['u1', 'u2'], createdBy: 'u1' },
    ]);
    render(<TaskReportsTab fixedUserId="u1" />);

    await user.click(await screen.findByRole('button', { name: 'Eliminar reporte' }));
    expect(screen.getByRole('heading', { name: /estás seguro que quieres eliminar este reporte/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sí, eliminar reporte' }));
    await waitFor(() => expect(adminService.deleteTaskReport).toHaveBeenCalledWith('report-delete', 'u1'));
    expect(await screen.findByText('Reporte eliminado correctamente.')).toBeInTheDocument();
  });
});
