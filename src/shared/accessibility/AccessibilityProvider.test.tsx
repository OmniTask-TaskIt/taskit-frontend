import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibilityProvider } from './AccessibilityProvider';

describe('AccessibilityProvider + AccessibilityWidget', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.filter = '';
    document.documentElement.style.fontSize = '';
  });

  it('abre el panel y aplica el filtro de daltonismo elegido al <html>', async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider>
        <div>contenido</div>
      </AccessibilityProvider>
    );

    await user.click(screen.getByRole('button', { name: /abrir menú de accesibilidad/i }));
    await user.click(screen.getByRole('button', { name: /^protanopia$/i }));

    expect(document.documentElement.style.filter).toBe('url(#taskit-protanopia)');
  });

  it('activa el modo alto contraste como clase en <html>', async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider>
        <div>contenido</div>
      </AccessibilityProvider>
    );

    await user.click(screen.getByRole('button', { name: /abrir menú de accesibilidad/i }));
    await user.click(screen.getByRole('switch', { name: /alto contraste/i }));

    expect(document.documentElement.classList.contains('a11y-high-contrast')).toBe(true);
  });

  it('restablecer vuelve todo a los valores por defecto', async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider>
        <div>contenido</div>
      </AccessibilityProvider>
    );

    await user.click(screen.getByRole('button', { name: /abrir menú de accesibilidad/i }));
    await user.click(screen.getByRole('button', { name: /^protanopia$/i }));
    await user.click(screen.getByRole('button', { name: /restablecer/i }));

    expect(document.documentElement.style.filter).toBe('');
  });
});
