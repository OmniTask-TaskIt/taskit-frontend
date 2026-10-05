import '@testing-library/jest-dom/vitest';

// jsdom no implementa scrollTo; framer-motion lo invoca al medir animaciones.
window.scrollTo = (() => {}) as typeof window.scrollTo;

// jsdom no implementa matchMedia; framer-motion / algunos hooks lo consultan.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
