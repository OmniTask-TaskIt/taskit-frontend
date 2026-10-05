/**
 * Protección CSRF del flujo OAuth de GitHub (parámetro `state`, RFC 6749 §10.12).
 *
 * Al salir hacia GitHub se genera un valor aleatorio y se guarda en
 * sessionStorage; GitHub lo devuelve tal cual en el callback. Si el valor que
 * vuelve no coincide con el guardado, el callback no lo inició este navegador
 * (p. ej. alguien le pasó a la víctima un enlace con el `code` de otra cuenta)
 * y se rechaza sin llamar al backend. El valor es de un solo uso.
 */
const STORAGE_KEY = 'githubOauthState';

export function createOauthState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const state = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  sessionStorage.setItem(STORAGE_KEY, state);
  return state;
}

/** Devuelve true solo si `received` coincide con el valor guardado. Siempre lo consume. */
export function consumeOauthState(received: string | null): boolean {
  const expected = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  return Boolean(expected) && received === expected;
}
