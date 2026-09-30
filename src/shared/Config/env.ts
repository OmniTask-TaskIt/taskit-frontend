/**
 * Punto único de lectura de variables de entorno.
 *
 * IMPORTANTE sobre el nombre de GITHUB_CLIENT_ID:
 * En Vercel no se pudo guardar la variable como "VITE_GITHUB_CLIENT_ID",
 * así que quedó registrada como "VIT_GITHUB_CLIENT_ID" (sin la E). Para que
 * Vite igual la exponga al bundle del cliente, se agregó "VIT_" a
 * `envPrefix` en vite.config.ts. Por eso aquí se leen ambas variantes: si en
 * algún ambiente (local, otro hosting) sí se puede usar el prefijo completo
 * "VITE_", también funciona sin tocar código.
 */

function readEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = (import.meta.env as Record<string, string | undefined>)[key];
    if (value && value.trim().length > 0) return value;
  }
  return '';
}

export const env = {
  /** Base de la API del backend (AuthAndProfiles), sin el /api/v1 final. */
  apiUrl: readEnv('VITE_API_URL', 'VIT_API_URL') || 'http://localhost:8080',

  googleClientId: readEnv('VITE_GOOGLE_CLIENT_ID', 'VIT_GOOGLE_CLIENT_ID'),

  githubClientId: readEnv('VIT_GITHUB_CLIENT_ID', 'VITE_GITHUB_CLIENT_ID'),

  /**
   * Debe ser EXACTAMENTE igual a una de las "Authorization callback URLs"
   * configuradas en la OAuth App de GitHub, y a `github.redirect-uri` del
   * backend si esa propiedad está configurada. Por defecto se arma con el
   * origin actual, así funciona igual en localhost, previews de Vercel y
   * producción sin tener que declarar la variable en cada uno.
   */
  githubRedirectUri:
    readEnv('VITE_GITHUB_REDIRECT_URI', 'VIT_GITHUB_REDIRECT_URI') ||
    (typeof window !== 'undefined' ? `${window.location.origin}/auth/github/callback` : ''),
};

if (import.meta.env.DEV) {
  if (!env.googleClientId) console.warn('[TaskIt] Falta VITE_GOOGLE_CLIENT_ID: el botón de Google no funcionará.');
  if (!env.githubClientId) console.warn('[TaskIt] Falta VIT_GITHUB_CLIENT_ID: el botón de GitHub no funcionará.');
}
