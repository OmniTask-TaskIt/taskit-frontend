import { createContext, useContext } from 'react';

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
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
