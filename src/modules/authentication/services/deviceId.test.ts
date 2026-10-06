import { beforeEach, describe, expect, it } from 'vitest';
import { deviceId } from './deviceId';

const clearCookie = () => {
  document.cookie = 'taskit_device_id=; max-age=0; path=/';
};

describe('deviceId', () => {
  beforeEach(() => {
    clearCookie();
    deviceId.resetCache();
  });

  it('genera un identificador y lo guarda en una cookie', () => {
    const id = deviceId.get();

    expect(id).toBeTruthy();
    expect(document.cookie).toContain(`taskit_device_id=${encodeURIComponent(id)}`);
  });

  it('devuelve siempre el mismo identificador', () => {
    expect(deviceId.get()).toBe(deviceId.get());
  });

  it('reutiliza el identificador de la cookie (por ejemplo tras una recarga)', () => {
    document.cookie = 'taskit_device_id=mi-dispositivo; path=/';

    expect(deviceId.get()).toBe('mi-dispositivo');
  });

  it('sobrevive a localStorage.clear(), que se ejecuta al cerrar sesión', () => {
    const id = deviceId.get();

    localStorage.clear();
    deviceId.resetCache();

    expect(deviceId.get()).toBe(id);
  });

  it('genera uno nuevo si la cookie viene vacía', () => {
    document.cookie = 'taskit_device_id=; path=/';

    expect(deviceId.get()).not.toBe('');
  });
});
