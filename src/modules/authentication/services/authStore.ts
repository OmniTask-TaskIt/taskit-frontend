/**
 * Decodifica el payload de un JWT sin validar la firma (eso lo hace el
 * backend). Los JWT usan base64url ('-' y '_' en vez de '+' y '/'), que
 * `atob` no acepta directamente, así que se normaliza primero.
 */
function readPayload(token: string | null): Record<string, unknown> | null {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const authStore = {
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  clearSession() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
  },

  isAuthenticated(): boolean {
    const payload = readPayload(this.getAccessToken());
    if (!payload || typeof payload.exp !== 'number') return false;
    return Date.now() < payload.exp * 1000;
  },

  /**
   * Rol embebido en el claim "role" del access token (SEEKER, PROVIDER o
   * ADMIN). El backend lo agrega al firmar el token (ver JwtService), así
   * que decodificarlo aquí no requiere una llamada extra al backend.
   */
  getRole(): string | null {
    const payload = readPayload(this.getAccessToken());
    return typeof payload?.role === 'string' ? payload.role : null;
  },

  /**
   * Correo de la sesión. El backend firma ambos tokens con el correo como
   * `sub`, y el endpoint /auth/refresh lo exige en el cuerpo además del
   * refresh token. Se lee del refresh token primero (no expira con el access
   * token) y se cae a `userEmail` de localStorage si no se puede decodificar.
   */
  getEmail(): string | null {
    const fromToken = [this.getRefreshToken(), this.getAccessToken()]
      .map((token) => readPayload(token)?.sub)
      .find((sub): sub is string => typeof sub === 'string' && sub.length > 0);
    return fromToken ?? localStorage.getItem('userEmail');
  },

  isAdmin(): boolean {
    return this.isAuthenticated() && this.getRole() === 'ADMIN';
  },
};