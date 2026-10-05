import { afterEach, describe, expect, it } from 'vitest';
import { consumeOauthState, createOauthState } from './oauthState';

describe('oauthState (protección CSRF de GitHub)', () => {
  afterEach(() => sessionStorage.clear());

  it('genera valores aleatorios, largos y distintos en cada intento', () => {
    const a = createOauthState();
    const b = createOauthState();

    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(b).toMatch(/^[0-9a-f]{32}$/);
    expect(a).not.toBe(b);
  });

  it('acepta el valor que se generó y es de un solo uso', () => {
    const state = createOauthState();

    expect(consumeOauthState(state)).toBe(true);
    expect(consumeOauthState(state)).toBe(false);
  });

  it('rechaza un valor distinto, ausente o vacío, y lo invalida', () => {
    const state = createOauthState();

    expect(consumeOauthState('otro-valor')).toBe(false);
    expect(consumeOauthState(state)).toBe(false); // ya se consumió al fallar
    createOauthState();
    expect(consumeOauthState(null)).toBe(false);
    expect(consumeOauthState('')).toBe(false);
  });

  it('rechaza si este navegador nunca inició el flujo (nada guardado)', () => {
    expect(consumeOauthState('lo-que-mande-un-atacante')).toBe(false);
    expect(consumeOauthState(null)).toBe(false);
  });
});
