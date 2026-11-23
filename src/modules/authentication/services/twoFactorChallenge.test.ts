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

  it('devuelve null si lo guardado está corrupto o no trae challengeId', () => {
    sessionStorage.setItem('twoFactorChallenge', '{no es json');
    expect(twoFactorChallenge.get()).toBeNull();

    sessionStorage.setItem('twoFactorChallenge', JSON.stringify({ email: 'ana@gmail.com' }));
    expect(twoFactorChallenge.get()).toBeNull();
  });

  it('completa el correo vacío si no venía', () => {
    sessionStorage.setItem('twoFactorChallenge', JSON.stringify({ challengeId: 'ch-1' }));

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
});
