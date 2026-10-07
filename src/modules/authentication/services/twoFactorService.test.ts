import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '../Config/axios';
import { twoFactorService } from './twoFactorService';

// Fija el CONTRATO HTTP del 2FA (RF-AUTH-9) con el backend AuthAndProfiles.
vi.mock('../Config/axios', () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn() },
}));

const http = vi.mocked(axiosInstance);

describe('twoFactorService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('status consulta GET /auth/2fa/status y devuelve si está activado', async () => {
    http.get.mockResolvedValue({ data: { enabled: true } });

    expect(await twoFactorService.status()).toBe(true);
    expect(http.get).toHaveBeenCalledWith('/auth/2fa/status');
  });

  it('requestEnable llama POST /auth/2fa/enable', async () => {
    http.post.mockResolvedValue({ data: { message: 'Enviado' } });

    expect((await twoFactorService.requestEnable()).message).toBe('Enviado');
    expect(http.post).toHaveBeenCalledWith('/auth/2fa/enable');
  });

  it('confirmEnable llama POST /auth/2fa/enable/confirm con el código', async () => {
    http.post.mockResolvedValue({ data: { message: 'Activada' } });

    await twoFactorService.confirmEnable('123456');

    expect(http.post).toHaveBeenCalledWith('/auth/2fa/enable/confirm', { code: '123456' });
  });

  it('requestDisable llama POST /auth/2fa/disable', async () => {
    http.post.mockResolvedValue({ data: { message: 'Enviado' } });

    await twoFactorService.requestDisable();

    expect(http.post).toHaveBeenCalledWith('/auth/2fa/disable');
  });

  it('confirmDisable llama POST /auth/2fa/disable/confirm con el código', async () => {
    http.post.mockResolvedValue({ data: { message: 'Desactivada' } });

    await twoFactorService.confirmDisable('654321');

    expect(http.post).toHaveBeenCalledWith('/auth/2fa/disable/confirm', { code: '654321' });
  });
});
