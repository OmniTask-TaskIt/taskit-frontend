/**
 * Validadores para todo lo que viene de una respuesta del servidor y se guarda en localStorage/sessionStorage.
 * Un servidor comprometido (o una respuesta manipulada) podría devolver cualquier cosa; antes de persistirlo se
 * comprueba que tenga la forma esperada. Si no la tiene, devuelven null y quien llama no guarda nada.
 *
 * Se evitan las regex con cuantificadores anidados para no introducir backtracking super-lineal.
 */
const MAX_TOKEN_LENGTH = 8192;
const MAX_EMAIL_LENGTH = 254;
const MAX_ID_LENGTH = 128;

const TOKEN_CHAR = /^[\w.~+/=-]+$/;
const ID_CHAR = /^[\w.:-]+$/;
// Parte local, una arroba y un dominio con al menos un punto. Los segmentos del dominio no admiten '.', así que no hay
// ambigüedad entre cuantificadores y la regex se evalúa en tiempo lineal.
const EMAIL_PATTERN = /^[^\s@<>"'`\\]+@[^\s@.<>"'`\\]+(?:\.[^\s@.<>"'`\\]+)+$/;

/** Token JWT u opaco: solo caracteres base64url/base64 y puntos, con un tamaño razonable. */
export function sanitizeToken(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (value.length === 0 || value.length > MAX_TOKEN_LENGTH) return null;
  return TOKEN_CHAR.test(value) ? value : null;
}

/** Correo con una sola arroba, dominio con punto y sin espacios ni caracteres de marcado. No se recorta ni se transforma. */
export function sanitizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (value.length === 0 || value.length > MAX_EMAIL_LENGTH) return null;
  return EMAIL_PATTERN.test(value) ? value : null;
}

/** Identificador opaco (challengeId, etc.): letras, números, guion, guion bajo, punto y dos puntos. */
export function sanitizeId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (value.length === 0 || value.length > MAX_ID_LENGTH) return null;
  return ID_CHAR.test(value) ? value : null;
}
