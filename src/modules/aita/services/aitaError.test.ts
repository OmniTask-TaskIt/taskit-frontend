import axios from 'axios';
import { describe, expect, it } from 'vitest';
import { makeAxiosError } from '../../../test/helpers';
import { AitaRequestError, toAitaRequestError } from './aitaError';

describe('toAitaRequestError', () => {
  it('traduce un 500 a un mensaje amable', () => {
    const error = toAitaRequestError(makeAxiosError({ detail: 'boom' }, 500));
    expect(error).toBeInstanceOf(AitaRequestError);
    expect(error.message).toBe('La IA está descansando, intenta de nuevo.');
    expect(error.status).toBe(500);
  });

  it('traduce un 422 con el detalle de validación', () => {
    const error = toAitaRequestError(makeAxiosError({
      detail: [{ loc: ['body', 'idea'], msg: 'String should have at least 3 characters', type: 'string_too_short' }],
    }, 422));
    expect(error.message).toContain('idea');
    expect(error.message).toContain('at least 3 characters');
  });

  it('traduce la caída de red', () => {
    const error = toAitaRequestError(new axios.AxiosError('Network Error', 'ERR_NETWORK'));
    expect(error.message).toBe('La IA está descansando, intenta de nuevo.');
  });

  it('traduce un timeout', () => {
    const error = toAitaRequestError(new axios.AxiosError('timeout', 'ECONNABORTED'));
    expect(error.message).toBe('La IA está tardando más de lo habitual. Intenta de nuevo.');
  });
});
