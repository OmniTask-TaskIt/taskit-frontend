import { useCallback, useEffect, useState } from 'react';
import { taskService } from '../services/taskService';
import type { Task } from '../types/task.types';

export function useTasks(userId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!userId) { setError('No encontramos tu usuario autenticado. Inicia sesión nuevamente.'); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const [feed, created, assigned, completed] = await Promise.all([
        taskService.getTaskFeed(), taskService.getCreatedTasks(userId), taskService.getAssignedTasks(userId), taskService.getCompletedTasks(userId),
      ]);
      const unique = new Map([...feed, ...created, ...assigned, ...completed].map((task) => [task.taskId, task]));
      setTasks([...unique.values()]);
    } catch (requestError) {
      const status = (requestError as { response?: { status?: number } }).response?.status;
      setError(status === 401 ? 'Tu sesión expiró. Inicia sesión nuevamente.' : status === 403 ? 'No tienes permisos para consultar tus tareas.' : status === 404 ? 'El servicio de tareas no está disponible.' : status && status >= 500 ? 'Tareas-Central no está disponible en este momento.' : 'No pudimos conectar con Tareas-Central.');
    } finally { setLoading(false); }
  }, [userId]);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);
  return { tasks, setTasks, loading, error, setError, load };
}
