import axios from 'axios';
import { authStore } from '../services/authStore';
import { env } from './env';
import { redirectToLogin } from '../../../utils/navigation';
import { deviceId } from '../services/deviceId';

const API_BASE = `${env.apiUrl}/api/v1`;
const AUTH_URL = `${API_BASE}/auth`;

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = authStore.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // RF-AUTH-11/13: el backend reconoce el dispositivo por este identificador (ver services/deviceId.ts).
    config.headers['X-Device-Id'] = deviceId.get();
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

const processQueue = (error: unknown, token: null | string = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isLoginRequest = originalRequest?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;

      const refreshToken = authStore.getRefreshToken();

      if (!refreshToken) {
        authStore.clearSession();
        redirectToLogin();
        return Promise.reject(error);
      }

      // Se marca recién aquí: si se marcara antes del `return` de arriba,
      // `isRefreshing` se quedaría en true y los 401 siguientes se encolarían para siempre.
      isRefreshing = true;

      try {
        // El backend (RefreshTokenRequestDTO) exige `email` y `refreshToken`.
        const response = await axios.post(`${AUTH_URL}/refresh`, {
          email: authStore.getEmail(),
          refreshToken,
        });
        const { accessToken, refreshToken: rotatedRefreshToken, newRefreshToken } = response.data;

        authStore.setTokens(accessToken, newRefreshToken || rotatedRefreshToken || refreshToken);

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authStore.clearSession();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
