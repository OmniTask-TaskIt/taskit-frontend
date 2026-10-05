export type Matrix3 = number[][];

const IDENTITY: Matrix3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

// ── Simulación ──────────────────────────────────────────────────────────────
// Aproximación de Machado, Oliveira & Fernandes (severidad 1.0), en RGB lineal.
// Muestra cómo VE una persona con esa deficiencia. Sirve para que el equipo de
// diseño pruebe la app; NO ayuda a quien tiene daltonismo (al contrario).
export const SIMULATION: Record<'protanopia' | 'deuteranopia' | 'tritanopia', Matrix3> = {
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
};

// ── Corrección (daltonización) ──────────────────────────────────────────────
// Método clásico de Fidaner et al.: se calcula la información de color que la
// persona pierde (error = original − simulado) y se REDISTRIBUYE hacia canales
// que sí distingue. Todo es lineal, así que se resume en una sola matriz:
//     C = I + M · (I − S)
// donde S es la simulación y M indica a qué canales se reparte el error.
// Protanopia/deuteranopia pierden rojo-verde → se traslada a verde y azul.
// Tritanopia pierde azul-amarillo → se traslada a rojo y verde.
const ERROR_SHIFT: Record<keyof typeof SIMULATION, Matrix3> = {
  protanopia: [
    [0, 0, 0],
    [0.7, 1, 0],
    [0.7, 0, 1],
  ],
  deuteranopia: [
    [0, 0, 0],
    [0.7, 1, 0],
    [0.7, 0, 1],
  ],
  tritanopia: [
    [1, 0, 0.7],
    [0, 1, 0.7],
    [0, 0, 0],
  ],
};

const multiply = (a: Matrix3, b: Matrix3): Matrix3 =>
  a.map((row) => b[0].map((_, j) => row.reduce((sum, value, k) => sum + value * b[k][j], 0)));

const add = (a: Matrix3, b: Matrix3): Matrix3 => a.map((row, i) => row.map((v, j) => v + b[i][j]));
const subtract = (a: Matrix3, b: Matrix3): Matrix3 => a.map((row, i) => row.map((v, j) => v - b[i][j]));

/** C = I + M · (I − S). */
export function daltonize(simulation: Matrix3, errorShift: Matrix3): Matrix3 {
  return add(IDENTITY, multiply(errorShift, subtract(IDENTITY, simulation)));
}

export const CORRECTION: Record<keyof typeof SIMULATION, Matrix3> = {
  protanopia: daltonize(SIMULATION.protanopia, ERROR_SHIFT.protanopia),
  deuteranopia: daltonize(SIMULATION.deuteranopia, ERROR_SHIFT.deuteranopia),
  tritanopia: daltonize(SIMULATION.tritanopia, ERROR_SHIFT.tritanopia),
};

export const GRAYSCALE: Matrix3 = [
  [0.299, 0.587, 0.114],
  [0.299, 0.587, 0.114],
  [0.299, 0.587, 0.114],
];

/** Matriz 3x3 → valores de <feColorMatrix> (4x5, alfa intacto). */
export function toValues(m: Matrix3): string {
  const rows = m.map((r) => `${r.map((v) => +v.toFixed(4)).join(' ')} 0 0`);
  return [...rows, '0 0 0 1 0'].join('\n');
}
