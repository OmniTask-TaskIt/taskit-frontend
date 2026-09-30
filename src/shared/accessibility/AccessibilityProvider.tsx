import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import ColorBlindFilters from './ColorBlindFilters';
import AccessibilityWidget from './AccessibilityWidget';
import {
  AccessibilityContext,
  type AccessibilityContextValue,
  type AccessibilitySettings,
  type ColorBlindMode,
  type FontScale,
} from './AccessibilityContext';

const STORAGE_KEY = 'taskit_a11y_settings_v1';

const DEFAULT_SETTINGS: AccessibilitySettings = {
  colorBlindMode: 'none',
  fontScale: 'normal',
  highContrast: false,
  reduceMotion: false,
};

function loadSettings(): AccessibilitySettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const FONT_SIZE_PX: Record<FontScale, string> = {
  normal: '100%',
  large: '112.5%',
  xlarge: '125%',
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(loadSettings);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    const root = document.documentElement;

    root.style.fontSize = FONT_SIZE_PX[settings.fontScale];

    root.style.filter =
      settings.colorBlindMode === 'none' ? '' : `url(#taskit-${settings.colorBlindMode})`;

    root.classList.toggle('a11y-high-contrast', settings.highContrast);
    root.classList.toggle('a11y-reduce-motion', settings.reduceMotion);
  }, [settings]);

  const setColorBlindMode = useCallback((mode: ColorBlindMode) => {
    setSettings((prev) => ({ ...prev, colorBlindMode: mode }));
  }, []);

  const setFontScale = useCallback((scale: FontScale) => {
    setSettings((prev) => ({ ...prev, fontScale: scale }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const toggleReduceMotion = useCallback(() => {
    setSettings((prev) => ({ ...prev, reduceMotion: !prev.reduceMotion }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  const value = useMemo<AccessibilityContextValue>(
    () => ({ ...settings, setColorBlindMode, setFontScale, toggleHighContrast, toggleReduceMotion, reset }),
    [settings, setColorBlindMode, setFontScale, toggleHighContrast, toggleReduceMotion, reset]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      <ColorBlindFilters />
      <MotionConfig reducedMotion={settings.reduceMotion ? 'always' : 'never'}>
        {children}
        <AccessibilityWidget />
      </MotionConfig>
    </AccessibilityContext.Provider>
  );
}

