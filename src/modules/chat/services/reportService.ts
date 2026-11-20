import { axiosInstance } from '../../authentication/Config/axios';

export const reportService = {
  async uploadEvidence(file: File, taskId: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);
    formData.append('folder', 'reports');
    const response = await axiosInstance.post<{ url: string }>('/files/upload', formData);
    if (!response.data?.url) throw new Error('El servidor no devolvió la URL del archivo.');
    return response.data.url;
  },

  async createReport(taskId: string, reason: string, users: string[]): Promise<void> {
    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('reason', reason);
    users.forEach((userId) => formData.append('users', userId));
    await axiosInstance.post('/reports', formData);
  },
};
