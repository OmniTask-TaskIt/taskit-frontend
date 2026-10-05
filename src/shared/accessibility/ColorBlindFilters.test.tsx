import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import ColorBlindFilters from './ColorBlindFilters';

describe('ColorBlindFilters', () => {
  it('inyecta un filtro por modo: corrección, simulación y escala de grises', () => {
    const { container } = render(<ColorBlindFilters />);
    const ids = Array.from(container.querySelectorAll('filter')).map((f) => f.id);

    expect(ids).toEqual([
      'taskit-protanopia',
      'taskit-deuteranopia',
      'taskit-tritanopia',
      'taskit-sim-protanopia',
      'taskit-sim-deuteranopia',
      'taskit-sim-tritanopia',
      'taskit-achromatopsia',
    ]);
    container.querySelectorAll('feColorMatrix').forEach((fe) => {
      expect(fe.getAttribute('values')!.trim().split(/\s+/)).toHaveLength(20);
    });
  });
});
