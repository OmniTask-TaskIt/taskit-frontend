import { useEffect, useState } from 'react';
import { taskService } from '../services/taskService';

type CategoryOption = string;

export const useTaskCategories = () => {
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([
    { value: 'ALL', label: 'Todas las categorías' }
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await taskService.getCategories();

        console.log('[useTaskCategories] Categorías:', response);

        const formattedCategories = response.map((category: CategoryOption) => ({
          value: category,
          label: category,
        }));

        setCategories([
          { value: 'ALL', label: 'Todas las categorías' },
          ...formattedCategories,
        ]);
      } catch (error) {
        console.error('Error cargando categorías:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};
