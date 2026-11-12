import type { Review } from '../../authentication/types/profile.types';
import type { AitaReviewInput, AitaTaskCategory, ProviderProfile } from '../types/aita.types';

const TASK_CATEGORIES = new Set<AitaTaskCategory>(['ARREGLOS', 'EDUCACION']);

export function isAitaCategory(value: string): value is AitaTaskCategory {
  return TASK_CATEGORIES.has(value as AitaTaskCategory);
}

/** Separa categorías del enum de AITA y deja el resto como habilidades libres. */
export function toProviderProfile(input: {
  userId: string;
  displayName: string;
  bio: string;
  location: string;
  categories: string[];
}): ProviderProfile {
  const categories = input.categories
    .map((category) => category.trim().toUpperCase())
    .filter(isAitaCategory);
  const skills = input.categories
    .map((category) => category.trim())
    .filter((category) => category.length > 0 && !isAitaCategory(category.toUpperCase()));

  return {
    provider_id: input.userId,
    display_name: input.displayName.trim() || 'Usuario',
    bio: input.bio.trim(),
    skills,
    location: input.location.trim(),
    categories,
  };
}

export function toAitaReview(review: Review): AitaReviewInput {
  return {
    review_id: review.id,
    task_id: review.taskId,
    reviewer_id: review.reviewerId,
    reviewee_id: review.revieweeId,
    rating: review.rating,
    comment: review.comment.trim(),
    created_at: review.createdAt,
  };
}
