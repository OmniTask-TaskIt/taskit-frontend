import { useEffect } from 'react';
import type { Review } from '../../authentication/types/profile.types';
import { useAitaSentiment } from '../hooks/useAitaSentiment';
import { toAitaReview } from '../mappers/aita.mappers';
import type { SentimentLabel } from '../types/aita.types';

const STYLES: Record<SentimentLabel, string> = {
  POSITIVE: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  NEUTRAL: 'border-amber-200 bg-amber-50 text-amber-900',
  NEGATIVE: 'border-rose-200 bg-rose-50 text-rose-800',
};

const LABELS: Record<SentimentLabel, string> = {
  POSITIVE: 'Positivo',
  NEUTRAL: 'Neutral',
  NEGATIVE: 'Negativo',
};

export default function AitaSentimentBadge({ review }: { review: Review }) {
  const { analyze, isLoading, data } = useAitaSentiment();
  const comment = review.comment?.trim() ?? '';

  useEffect(() => {
    if (!comment) return undefined;
    const controller = new AbortController();
    void analyze(
      toAitaReview({
        id: review.id,
        taskId: review.taskId,
        reviewerId: review.reviewerId,
        revieweeId: review.revieweeId,
        rating: review.rating,
        comment,
        createdAt: review.createdAt,
      }),
      controller.signal,
    );
    return () => controller.abort();
  }, [analyze, comment, review.id, review.taskId, review.reviewerId, review.revieweeId, review.rating, review.createdAt]);

  if (!comment) return null;
  if (isLoading) {
    return <span className="text-[11px] font-medium text-violet-700">Analizando tono...</span>;
  }
  if (!data) return null;

  return (
    <span
      title={data.summary}
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STYLES[data.sentiment]}`}
    >
      {LABELS[data.sentiment]}
    </span>
  );
}
