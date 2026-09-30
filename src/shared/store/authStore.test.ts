import { beforeEach, describe, expect, it } from 'vitest';
import { authStore } from './authStore';

function makeJwt(expiresInSeconds: number, role?: string): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: 'test@taskit.com',
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
      ...(role ? { role } : {}),
    })
  );
  return `${header}.${payload}.signature`;
}

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('guarda y devuelve accessToken/refreshToken', () => {
    authStore.setTokens('access-123', 'refresh-456');

    expect(authStore.getAccessToken()).toBe('access-123');
    expect(authStore.getRefreshToken()).toBe('refresh-456');
  });

  it('limpia toda la sesión con clearSession', () => {
    authStore.setTokens('access-123', 'refresh-456');
    localStorage.setItem('userEmail', 'demo@taskit.com');

    authStore.clearSession();

    expect(authStore.getAccessToken()).toBeNull();
    expect(authStore.getRefreshToken()).toBeNull();
    expect(localStorage.getItem('userEmail')).toBeNull();
  });

  it('isAuthenticated() es false cuando no hay token', () => {
    expect(authStore.isAuthenticated()).toBe(false);
  });

  it('isAuthenticated() es true con un JWT vigente', () => {
    authStore.setTokens(makeJwt(3600), 'refresh');
    expect(authStore.isAuthenticated()).toBe(true);
  });

  it('isAuthenticated() es false con un JWT expirado', () => {
    authStore.setTokens(makeJwt(-3600), 'refresh');
    expect(authStore.isAuthenticated()).toBe(false);
  });

  it('isAuthenticated() es false con un token malformado', () => {
    authStore.setTokens('esto-no-es-un-jwt', 'refresh');
    expect(authStore.isAuthenticated()).toBe(false);
  });

  it('getRole() lee el claim "role" del access token', () => {
    authStore.setTokens(makeJwt(3600, 'ADMIN'), 'refresh');
    expect(authStore.getRole()).toBe('ADMIN');
  });

  it('getRole() es null si el token no trae claim de rol (p.ej. un refresh token)', () => {
    authStore.setTokens(makeJwt(3600), 'refresh');
    expect(authStore.getRole()).toBeNull();
  });

  it('isAdmin() es true solo con un token vigente y rol ADMIN', () => {
    authStore.setTokens(makeJwt(3600, 'ADMIN'), 'refresh');
    expect(authStore.isAdmin()).toBe(true);
  });

  it('isAdmin() es false para un usuario SEEKER', () => {
    authStore.setTokens(makeJwt(3600, 'SEEKER'), 'refresh');
    expect(authStore.isAdmin()).toBe(false);
  });

  it('isAdmin() es false si el token de rol ADMIN ya expiró', () => {
    authStore.setTokens(makeJwt(-3600, 'ADMIN'), 'refresh');
    expect(authStore.isAdmin()).toBe(false);
  });
});
