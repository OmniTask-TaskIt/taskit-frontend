import axios from 'axios';

/**
 * Mensaje legible de un error de la API. El backend responde `{ message }` o `{ error }`
 * (validaciones, reglas de negocio como "Tu identidad ya está verificada."); si no hay
 * ninguno —red caída, 500 sin cuerpo— se usa el texto de respaldo.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: unknown; error?: unknown } | undefined;
    const message = data?.message ?? data?.error;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}
