import { AxiosError, type AxiosResponse } from 'axios';

const b64url = (value: unknown) =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** Construye un JWT sin firma válida (solo sirve para probar la lectura del payload en el front). */
export function makeJwt({
  sub = 'test@taskit.com',
  role,
  expiresInSeconds = 3600,
}: { sub?: string; role?: string; expiresInSeconds?: number } = {}): string {
  const header = b64url({ alg: 'none', typ: 'JWT' });
  const payload = b64url({
    sub,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    ...(role ? { role } : {}),
  });
  return `${header}.${payload}.signature`;
}

/** Error de axios con la forma que devuelve el backend ({ message } o { error }). */
export function makeAxiosError(data: unknown, status = 400): AxiosError {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: '',
    data,
    headers: {},
    config: {} as AxiosResponse['config'],
  } as AxiosResponse);
}
