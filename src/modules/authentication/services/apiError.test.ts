import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './apiError';
import { makeAxiosError } from '../../../test/helpers';

describe('getApiErrorMessage', () => {
  it('usa message del backend', () => {
    expect(getApiErrorMessage(makeAxiosError({ message: 'Tu identidad ya está verificada.' }), 'x')).toBe(
      'Tu identidad ya está verificada.'
    );
  });

  it('usa error si no hay message', () => {
    expect(getApiErrorMessage(makeAxiosError({ error: 'Formato inválido' }), 'x')).toBe('Formato inválido');
  });

  it('cae al texto de respaldo si no hay cuerpo útil, el cuerpo no es texto o no es un error de axios', () => {
    expect(getApiErrorMessage(makeAxiosError({}), 'respaldo')).toBe('respaldo');
    expect(getApiErrorMessage(makeAxiosError({ message: 42 }), 'respaldo')).toBe('respaldo');
    expect(getApiErrorMessage(makeAxiosError({ message: '   ' }), 'respaldo')).toBe('respaldo');
    expect(getApiErrorMessage(new Error('boom'), 'respaldo')).toBe('respaldo');
    expect(getApiErrorMessage(undefined, 'respaldo')).toBe('respaldo');
  });
});
