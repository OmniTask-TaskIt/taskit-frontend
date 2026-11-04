import { useCallback, useEffect, useState } from 'react';
import { TASKS_API_BASE, TASKS_API_CONFIG_ERROR } from '../config/taskConfig';
import { taskService } from '../services/taskService';
import type { Task } from '../types/task.types';

export function useTasks(userId: string, categories: string[], categoriesLoading: boolean) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (categoriesLoading) return;
    if (!TASKS_API_BASE) { setError(TASKS_API_CONFIG_ERROR); setLoading(false); return; }
    if (categories.length === 0) { setError('No hay categorías disponibles para cargar las tareas.'); setLoading(false); return; }
    if (!userId) { setError('No encontramos tu usuario autenticado. Inicia sesión nuevamente.'); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const [feed, created, assigned, completed] = await Promise.all([
        taskService.getTaskFeed(categories), taskService.getCreatedTasks(userId), taskService.getAssignedTasks(userId), taskService.getCompletedTasks(userId),
      ]);
      const unique = new Map([...feed, ...created, ...assigned, ...completed].map((task) => [task.taskId, task]));
      setTasks([...unique.values()]);
    } catch {
      setError('Ocurrió un problema al cargar las tareas. Intenta nuevamente.');
    } finally { setLoading(false); }
  }, [categories, categoriesLoading, userId]);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);
  return { tasks, setTasks, loading, error, setError, load };
}
