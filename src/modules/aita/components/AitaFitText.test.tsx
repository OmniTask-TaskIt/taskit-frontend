import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AitaFitText from './AitaFitText';

describe('AitaFitText', () => {
  it('recorta un texto largo y permite abrirlo sin ocupar toda la pantalla', async () => {
    const user = userEvent.setup();
    const text = 'AITA '.repeat(80);
    render(<AitaFitText text={text} />);

    const paragraph = screen.getByText(/AITA/);
    expect(paragraph.className).toContain('line-clamp-3');

    await user.click(screen.getByRole('button', { name: /ver más/i }));
    expect(paragraph.className).toContain('max-h-32');
    expect(paragraph.className).toContain('overflow-y-auto');
  });
});