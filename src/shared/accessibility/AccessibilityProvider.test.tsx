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

  it('la simulación para diseño usa un filtro distinto al de corrección', async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider>
        <div>contenido</div>
      </AccessibilityProvider>
    );

    await user.click(screen.getByRole('button', { name: /abrir menú de accesibilidad/i }));
    await user.click(screen.getByRole('button', { name: /simular protanopia/i }));

    expect(document.documentElement.style.filter).toBe('url(#taskit-sim-protanopia)');
  });

  it('un modo guardado desconocido (versión anterior) se ignora en vez de romper el filtro', () => {
    localStorage.setItem('taskit_a11y_settings_v1', JSON.stringify({ colorBlindMode: 'inexistente' }));

    render(
      <AccessibilityProvider>
        <div>contenido</div>
      </AccessibilityProvider>
    );

    expect(document.documentElement.style.filter).toBe('');
  });

  it('recuerda la elección al volver a abrir la app', async () => {
    const user = userEvent.setup();
    const first = render(
      <AccessibilityProvider>
        <div>contenido</div>
      </AccessibilityProvider>
    );
    await user.click(screen.getByRole('button', { name: /abrir menú de accesibilidad/i }));
    await user.click(screen.getByRole('button', { name: /^deuteranopia$/i }));
    first.unmount();
    document.documentElement.style.filter = '';

    render(
      <AccessibilityProvider>
        <div>contenido</div>
      </AccessibilityProvider>
    );

    expect(document.documentElement.style.filter).toBe('url(#taskit-deuteranopia)');
  });
});
