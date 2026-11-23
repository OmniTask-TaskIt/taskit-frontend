import { afterEach, describe, expect, it } from 'vitest';
import { twoFactorChallenge } from './twoFactorChallenge';

describe('twoFactorChallenge', () => {
  afterEach(() => sessionStorage.clear());

  it('guarda y recupera el reto', () => {
    twoFactorChallenge.start({ challengeId: 'ch-1', email: 'ana@gmail.com' });

    expect(twoFactorChallenge.get()).toEqual({ challengeId: 'ch-1', email: 'ana@gmail.com' });
  });

  it('devuelve null si no hay reto', () => {
    expect(twoFactorChallenge.get()).toBeNull();
  });

  it('devuelve null si no hay challengeId guardado', () => {
    sessionStorage.setItem('twoFactorChallengeEmail', 'ana@gmail.com');

    expect(twoFactorChallenge.get()).toBeNull();
  });

  it('completa el correo vacío si no venía', () => {
    sessionStorage.setItem('twoFactorChallengeId', 'ch-1');

    expect(twoFactorChallenge.get()).toEqual({ challengeId: 'ch-1', email: '' });
  });

  it('clear borra el reto', () => {
    twoFactorChallenge.start({ challengeId: 'ch-1', email: 'ana@gmail.com' });
    twoFactorChallenge.clear();

    expect(twoFactorChallenge.get()).toBeNull();
  });

  it('no guarda el reto si el challengeId no tiene forma de identificador', () => {
    expect(twoFactorChallenge.start({ challengeId: '"><script>', email: 'ana@gmail.com' })).toBe(false);

    expect(twoFactorChallenge.get()).toBeNull();
  });

  it('guarda el reto con el correo vacío si el correo no es válido', () => {
    expect(twoFactorChallenge.start({ challengeId: 'ch-1', email: '<b>' })).toBe(true);

    expect(twoFactorChallenge.get()).toEqual({ challengeId: 'ch-1', email: '' });
  });

  it('borra un correo anterior si el nuevo reto llega sin correo válido', () => {
    twoFactorChallenge.start({ challengeId: 'ch-1', email: 'ana@gmail.com' });
    twoFactorChallenge.start({ challengeId: 'ch-2', email: '' });

    expect(twoFactorChallenge.get()).toEqual({ challengeId: 'ch-2', email: '' });
  });
});
