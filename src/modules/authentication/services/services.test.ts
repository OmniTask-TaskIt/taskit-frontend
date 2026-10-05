import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { axiosInstance } from '../Config/axios';
import { authService } from './authService';
import { profileService } from './profileService';
import { reviewService } from './reviewService';
import { adminService } from './adminService';

// Estas pruebas fijan el CONTRATO HTTP con el backend AuthAndProfiles
// (rutas, verbos y dónde viaja cada dato). Si alguien cambia un endpoint en
// el front o en el back, una de estas pruebas debería avisar.
vi.mock('../Config/axios', () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const http = vi.mocked(axiosInstance);

describe('servicios HTTP de AuthAndProfiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: 'respuesta' });
    http.post.mockResolvedValue({ data: 'respuesta' });
    http.patch.mockResolvedValue({ data: 'respuesta' });
    http.delete.mockResolvedValue({ data: 'respuesta' });
  });

  describe('authService', () => {
    it('login y register envían el cuerpo a /auth/*', async () => {
      await authService.login({ email: 'a@gmail.com', password: 'x' });
      expect(http.post).toHaveBeenCalledWith('/auth/login', { email: 'a@gmail.com', password: 'x' });

      const data = { name: 'A', email: 'a@gmail.com', password: 'x', role: 'SEEKER' as const, acceptedTerms: true };
      await authService.register(data);
      expect(http.post).toHaveBeenCalledWith('/auth/register', data);
    });

    it('verifyOtp y resendOtp usan email (y otpCode)', async () => {
      await authService.verifyOtp('a@gmail.com', '123456');
      expect(http.post).toHaveBeenCalledWith('/auth/verify-otp', { email: 'a@gmail.com', otpCode: '123456' });

      await authService.resendOtp('a@gmail.com');
      expect(http.post).toHaveBeenCalledWith('/auth/resend-otp', { email: 'a@gmail.com' });
    });

    it('googleLogin y githubLogin envían acceptedTerms (false por defecto)', async () => {
      await authService.googleLogin('tok');
      expect(http.post).toHaveBeenCalledWith('/auth/google', { token: 'tok', acceptedTerms: false });

      await authService.githubLogin('code', true);
      expect(http.post).toHaveBeenCalledWith('/auth/github', { code: 'code', acceptedTerms: true });
    });

    it('switchRole manda email y newRole como query params (el backend usa @RequestParam)', async () => {
      await authService.switchRole('a@gmail.com', 'PROVIDER');
      expect(http.post).toHaveBeenCalledWith('/profiles/switch-role', null, {
        params: { email: 'a@gmail.com', newRole: 'PROVIDER' },
      });
    });
  });

  describe('profileService', () => {
    it('getProfile, searchProfiles y deleteAccount', async () => {
      expect(await profileService.getProfile('u1')).toBe('respuesta');
      expect(http.get).toHaveBeenCalledWith('/profiles/u1');

      await profileService.searchProfiles('Ana');
      expect(http.get).toHaveBeenCalledWith('/profiles/search', { params: { name: 'Ana' } });

      await profileService.deleteAccount('a@gmail.com');
      expect(http.delete).toHaveBeenCalledWith('/profiles/a@gmail.com');
    });

    it('updateProfile manda los campos como query params (el backend usa @RequestParam, no body)', async () => {
      const payload = { description: 'Hola', categories: ['Plomería'] };
      await profileService.updateProfile('u1', payload);

      expect(http.patch).toHaveBeenCalledWith('/profiles/u1', null, expect.objectContaining({ params: payload }));
    });

    it('las categorías viajan como Spring las espera: categories=a&categories=b (sin corchetes)', async () => {
      await profileService.updateProfile('u1', { description: 'Hola', categories: ['Plomería', 'Electricidad'] });

      const config = http.patch.mock.calls[0][2]!;
      const uri = axios.getUri({ url: '/profiles/u1', params: config.params, paramsSerializer: config.paramsSerializer });

      // Con el serializador por defecto de axios saldría `categories%5B%5D=` y el backend las ignoraría.
      expect(uri).toBe('/profiles/u1?description=Hola&categories=Plomer%C3%ADa&categories=Electricidad');
      expect(uri).not.toContain('%5B%5D');
    });

    it('uploadPhoto y uploadDocument envían multipart con el campo "file"', async () => {
      const file = new File(['x'], 'foto.png', { type: 'image/png' });

      await profileService.uploadPhoto('u1', file);
      await profileService.uploadDocument('u1', file);

      const [photoUrl, photoBody, photoCfg] = http.post.mock.calls[0];
      expect(photoUrl).toBe('/profiles/u1/photo');
      expect((photoBody as FormData).get('file')).toBe(file);
      expect(photoCfg).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });

      const [docUrl, docBody] = http.post.mock.calls[1];
      expect(docUrl).toBe('/profiles/u1/document');
      expect((docBody as FormData).get('file')).toBe(file);
    });

    it('reportProfile envía motivo y comentario en el cuerpo', async () => {
      await profileService.reportProfile('u1', 'FRAUD', 'Pidió dinero por fuera');
      expect(http.post).toHaveBeenCalledWith('/profiles/u1/reports', { reason: 'FRAUD', comment: 'Pidió dinero por fuera' });
    });
  });

  describe('reviewService', () => {
    it('getUserReviews pagina con page=0 y size=10 por defecto', async () => {
      await reviewService.getUserReviews('u1');
      expect(http.get).toHaveBeenCalledWith('/reviews/user/u1', { params: { page: 0, size: 10 } });

      await reviewService.getUserReviews('u1', 2, 5);
      expect(http.get).toHaveBeenCalledWith('/reviews/user/u1', { params: { page: 2, size: 5 } });
    });
  });

  describe('adminService', () => {
    it('usuarios: listar y cambiar estado', async () => {
      await adminService.listUsers({ status: 'ACTIVE', q: 'ana', page: 1, size: 10 });
      expect(http.get).toHaveBeenCalledWith('/admin/users', { params: { status: 'ACTIVE', q: 'ana', page: 1, size: 10 } });

      await adminService.updateUserStatus('u1', 'BLOCKED', 'Fraude');
      expect(http.patch).toHaveBeenCalledWith('/admin/users/u1/status', { status: 'BLOCKED', reason: 'Fraude' });
    });

    it('verificaciones: cola, acceso al documento y resolución', async () => {
      await adminService.listVerifications({ status: 'PENDING_REVIEW', page: 0, size: 10 });
      expect(http.get).toHaveBeenCalledWith('/admin/verification-documents', {
        params: { status: 'PENDING_REVIEW', page: 0, size: 10 },
      });

      await adminService.getVerificationDocumentAccess('u1');
      expect(http.get).toHaveBeenCalledWith('/admin/verification-documents/u1/access');

      await adminService.resolveVerification('u1', 'APPROVED', '');
      expect(http.post).toHaveBeenCalledWith('/admin/verification-documents/u1/resolution', {
        decision: 'APPROVED',
        reason: '',
      });
    });

    it('reportes: listar y resolver', async () => {
      await adminService.listReports({ status: 'OPEN', page: 0, size: 10 });
      expect(http.get).toHaveBeenCalledWith('/admin/reports', { params: { status: 'OPEN', page: 0, size: 10 } });

      await adminService.resolveReport('r1', 'DISMISSED', 'Sin evidencia');
      expect(http.patch).toHaveBeenCalledWith('/admin/reports/r1/status', { status: 'DISMISSED', note: 'Sin evidencia' });
    });
  });
});
