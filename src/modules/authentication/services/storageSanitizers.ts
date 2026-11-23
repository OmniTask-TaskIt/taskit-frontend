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
const UNSAFE_EMAIL_CHAR = /[\s<>"'`\\]/;

/** Token JWT u opaco: solo caracteres base64url/base64 y puntos, con un tamaño razonable. */
export function sanitizeToken(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (value.length === 0 || value.length > MAX_TOKEN_LENGTH) return null;
  return TOKEN_CHAR.test(value) ? value : null;
}

/** Correo con una sola arroba, dominio con punto y sin espacios ni caracteres de marcado. */
export function sanitizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim();
  if (email.length === 0 || email.length > MAX_EMAIL_LENGTH) return null;
  if (UNSAFE_EMAIL_CHAR.test(email)) return null;

  const at = email.indexOf('@');
  if (at < 1 || at !== email.lastIndexOf('@')) return null;

  const domain = email.slice(at + 1);
  const dot = domain.lastIndexOf('.');
  return dot > 0 && dot < domain.length - 1 ? email : null;
}

/** Identificador opaco (challengeId, etc.): letras, números, guion, guion bajo, punto y dos puntos. */
export function sanitizeId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (value.length === 0 || value.length > MAX_ID_LENGTH) return null;
  return ID_CHAR.test(value) ? value : null;
}
