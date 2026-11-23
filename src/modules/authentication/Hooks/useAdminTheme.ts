import { useCallback, useState } from 'react';
import { readAdminTheme, saveAdminTheme, type AdminTheme } from '../services/adminTheme';

/** Tema del panel de administración (oscuro por defecto) con la preferencia guardada en el navegador. */
export function useAdminTheme() {
  const [theme, setTheme] = useState<AdminTheme>(readAdminTheme);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: AdminTheme = current === 'dark' ? 'light' : 'dark';
      saveAdminTheme(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
