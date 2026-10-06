import { describe, expect, it } from 'vitest';
import { formatSeniority, monthsBetween } from './seniority';

describe('monthsBetween', () => {
  it('cuenta solo meses completos', () => {
    expect(monthsBetween(new Date(2026, 0, 15), new Date(2026, 3, 15))).toBe(3);
    expect(monthsBetween(new Date(2026, 0, 15), new Date(2026, 3, 14))).toBe(2);
  });

  it('cruza el cambio de año', () => {
    expect(monthsBetween(new Date(2025, 10, 1), new Date(2026, 1, 1))).toBe(3);
  });

  it('nunca devuelve negativos (alta con fecha futura)', () => {
    expect(monthsBetween(new Date(2026, 5, 1), new Date(2026, 0, 1))).toBe(0);
  });
});

describe('formatSeniority', () => {
  it.each([
    [0, 'menos de un mes'],
    [1, '1 mes'],
    [5, '5 meses'],
    [12, '1 año'],
    [14, '1 año y 2 meses'],
    [13, '1 año y 1 mes'],
    [24, '2 años'],
    [27, '2 años y 3 meses'],
  ])('%i meses -> %s', (months, expected) => {
    expect(formatSeniority(months)).toBe(expected);
  });
});
