import { axiosInstance } from './axiosInstance';

export interface Profile {
  userId: string;
  fullName?: string;
  currentRole?: string;
  description: string;
  photoUrl: string;
  categories: string[];
  locationCoverage: string;
  reputationScore: number;
  totalReviews: number;
  documentUrl?: string;
  identityVerificationStatus: string;
}

export const profileService = {
  async getProfile(userId: string): Promise<Profile> {
    const response = await axiosInstance.get(`/profiles/${userId}`);
    return response.data;
  },

  async updateProfile(userId: string, data: Partial<Profile>) {
    const response = await axiosInstance.patch(`/profiles/${userId}`, null, {
      params: data,
    });
    return response.data;
  },

  async searchProfiles(name: string): Promise<Profile[]> {
    const response = await axiosInstance.get('/profiles/search', {
      params: { name },
    });
    return response.data;
  },

  async uploadPhoto(userId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(`/profiles/${userId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async uploadDocument(userId: string, file: File): Promise<Profile> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(`/profiles/${userId}/document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteAccount(email: string) {
    const response = await axiosInstance.delete(`/profiles/${email}`);
    return response.data;
  }
};