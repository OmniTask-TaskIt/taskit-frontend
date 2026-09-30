import { axiosInstance } from '../../../shared/services/axiosInstance';

export interface Review {
  id: string;
  taskId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const reviewService = {
  async getUserReviews(userId: string, page = 0, size = 10): Promise<PageResponse<Review>> {
    const response = await axiosInstance.get(`/reviews/user/${userId}`, { params: { page, size } });
    return response.data;
  },
};
