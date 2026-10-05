import { createContext, useContext } from 'react';

/**
 * - protanopia / deuteranopia / tritanopia: CORRIGEN el color para quien tiene esa deficiencia.
 * - sim-*: SIMULAN la deficiencia (para que diseño pruebe la app).
 * - achromatopsia: escala de grises.
 */
export const COLOR_BLIND_MODES = [
  'none',
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'achromatopsia',
  'sim-protanopia',
  'sim-deuteranopia',
  'sim-tritanopia',
] as const;
export type ColorBlindMode = (typeof COLOR_BLIND_MODES)[number];
export type FontScale = 'normal' | 'large' | 'xlarge';

export interface AccessibilitySettings {
  colorBlindMode: ColorBlindMode;
  fontScale: FontScale;
  highContrast: boolean;
  reduceMotion: boolean;
}

export interface AccessibilityContextValue extends AccessibilitySettings {
  setColorBlindMode: (mode: ColorBlindMode) => void;
  setFontScale: (scale: FontScale) => void;
  toggleHighContrast: () => void;
  toggleReduceMotion: () => void;
  reset: () => void;
}

export const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility debe usarse dentro de <AccessibilityProvider>');
  return ctx;
}
