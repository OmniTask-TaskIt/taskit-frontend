import { axiosInstance } from '../../../shared/services/axiosInstance';
import type { PageResponse } from '../../dashboard/services/reviewService';
import type { Profile, Report } from '../../dashboard/services/profileService';

export type AccountStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'BLOCKED' | 'SUSPENDED';
export type VerificationDecision = 'APPROVED' | 'REJECTED';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SEEKER' | 'PROVIDER' | 'ADMIN';
  authProvider: 'LOCAL' | 'GOOGLE' | 'GITHUB' | 'APPLE';
  accountStatus: AccountStatus;
  blockReason?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentAccess {
  url: string;
  expiresAt: string;
  documentType: string;
  contentType: string;
  submittedAt: string;
}

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

  async resolveVerification(userId: string, decision: VerificationDecision, reason: string) {
    const response = await axiosInstance.post<Profile>(`/admin/verification-documents/${userId}/resolution`, {
      decision,
      reason,
    });
    return response.data;
  },

  async listReports(params: { status?: Report['status']; page?: number; size?: number }) {
    const response = await axiosInstance.get<PageResponse<Report>>('/admin/reports', { params });
    return response.data;
  },

  async resolveReport(reportId: string, status: 'RESOLVED' | 'DISMISSED', note: string) {
    const response = await axiosInstance.patch<Report>(`/admin/reports/${reportId}/status`, { status, note });
    return response.data;
  },
};
