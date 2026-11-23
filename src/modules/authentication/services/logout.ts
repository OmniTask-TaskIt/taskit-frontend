import { authService } from './authService';
import { authStore } from './authStore';
import { ADMIN_THEME_KEY } from './adminTheme';
import { redirectToLogin } from '../../../utils/navigation';

function readSavedTheme(): string | null {
  try {
    return localStorage.getItem(ADMIN_THEME_KEY);
  } catch {
    return null;
  }
}

/**
 * Cierra la sesión (RF-AUTH-8): primero revoca los tokens en el backend (hace falta el access token todavía
 * guardado), y pase lo que pase limpia la sesión local y vuelve al login.
 * La preferencia de tema del panel de administración se conserva: no es un dato de la sesión.
 */
export async function logoutAndRedirect(): Promise<void> {
  try {
    await authService.logout();
  } catch {
    // Si el backend no responde (red caída, token ya vencido) la sesión local se cierra igual.
  } finally {
    const savedTheme = readSavedTheme();
    authStore.clearSession();
    localStorage.clear();
    if (savedTheme) {
      try {
        localStorage.setItem(ADMIN_THEME_KEY, savedTheme);
      } catch {
        // Nada que hacer: se volverá al tema predeterminado.
      }
    }
    redirectToLogin();
  }
}
