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
});
