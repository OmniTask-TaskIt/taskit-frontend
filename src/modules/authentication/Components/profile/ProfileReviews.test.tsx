import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileReviews from './ProfileReviews';
import { reviewService } from '../../services/reviewService';

vi.mock('../../services/reviewService', () => ({
  reviewService: { getUserReviews: vi.fn() },
}));

describe('ProfileReviews', () => {
  afterEach(() => vi.clearAllMocks());

  it('muestra un mensaje cuando el usuario no tiene reseñas', async () => {
    vi.mocked(reviewService.getUserReviews).mockResolvedValueOnce({
      content: [],
      page: 0,
      size: 5,
      totalElements: 0,
      totalPages: 0,
    });

    render(<ProfileReviews userId="u2" />);

    expect(await screen.findByText(/todavía no tiene reseñas/i)).toBeInTheDocument();
  });

  it('renderiza las reseñas recibidas y el botón "Ver más" solo si hay más páginas', async () => {
    vi.mocked(reviewService.getUserReviews).mockResolvedValueOnce({
      content: [
        {
          id: '1',
          taskId: 't1',
          reviewerId: 'r1',
          revieweeId: 'u2',
          rating: 5,
          comment: 'Excelente trabajo, muy puntual.',
          createdAt: '2026-01-10T10:00:00Z',
        },
      ],
      page: 0,
      size: 5,
      totalElements: 6,
      totalPages: 2,
    });

    render(<ProfileReviews userId="u2" />);

    expect(await screen.findByText(/excelente trabajo, muy puntual/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ver más reseñas/i })).toBeInTheDocument();
  });

  it('pide la siguiente página al hacer clic en "Ver más reseñas"', async () => {
    vi.mocked(reviewService.getUserReviews)
      .mockResolvedValueOnce({
        content: [{ id: '1', taskId: 't1', reviewerId: 'r1', revieweeId: 'u2', rating: 4, comment: 'Bien', createdAt: '2026-01-10T10:00:00Z' }],
        page: 0,
        size: 5,
        totalElements: 6,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        content: [{ id: '2', taskId: 't2', reviewerId: 'r2', revieweeId: 'u2', rating: 3, comment: 'Correcto', createdAt: '2026-01-11T10:00:00Z' }],
        page: 1,
        size: 5,
        totalElements: 6,
        totalPages: 2,
      });

    const user = userEvent.setup();
    render(<ProfileReviews userId="u2" />);

    await screen.findByText('Bien');
    await user.click(screen.getByRole('button', { name: /ver más reseñas/i }));

    expect(await screen.findByText('Correcto')).toBeInTheDocument();
    expect(reviewService.getUserReviews).toHaveBeenCalledWith('u2', 1, 5);
  });
});
