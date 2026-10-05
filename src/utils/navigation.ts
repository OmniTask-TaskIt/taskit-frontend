/**
 * Redirecciones completas (recargan la página), aisladas en funciones para
 * poder reemplazarlas en las pruebas: jsdom no implementa la navegación real.
 */
export function redirectTo(url: string): void {
  window.location.href = url;
}

export function redirectToLogin(): void {
  redirectTo('/login');
}
