import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TermsPage from './TermsPage';

describe('TermsPage', () => {
  it('renderiza el título y todas las secciones del documento legal', () => {
    render(
      <MemoryRouter>
        <TermsPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /términos y condiciones de uso/i })).toBeInTheDocument();
    expect(screen.getByText(/política de cero tenencia/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al registro/i })).toHaveAttribute('href', '/register');
  });
});
