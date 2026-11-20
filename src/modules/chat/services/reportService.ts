import axios from 'axios';
import { authStore } from '../../authentication/services/authStore';
import { deviceId } from '../../authentication/services/deviceId';
import { REPORT_API_BASE, REPORT_CONFIG_ERROR } from '../config/reportConfig';

function getReportClient() {
  if (!REPORT_API_BASE) throw new Error(REPORT_CONFIG_ERROR);

  const client = axios.create({ baseURL: REPORT_API_BASE });
  client.interceptors.request.use((config) => {
    const token = authStore.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Device-Id'] = deviceId.get();
    return config;
  });
  return client;
}

export const reportService = {
  async uploadEvidence(file: File, taskId: string): Promise<string> {
    const client = getReportClient();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);
    formData.append('folder', 'reports');
    const response = await client.post<{ url: string }>('/files/upload', formData);
    if (!response.data?.url) throw new Error('El servidor no devolvió la URL del archivo.');
    return response.data.url;
  },

  async createReport(taskId: string, reason: string, users: string[]): Promise<void> {
    const client = getReportClient();
    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('reason', reason);
    users.forEach((userId) => formData.append('users', userId));
    await client.post('/reports', formData);
  },
};
