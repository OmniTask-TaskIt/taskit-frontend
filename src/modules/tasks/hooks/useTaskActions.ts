import { useState } from 'react';
import { aitaService } from '../../aita/services/aita.service';
import { taskService } from '../services/taskService';
import type { TaskFormValues } from '../types/task.types';

function readTaskId(data: unknown, fallback?: string): string | null {
  if (fallback?.trim()) return fallback;
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  for (const key of ['taskId', 'id', 'task_id']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return null;
}

function indexTaskQuietly(taskId: string | null, value: TaskFormValues) {
  if (!taskId) return;
  void aitaService.indexTask({
    task_id: taskId,
    task_name: value.title.trim(),
    task_description: value.description.trim(),
    category: value.category,
  }).catch(() => undefined);
}

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
    create: async (value: TaskFormValues) => {
      let created: unknown = null;
      const ok = await run(async () => {
        created = await taskService.createTask(toCreateInput(value));
        indexTaskQuietly(readTaskId(created), value);
      }, 'Tarea publicada correctamente.');
      return ok ? created ?? { taskId: '' } : null;
    },
    update: (id: string, value: TaskFormValues) => run(async () => {
      const updated = await taskService.editTask(id, toEditInput(value));
      indexTaskQuietly(readTaskId(updated, id), value);
    }, 'Tarea actualizada correctamente.'),
    remove: (id: string) => run(() => taskService.deleteTask(id), 'Tarea eliminada.'),
    accept: (id: string) => run(() => taskService.acceptTask(id, { taskAssignee: currentUser }), 'Tarea aceptada.'),
    report: (id: string, reason: string) => run(() => taskService.reportTask(id, { reason }), 'Tarea reportada.'),
    dispute: (id: string, reason: string) => run(() => taskService.disputeTask(id, { reason }), 'Disputa registrada.'),
    approve: (id: string) => run(() => taskService.completeTask(id, { userId: currentUser }), 'Finalización aprobada.'),
  };
}
