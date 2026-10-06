import { axiosInstance } from '../Config/axios';
import type { ActiveSession } from '../types/session.types';

export const sessionService = {
  /** RF-AUTH-10: sesiones activas del usuario; la del dispositivo actual viene con `current: true`. */
  async list() {
    const response = await axiosInstance.get<ActiveSession[]>('/auth/sessions');
    return response.data;
  },

  /** RF-AUTH-10: cierra de forma remota una sesión sin afectar las demás. */
  async revoke(sessionId: string) {
    const response = await axiosInstance.delete<{ message: string }>(`/auth/sessions/${sessionId}`);
    return response.data;
  },
};
