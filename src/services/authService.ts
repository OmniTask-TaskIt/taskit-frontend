import { axiosInstance } from './axiosInstance';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'SEEKER' | 'PROVIDER';
  acceptedTerms: boolean;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  async switchRole(email: string, newRole: 'SEEKER' | 'PROVIDER') {
    const response = await axiosInstance.post('/profiles/switch-role', null, {
      params: { email, newRole },
    });
    return response.data;
  },

  async verifyOtp(email: string, otpCode: string) {
    const response = await axiosInstance.post('/auth/verify-otp', { email, otpCode });
    return response.data;
  },

  async resendOtp(email: string) {
    const response = await axiosInstance.post('/auth/resend-otp', { email });
    return response.data;
  },

  async googleLogin(googleToken: string) {
    const response = await axiosInstance.post('/auth/google', { token: googleToken });
    return response.data;
  },
};