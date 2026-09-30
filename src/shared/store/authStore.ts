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
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  },

  /**
   * Rol embebido en el claim "role" del access token (SEEKER, PROVIDER o
   * ADMIN). El backend lo agrega al firmar el token (ver JwtService), así
   * que decodificarlo aquí no requiere una llamada extra al backend.
   */
  getRole(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return typeof payload.role === 'string' ? payload.role : null;
    } catch {
      return null;
    }
  },

  isAdmin(): boolean {
    return this.isAuthenticated() && this.getRole() === 'ADMIN';
  },
};