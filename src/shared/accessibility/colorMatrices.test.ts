import { describe, expect, it } from 'vitest';
import { CORRECTION, SIMULATION, daltonize, type Matrix3 } from './colorMatrices';

const IDENTITY: Matrix3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const apply = (m: Matrix3, rgb: number[]) => m.map((row) => row.reduce((s, v, i) => s + v * rgb[i], 0));
const clamp = (rgb: number[]) => rgb.map((v) => Math.min(1, Math.max(0, v)));
const toSrgb = (rgb: number[]) => rgb.map((x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055));
/** Distancia en sRGB (lo que realmente se ve en pantalla), no en RGB lineal. */
const distance = (a: number[], b: number[]) => Math.hypot(...toSrgb(a).map((x, i) => x - toSrgb(b)[i]));

/** Generador pseudoaleatorio con semilla fija para que la prueba sea determinista. */
function seeded(seed: number) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

/**
 * Pares de colores que una persona con esa deficiencia CONFUNDE: distintos para
 * quien ve normal, casi iguales para ella. Es justo lo que la corrección debe arreglar.
 */
function confusablePairs(type: keyof typeof SIMULATION, wanted = 1000) {
  const rnd = seeded(7);
  const pairs: [number[], number[]][] = [];
  for (let i = 0; i < 300000 && pairs.length < wanted; i++) {
    const a = [rnd(), rnd(), rnd()];
    const b = [rnd(), rnd(), rnd()];
    const normal = distance(a, b);
    const perceived = distance(apply(SIMULATION[type], a), apply(SIMULATION[type], b));
    if (normal > 0.35 && perceived < 0.08) pairs.push([a, b]);
  }
  return pairs;
}

describe('daltonización (colorMatrices)', () => {
  it('si la persona no pierde información (S = identidad) la corrección no cambia nada', () => {
    const shift: Matrix3 = [[0, 0, 0], [0.7, 1, 0], [0.7, 0, 1]];
    expect(daltonize(IDENTITY, shift)).toEqual(IDENTITY);
  });

  it.each(['protanopia', 'deuteranopia', 'tritanopia'] as const)(
    '%s: la mayoría de colores que se confundían pasan a distinguirse, con bastante más contraste',
    (type) => {
      const pairs = confusablePairs(type);
      expect(pairs.length).toBeGreaterThan(500); // el experimento tiene muestra suficiente

      let improved = 0;
      let ratioSum = 0;
      for (const [a, b] of pairs) {
        const before = distance(apply(SIMULATION[type], a), apply(SIMULATION[type], b));
        const after = distance(
          apply(SIMULATION[type], clamp(apply(CORRECTION[type], a))),
          apply(SIMULATION[type], clamp(apply(CORRECTION[type], b)))
        );
        if (after > before) improved++;
        ratioSum += after / Math.max(before, 1e-3);
      }

      expect(improved / pairs.length).toBeGreaterThan(0.85);
      expect(ratioSum / pairs.length).toBeGreaterThan(2);
    }
  );

  it('la corrección no es lo mismo que la simulación', () => {
    expect(CORRECTION.protanopia).not.toEqual(SIMULATION.protanopia);
  });
});
