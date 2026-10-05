import { CORRECTION, GRAYSCALE, SIMULATION, toValues, type Matrix3 } from './colorMatrices';

function MatrixFilter({ id, matrix }: { id: string; matrix: Matrix3 }) {
  return (
    <filter id={id}>
      <feColorMatrix type="matrix" values={toValues(matrix)} />
    </filter>
  );
}

// Se inyectan como <filter> ocultos y se aplican con `filter: url(#taskit-<modo>)`
// sobre <html> desde AccessibilityProvider, así que afectan el color de TODA la app.
//   taskit-protanopia | -deuteranopia | -tritanopia → CORRECCIÓN para el usuario
//   taskit-sim-<tipo>                               → SIMULACIÓN para diseñadores
//   taskit-achromatopsia                            → escala de grises
export default function ColorBlindFilters() {
  return (
    <svg aria-hidden="true" focusable="false" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <defs>
        <MatrixFilter id="taskit-protanopia" matrix={CORRECTION.protanopia} />
        <MatrixFilter id="taskit-deuteranopia" matrix={CORRECTION.deuteranopia} />
        <MatrixFilter id="taskit-tritanopia" matrix={CORRECTION.tritanopia} />
        <MatrixFilter id="taskit-sim-protanopia" matrix={SIMULATION.protanopia} />
        <MatrixFilter id="taskit-sim-deuteranopia" matrix={SIMULATION.deuteranopia} />
        <MatrixFilter id="taskit-sim-tritanopia" matrix={SIMULATION.tritanopia} />
        <MatrixFilter id="taskit-achromatopsia" matrix={GRAYSCALE} />
      </defs>
    </svg>
  );
}
