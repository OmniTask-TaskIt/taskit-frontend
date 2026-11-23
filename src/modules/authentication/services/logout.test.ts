import { afterEach, describe, expect, it, vi } from 'vitest';
import { logoutAndRedirect } from './logout';
import { authService } from './authService';
import { authStore } from './authStore';
import { ADMIN_THEME_KEY } from './adminTheme';
import { redirectToLogin } from '../../../utils/navigation';

vi.mock('./authService', () => ({ authService: { logout: vi.fn() } }));
vi.mock('../../../utils/navigation', () => ({ redirectToLogin: vi.fn() }));

describe('logoutAndRedirect', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('revoca la sesión en el backend, limpia el almacenamiento y va al login', async () => {
    vi.mocked(authService.logout).mockResolvedValue(undefined);
    localStorage.setItem('accessToken', 'a.b.c');
    localStorage.setItem('otraCosa', 'x');

    await logoutAndRedirect();

    expect(authService.logout).toHaveBeenCalled();
    expect(authStore.getAccessToken()).toBeNull();
    expect(localStorage.getItem('otraCosa')).toBeNull();
    expect(redirectToLogin).toHaveBeenCalled();
  });

  it('cierra la sesión local aunque el backend falle', async () => {
    vi.mocked(authService.logout).mockRejectedValue(new Error('sin red'));
    localStorage.setItem('accessToken', 'a.b.c');

    await logoutAndRedirect();

    expect(authStore.getAccessToken()).toBeNull();
    expect(redirectToLogin).toHaveBeenCalled();
  });

  it('conserva la preferencia de tema del panel de administración', async () => {
    vi.mocked(authService.logout).mockResolvedValue(undefined);
    localStorage.setItem(ADMIN_THEME_KEY, 'light');

    await logoutAndRedirect();

    expect(localStorage.getItem(ADMIN_THEME_KEY)).toBe('light');
  });
});
