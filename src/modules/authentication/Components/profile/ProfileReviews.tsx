import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import type { Review } from '../../types/profile.types';

const PAGE_SIZE = 5;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function ProfileReviews({ userId }: { userId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchFirstPage() {
      if (cancelled) return;
      setLoading(true);
      setError('');
      try {
        const data = await reviewService.getUserReviews(userId, 0, PAGE_SIZE);
        if (cancelled) return;
        setReviews(data.content);
        setPage(data.page);
        setTotalPages(data.totalPages);
      } catch {
        if (!cancelled) setError('No se pudieron cargar las reseñas.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFirstPage();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getUserReviews(userId, page + 1, PAGE_SIZE);
      setReviews((prev) => [...prev, ...data.content]);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch {
      setError('No se pudieron cargar más reseñas.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && reviews.length === 0) {
    return <p className="text-sm text-white/40">Cargando reseñas...</p>;
  }

  if (error && reviews.length === 0) {
    return <p className="text-sm text-rose-400">{error}</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-white/40">Este usuario todavía no tiene reseñas.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}
                />
              ))}
            </div>
            <span className="text-[11px] text-white/40">{formatDate(review.createdAt)}</span>
          </div>
          {review.comment && <p className="mt-2 text-sm leading-relaxed text-white/80">{review.comment}</p>}
        </div>
      ))}

      {page + 1 < totalPages && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="self-center rounded-lg px-4 py-2 text-xs font-semibold text-[#7c93fc] hover:text-white transition-colors disabled:opacity-60"
        >
          {loading ? 'Cargando...' : 'Ver más reseñas'}
        </button>
      )}
    </div>
  );
}
