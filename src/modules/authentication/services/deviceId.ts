/**
 * Identificador estable de este navegador/dispositivo. Se envía al backend en la cabecera X-Device-Id para que
 * reconozca los dispositivos conocidos: limitar los dispositivos por cuenta (RF-AUTH-13) y avisar solo cuando
 * alguien entra desde un dispositivo nuevo (RF-AUTH-11).
 *
 * Se guarda en una cookie y NO en localStorage a propósito: al cerrar sesión la app hace `localStorage.clear()`, y si el
 * identificador se borrara cada vez, todos los inicios de sesión parecerían de un dispositivo nuevo.
 */
const COOKIE_NAME = 'taskit_device_id';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

let cached: string | null = null;

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function readCookie(): string | null {
  const match = document.cookie.split('; ').find((entry) => entry.startsWith(`${COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.slice(COOKIE_NAME.length + 1)) || null : null;
}

function writeCookie(value: string) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; max-age=${ONE_YEAR_SECONDS}; path=/; SameSite=Lax${secure}`;
}

export const deviceId = {
  get(): string {
    if (cached) return cached;
    let id = readCookie();
    if (!id) {
      id = generateId();
      writeCookie(id);
    }
    // Se recuerda en memoria por si el navegador bloquea las cookies: así al menos es estable durante la visita.
    cached = id;
    return id;
  },

  /** Solo para pruebas: olvida el valor en memoria para volver a leer la cookie. */
  resetCache() {
    cached = null;
  },
};
