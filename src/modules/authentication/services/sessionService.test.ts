import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '../Config/axios';
import { sessionService } from './sessionService';

// Fija el CONTRATO HTTP de las sesiones activas (RF-AUTH-10) con el backend AuthAndProfiles.
vi.mock('../Config/axios', () => ({
  axiosInstance: { get: vi.fn(), delete: vi.fn() },
}));

const http = vi.mocked(axiosInstance);

describe('sessionService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('list consulta GET /auth/sessions y devuelve las sesiones', async () => {
    const sessions = [{ id: 's1', deviceInfo: 'Chrome en Windows', ipAddress: '1.1.1.1', createdAt: '', lastActiveAt: '', current: true }];
    http.get.mockResolvedValue({ data: sessions });

    const result = await sessionService.list();

    expect(http.get).toHaveBeenCalledWith('/auth/sessions');
    expect(result).toEqual(sessions);
  });

  it('revoke llama DELETE /auth/sessions/{id}', async () => {
    http.delete.mockResolvedValue({ data: { message: 'Sesión cerrada correctamente.' } });

    const result = await sessionService.revoke('s2');

    expect(http.delete).toHaveBeenCalledWith('/auth/sessions/s2');
    expect(result.message).toBe('Sesión cerrada correctamente.');
  });
});
