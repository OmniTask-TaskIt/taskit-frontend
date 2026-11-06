import { useEffect, useRef, useState } from 'react';
import { taskService } from '../services/taskService';

export type TaskCategoryOption = { value: string; label: string };

export const useTaskCategories = () => {
  const [categories, setCategories] = useState<TaskCategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestRef = useRef<Promise<string[]> | null>(null);

  useEffect(() => {
    let active = true;
    const request = requestRef.current ?? taskService.getCategories();
    requestRef.current = request;

    request
      .then((values) => {
        if (!active) return;
        setCategories(values.map((value) => ({ value, label: value })));
        setError('');
      })
      .catch(() => {
        if (active) setError('Ocurrió un problema al cargar las categorías. Intenta nuevamente.');
      })
      .finally(() => {
        if (requestRef.current === request) requestRef.current = null;
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { categories, loading, error };
};
