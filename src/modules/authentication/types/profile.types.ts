/** Estado de una verificación (VerificationStatus del backend). */
export type VerificationStatus = 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';

/** Espejo de ProfileResponseDTO (el backend NO envía la URL del documento: solo su estado). */
export interface Profile {
  userId: string;
  fullName?: string;
  description: string;
  photoUrl: string;
  categories: string[];
  locationCoverage: string;
  reputationScore: number;
  totalReviews: number;
  identityVerificationStatus: VerificationStatus;
  institutionalVerificationStatus?: VerificationStatus;
}

/** Campos editables por el dueño del perfil (los acepta PATCH /profiles/{id} como query params). */
export type UpdateProfileData = Partial<Pick<Profile, 'description' | 'photoUrl' | 'locationCoverage' | 'categories'>>;

export interface Report {
  id: string;
  reporterId: string;
  revieweeId: string;
  reason: string;
  comment: string;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface Review {
  id: string;
  taskId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

/** Respuesta paginada genérica del backend (PageResponseDTO). */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Espejo de AdminReportDTO: lo que devuelve GET /admin/reports (incluye nombres y correos). */
export interface AdminReport extends Report {
  reporterName?: string | null;
  reporterEmail?: string | null;
  revieweeName?: string | null;
  revieweeEmail?: string | null;
}
