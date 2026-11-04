import { useEffect, useRef, useState } from 'react';
import { taskService } from '../services/taskService';

export type TaskCategoryOption = { value: string; label: string };

export const useTaskCategories = () => {
  const [categories, setCategories] = useState<TaskCategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let active = true;
    void taskService.getCategories()
      .then((values) => {
        if (!active) return;
        setCategories(values.map((value) => ({ value, label: value })));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return { categories, loading };
};
