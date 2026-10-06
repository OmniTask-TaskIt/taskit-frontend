import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AxiosAdapter } from 'axios';
import { axiosInstance } from './axios';
import { deviceId } from '../services/deviceId';

vi.mock('../../../utils/navigation', () => ({ redirectToLogin: vi.fn() }));

describe('axiosInstance: identificador de dispositivo', () => {
  const originalAdapter = axiosInstance.defaults.adapter;

  afterEach(() => {
    axiosInstance.defaults.adapter = originalAdapter;
  });

  it('envía X-Device-Id en cada petición, haya o no sesión', async () => {
    let seen: unknown;
    axiosInstance.defaults.adapter = ((config) => {
      seen = config.headers['X-Device-Id'];
      return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config });
    }) as AxiosAdapter;

    await axiosInstance.get('/profiles/search');

    expect(seen).toBe(deviceId.get());
  });
});
