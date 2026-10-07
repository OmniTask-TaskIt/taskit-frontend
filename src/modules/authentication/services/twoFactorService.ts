import { axiosInstance } from '../Config/axios';

type Message = { message: string };

/** RF-AUTH-9: activar y desactivar la verificación en dos pasos por correo (cada cambio se confirma con un código). */
export const twoFactorService = {
  async status() {
    const response = await axiosInstance.get<{ enabled: boolean }>('/auth/2fa/status');
    return response.data.enabled;
  },

  /** Paso 1 de activar: envía el código al correo. */
  async requestEnable() {
    const response = await axiosInstance.post<Message>('/auth/2fa/enable');
    return response.data;
  },

  /** Paso 2 de activar: con el código correcto el segundo factor queda activo. */
  async confirmEnable(code: string) {
    const response = await axiosInstance.post<Message>('/auth/2fa/enable/confirm', { code });
    return response.data;
  },

  /** Paso 1 de desactivar: envía el código al correo. */
  async requestDisable() {
    const response = await axiosInstance.post<Message>('/auth/2fa/disable');
    return response.data;
  },

  /** Paso 2 de desactivar: con el código correcto el segundo factor queda desactivado. */
  async confirmDisable(code: string) {
    const response = await axiosInstance.post<Message>('/auth/2fa/disable/confirm', { code });
    return response.data;
  },
};
