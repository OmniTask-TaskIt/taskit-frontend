import { axiosInstance } from '../Config/axios';
import type { Profile, Report, UpdateProfileData } from '../types/profile.types';

export const profileService = {
  async getProfile(userId: string): Promise<Profile> {
    const response = await axiosInstance.get(`/profiles/${userId}`);
    return response.data;
  },

  async updateProfile(userId: string, data: UpdateProfileData): Promise<Profile> {
    const response = await axiosInstance.patch(`/profiles/${userId}`, null, {
      params: data,
      // Spring bindea List<String> con `categories=a&categories=b`; axios manda por defecto
      // `categories[]=a` y el backend lo ignoraba en silencio (las categorías nunca se guardaban).
      paramsSerializer: { indexes: null },
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
  },

  /** RF-AUTHPR-9: reportar un perfil por comportamiento inapropiado o fraude. */
  async reportProfile(userId: string, reason: string, comment: string): Promise<Report> {
    const response = await axiosInstance.post(`/profiles/${userId}/reports`, { reason, comment });
    return response.data;
  },
};
