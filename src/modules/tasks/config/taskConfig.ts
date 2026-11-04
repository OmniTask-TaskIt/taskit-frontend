import { env } from '../../authentication/Config/env';
import type { TaskCategory, TaskSort, TaskStatus, TaskTab } from '../types/task.types';

const configuredBase = env.apiUrl.replace(/\/+$/, '');
export const TASKS_API_BASE = `${configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`}/tasks`;

export const TASK_CATEGORIES: { value: TaskCategory | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todas las categorías' },
  { value: 'ARREGLOS', label: 'Arreglos' },
  { value: 'EDUCACION', label: 'Educación' },
];
export const TASK_STATUSES: TaskStatus[] = ['ACTIVE', 'ASSIGNED', 'COMPLETED', 'REPORTED', 'DISPUTED', 'CANCELLED'];
export const STATUS_LABELS: Record<TaskStatus, string> = { ACTIVE: 'Disponible', ASSIGNED: 'Asignada', COMPLETED: 'Completada', REPORTED: 'Reportada', DISPUTED: 'Disputada', CANCELLED: 'Cancelada' };
export const STATUS_COLORS: Record<TaskStatus, string> = { ACTIVE: 'bg-[#e8edff] text-[#263BAA]', ASSIGNED: 'bg-[#fff1d8] text-[#9a5b00]', COMPLETED: 'bg-[#e4f8ed] text-[#177245]', REPORTED: 'bg-[#fff0f2] text-[#b64055]', DISPUTED: 'bg-[#f1eaff] text-[#7650b5]', CANCELLED: 'bg-[#edf0f5] text-[#59647d]' };
export const TASK_TABS: { value: TaskTab; label: string }[] = [{ value: 'explore', label: 'Explorar tareas' }, { value: 'created', label: 'Mis tareas creadas' }, { value: 'assigned', label: 'Tareas asignadas' }, { value: 'completed', label: 'Completadas' }];
export const SORT_OPTIONS: { value: TaskSort; label: string }[] = [{ value: 'recent', label: 'Más recientes' }, { value: 'price', label: 'Precio' }];
