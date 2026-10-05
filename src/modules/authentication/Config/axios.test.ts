import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { axiosInstance } from './axios';
import { authStore } from '../services/authStore';
import { makeJwt } from '../../../test/helpers';
import { redirectToLogin } from '../../../utils/navigation';

vi.mock('../../../utils/navigation', () => ({ redirectToLogin: vi.fn() }));

const ok = (config: InternalAxiosRequestConfig, data: unknown = {}) =>
  Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config });

const unauthorized = (config: InternalAxiosRequestConfig) =>
  Promise.reject(
    new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
      status: 401,
      statusText: 'Unauthorized',
      data: {},
      headers: {},
      config,
    })
  );

describe('axiosInstance', () => {
  const originalAdapter = axiosInstance.defaults.adapter;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    axiosInstance.defaults.adapter = originalAdapter;
    delete axiosInstance.defaults.headers.common['Authorization'];
    vi.restoreAllMocks();
    vi.mocked(redirectToLogin).mockClear();
  });

  it('agrega el header Authorization cuando hay access token', async () => {
    authStore.setTokens('access-abc', 'refresh-abc');
    let seen: string | undefined;
    axiosInstance.defaults.adapter = ((config) => {
      seen = config.headers.Authorization as string;
      return ok(config);
    }) as AxiosAdapter;

    await axiosInstance.get('/profiles/1');

    expect(seen).toBe('Bearer access-abc');
  });

  it('no agrega Authorization si no hay sesión', async () => {
    let seen: unknown = 'sin-llamar';
    axiosInstance.defaults.adapter = ((config) => {
      seen = config.headers.Authorization;
      return ok(config);
    }) as AxiosAdapter;

    await axiosInstance.get('/profiles/search');

    expect(seen).toBeUndefined();
  });

  it('ante un 401 renueva el token enviando email + refreshToken y reintenta la petición', async () => {
    const refreshToken = makeJwt({ sub: 'robin@taskit.com' });
    authStore.setTokens('access-viejo', refreshToken);

    const post = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { accessToken: 'access-nuevo', refreshToken },
    });
    const calls: string[] = [];
    axiosInstance.defaults.adapter = ((config) => {
      calls.push(config.headers.Authorization as string);
      return config.headers.Authorization === 'Bearer access-nuevo'
        ? ok(config, { ok: true })
        : unauthorized(config);
    }) as AxiosAdapter;

    const response = await axiosInstance.get('/profiles/me');

    // El backend (RefreshTokenRequestDTO) exige `email`: sin él responde 400 y el refresh nunca funciona.
    expect(post).toHaveBeenCalledWith(expect.stringMatching(/\/api\/v1\/auth\/refresh$/), {
      email: 'robin@taskit.com',
      refreshToken,
    });
    expect(calls).toEqual(['Bearer access-viejo', 'Bearer access-nuevo']);
    expect(response.data).toEqual({ ok: true });
    expect(authStore.getAccessToken()).toBe('access-nuevo');
    expect(authStore.getRefreshToken()).toBe(refreshToken);
  });

  it('si el backend rota el refresh token, guarda el nuevo', async () => {
    authStore.setTokens('access-viejo', makeJwt({ sub: 'robin@taskit.com' }));
    vi.spyOn(axios, 'post').mockResolvedValue({
      data: { accessToken: 'access-nuevo', refreshToken: 'refresh-rotado' },
    });
    axiosInstance.defaults.adapter = ((config) =>
      config.headers.Authorization === 'Bearer access-nuevo' ? ok(config) : unauthorized(config)) as AxiosAdapter;

    await axiosInstance.get('/profiles/me');

    expect(authStore.getRefreshToken()).toBe('refresh-rotado');
  });

  it('si no hay refresh token limpia la sesión y rechaza el error', async () => {
    localStorage.setItem('accessToken', 'access-viejo');
    const post = vi.spyOn(axios, 'post');
    axiosInstance.defaults.adapter = ((config) => unauthorized(config)) as AxiosAdapter;

    await expect(axiosInstance.get('/profiles/me')).rejects.toMatchObject({ response: { status: 401 } });

    expect(post).not.toHaveBeenCalled();
    expect(authStore.getAccessToken()).toBeNull();
    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });

  it('tras fallar por falta de refresh token, los siguientes 401 no quedan colgados', async () => {
    axiosInstance.defaults.adapter = ((config) => unauthorized(config)) as AxiosAdapter;

    await expect(axiosInstance.get('/a')).rejects.toMatchObject({ response: { status: 401 } });
    // Antes del fix, isRefreshing quedaba en true y esta segunda petición nunca resolvía.
    await expect(axiosInstance.get('/b')).rejects.toMatchObject({ response: { status: 401 } });
  });

  it('si el refresh falla limpia la sesión', async () => {
    authStore.setTokens('access-viejo', makeJwt());
    localStorage.setItem('userEmail', 'robin@taskit.com');
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh expirado'));
    axiosInstance.defaults.adapter = ((config) => unauthorized(config)) as AxiosAdapter;

    await expect(axiosInstance.get('/profiles/me')).rejects.toThrow('refresh expirado');

    expect(authStore.getAccessToken()).toBeNull();
    expect(authStore.getRefreshToken()).toBeNull();
    expect(localStorage.getItem('userEmail')).toBeNull();
    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });

  it('no intenta renovar el token cuando falla el propio login', async () => {
    authStore.setTokens('access', 'refresh');
    const post = vi.spyOn(axios, 'post');
    axiosInstance.defaults.adapter = ((config) => unauthorized(config)) as AxiosAdapter;

    await expect(axiosInstance.post('/auth/login', {})).rejects.toMatchObject({ response: { status: 401 } });

    expect(post).not.toHaveBeenCalled();
  });

  it('deja pasar sin tocar los errores que no son 401', async () => {
    axiosInstance.defaults.adapter = ((config) =>
      Promise.reject(
        new AxiosError('Server', 'ERR_BAD_RESPONSE', config, null, {
          status: 500,
          statusText: 'Error',
          data: {},
          headers: {},
          config,
        })
      )) as AxiosAdapter;

    await expect(axiosInstance.get('/x')).rejects.toMatchObject({ response: { status: 500 } });
  });
});
