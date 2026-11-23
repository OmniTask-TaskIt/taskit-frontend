export type AdminTheme = 'light' | 'dark';

/** Clave donde se recuerda la preferencia de tema del panel de administración. */
export const ADMIN_THEME_KEY = 'taskit-admin-theme';

/** El modo oscuro es el predeterminado: solo se usa el claro si el admin lo eligió explícitamente. */
export function readAdminTheme(): AdminTheme {
  try {
    return localStorage.getItem(ADMIN_THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveAdminTheme(theme: AdminTheme): void {
  try {
    localStorage.setItem(ADMIN_THEME_KEY, theme);
  } catch {
    // Sin almacenamiento disponible (modo privado, cuota): el tema solo vale para esta visita.
  }
}
