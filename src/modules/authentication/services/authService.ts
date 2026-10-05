import { axiosInstance } from '../Config/axios';
import type { LoginCredentials, RegisterData, SelectableRole } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  async switchRole(email: string, newRole: SelectableRole) {
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

  /** RF-AUTH-4: envía un código temporal al correo (el backend debe responder igual exista o no la cuenta). */
  async forgotPassword(email: string) {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  /** RF-AUTH-4: cambia la contraseña con el código recibido por correo. */
  async resetPassword(email: string, code: string, newPassword: string) {
    const response = await axiosInstance.post('/auth/reset-password', { email, code, newPassword });
    return response.data;
  },

  async googleLogin(googleToken: string, acceptedTerms = false) {
    const response = await axiosInstance.post('/auth/google', { token: googleToken, acceptedTerms });
    return response.data;
  },

  async githubLogin(code: string, acceptedTerms = false) {
    const response = await axiosInstance.post('/auth/github', { code, acceptedTerms });
    return response.data;
  },
};