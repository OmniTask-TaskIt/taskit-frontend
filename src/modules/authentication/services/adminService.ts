import { axiosInstance } from '../Config/axios';
import type { AdminReport, PageResponse, Profile, Report, VerificationStatus } from '../types/profile.types';
import type { AccountStatus, AdminUser, DocumentAccess, VerificationDecision } from '../types/admin.types';

export const adminService = {
  async listUsers(params: { status?: AccountStatus; q?: string; page?: number; size?: number }) {
    const response = await axiosInstance.get<PageResponse<AdminUser>>('/admin/users', { params });
    return response.data;
  },

  async updateUserStatus(userId: string, status: AccountStatus, reason: string) {
    const response = await axiosInstance.patch<AdminUser>(`/admin/users/${userId}/status`, { status, reason });
    return response.data;
  },

  async getVerificationDocumentAccess(userId: string) {
    const response = await axiosInstance.get<DocumentAccess>(`/admin/verification-documents/${userId}/access`);
    return response.data;
  },

  /** Cola de verificaciones de identidad. Sin `status` el backend devuelve las PENDING_REVIEW, de la más antigua a la más reciente. */
  async listVerifications(params: { status?: VerificationStatus; page?: number; size?: number }) {
    const response = await axiosInstance.get<PageResponse<Profile>>('/admin/verification-documents', { params });
    return response.data;
  },

  async resolveVerification(userId: string, decision: VerificationDecision, reason: string) {
    const response = await axiosInstance.post<Profile>(`/admin/verification-documents/${userId}/resolution`, {
      decision,
      reason,
    });
    return response.data;
  },

  async listReports(params: { status?: Report['status']; page?: number; size?: number }) {
    const response = await axiosInstance.get<PageResponse<AdminReport>>('/admin/reports', { params });
    return response.data;
  },

  async resolveReport(reportId: string, status: 'RESOLVED' | 'DISMISSED', note: string) {
    const response = await axiosInstance.patch<Report>(`/admin/reports/${reportId}/status`, { status, note });
    return response.data;
  },
};
