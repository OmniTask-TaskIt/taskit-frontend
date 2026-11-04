import { useState } from 'react';
import { taskService } from '../services/taskService';
import type { TaskFormValues } from '../types/task.types';

export function useTaskActions(reload: () => Promise<void>, currentUser: string) {
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const run = async (action: () => Promise<unknown>, message: string) => {
    try { await action(); setNotice(message); await reload(); return true; }
    catch { setError('La acción no pudo completarse. Revisa el estado de la tarea e inténtalo de nuevo.'); return false; }
  };
  const toCreateInput = (value: TaskFormValues) => ({ taskOwner: currentUser, taskName: value.title.trim(), taskDescription: value.description.trim(), price: Number(value.price), category: value.category });
  const toEditInput = (value: TaskFormValues) => ({ taskName: value.title.trim(), taskDescription: value.description.trim(), price: Number(value.price), category: value.category });
  return {
    notice, setNotice, error, setError,
    create: (value: TaskFormValues) => run(() => taskService.createTask(toCreateInput(value)), 'Tarea publicada correctamente.'),
    update: (id: string, value: TaskFormValues) => run(() => taskService.editTask(id, toEditInput(value)), 'Tarea actualizada correctamente.'),
    remove: (id: string) => run(() => taskService.deleteTask(id), 'Tarea eliminada.'),
    accept: (id: string) => run(() => taskService.acceptTask(id, { taskAssignee: currentUser }), 'Tarea aceptada.'),
    report: (id: string, reason: string) => run(() => taskService.reportTask(id, { reason }), 'Tarea reportada.'),
    dispute: (id: string, reason: string) => run(() => taskService.disputeTask(id, { reason }), 'Disputa registrada.'),
    approve: (id: string) => run(() => taskService.completeTask(id, { userId: currentUser }), 'Finalización aprobada.'),
  };
}
