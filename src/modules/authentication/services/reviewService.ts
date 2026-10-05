import { axiosInstance } from '../Config/axios';
import type { PageResponse, Review } from '../types/profile.types';

export const reviewService = {
  async getUserReviews(userId: string, page = 0, size = 10): Promise<PageResponse<Review>> {
    const response = await axiosInstance.get(`/reviews/user/${userId}`, { params: { page, size } });
    return response.data;
  },
};
