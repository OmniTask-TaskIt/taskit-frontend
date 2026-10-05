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
