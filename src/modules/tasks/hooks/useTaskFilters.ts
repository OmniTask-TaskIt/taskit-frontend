import { useMemo, useState } from 'react';
import type { Task, TaskFilters, TaskTab } from '../types/task.types';

export function useTaskFilters(tasks: Task[], currentUser: string, initialTab: TaskTab = 'explore') {
  const [filters, setFilters] = useState<TaskFilters>({ query: '', category: 'ALL', minPrice: '', maxPrice: '', sort: 'recent' });
  const [tab, setTab] = useState<TaskTab>(initialTab);
  const owned = tasks.filter((task) => task.ownerId === currentUser);
  const assigned = tasks.filter((task) => task.assigneeId === currentUser);
  const completed = tasks.filter((task) => task.status === 'COMPLETED' && (task.ownerId === currentUser || task.assigneeId === currentUser));
  const visibleTasks = useMemo(() => {
    const result = tab === 'created' ? owned : tab === 'assigned' ? assigned : tab === 'completed' ? completed : tasks.filter((task) => task.ownerId !== currentUser && task.status === 'ACTIVE');
    const query = filters.query.trim().toLowerCase();
    return [...result].filter((task) => (!query || `${task.title} ${task.description}`.toLowerCase().includes(query)) && (filters.category === 'ALL' || task.category === filters.category) && (!filters.minPrice || task.price >= Number(filters.minPrice)) && (!filters.maxPrice || task.price <= Number(filters.maxPrice))).sort((a, b) => filters.sort === 'price' ? a.price - b.price : new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }, [assigned, completed, currentUser, filters, owned, tab, tasks]);
  return { filters, setFilters, tab, setTab, visibleTasks, owned, assigned, completed };
}
