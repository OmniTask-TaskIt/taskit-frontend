import axios from 'axios';
import { authStore } from '../../authentication/services/authStore';
import { deviceId } from '../../authentication/services/deviceId';
import { REPORT_API_BASE, REPORT_CONFIG_ERROR } from '../config/reportConfig';
import type { ReportFile, ReportMessage, TaskReport } from '../../authentication/types/profile.types';

function getReportClient() {
  if (!REPORT_API_BASE) throw new Error(REPORT_CONFIG_ERROR);

  const client = axios.create({ baseURL: REPORT_API_BASE, timeout: 15000 });
  client.interceptors.request.use((config) => {
    const token = authStore.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Device-Id'] = deviceId.get();
    return config;
  });
  return client;
}

export const reportService = {
  async uploadEvidence(file: File, reportId: string): Promise<string> {
    const normalizedReportId = reportId.trim();
    if (!normalizedReportId) throw new Error('El reporte no fue identificado.');
    const client = getReportClient();
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post<{ url: string }>(
      `/files/reports/${encodeURIComponent(normalizedReportId)}/upload`,
      formData
    );
    if (!response.data?.url) throw new Error('El servidor no devolvió la URL del archivo.');
    return response.data.url;
  },

  async createReport(
    taskId: string,
    reason: string,
    users: string[],
    createdBy: string
  ): Promise<TaskReport> {
    const normalizedTaskId = taskId.trim();
    if (!normalizedTaskId) throw new Error('La tarea del reporte no fue identificada.');
    const normalizedCreatedBy = createdBy.trim();
    if (!normalizedCreatedBy) throw new Error('El usuario creador no fue identificado.');
    const client = getReportClient();
    const formData = new FormData();
    formData.append('taskId', normalizedTaskId);
    formData.append('reason', reason);
    users.forEach((userId) => formData.append('users', userId));
    formData.append('createdBy', normalizedCreatedBy);
    const response = await client.post<TaskReport>('/reports', formData);
    const report = normalizeReport(response.data);
    if (!report.id) throw new Error('El servidor no devolvió el reportId del reporte creado.');
    return report;
  },

  async listReports(): Promise<TaskReport[]> {
    const response = await getReportClient().get<TaskReport[]>('/reports');
    return normalizeReports(unwrapReportList(response.data));
  },

  async listReportsByUser(userId: string): Promise<TaskReport[]> {
    const response = await getReportClient().get<TaskReport[]>(
      `/reports/user/${encodeURIComponent(userId)}`
    );
    return normalizeReports(unwrapReportList(response.data));
  },

  async getReportMessages(reportId: string): Promise<ReportMessage[]> {
    const response = await getReportClient().get<ReportMessage[]>(
      `/reports/${encodeURIComponent(reportId)}/messages`
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  async getReportFiles(taskId: string): Promise<ReportFile[]> {
    const response = await getReportClient().get<ReportFile[]>(
      `/files/task/${encodeURIComponent(taskId)}`
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  async getReportCreatedBy(reportId: string): Promise<string> {
    const normalizedReportId = reportId.trim();
    if (!normalizedReportId) throw new Error('El reporte no fue identificado.');
    const response = await getReportClient().get<string>(
      `/reports/${encodeURIComponent(normalizedReportId)}/created-by`
    );
    return typeof response.data === 'string' ? response.data.trim() : '';
  },

  async setReportStatus(reportId: string, status: 'RESOLVED' | 'DISMISSED'): Promise<void> {
    const normalizedReportId = reportId.trim();
    if (!normalizedReportId) throw new Error('El reporte no fue identificado.');
    const normalizedStatus = status.trim();
    if (!normalizedStatus) throw new Error('El estado del reporte no fue indicado.');
    await getReportClient().patch(
      `/reports/${encodeURIComponent(normalizedReportId)}/status`,
      null,
      { params: { status: normalizedStatus } }
    );
  },

  async deleteReport(reportId: string, userId: string): Promise<void> {
    const normalizedReportId = reportId.trim();
    if (!normalizedReportId) throw new Error('El reporte no fue identificado.');
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) throw new Error('El usuario no fue identificado.');
    await getReportClient().delete(
      `/reports/${encodeURIComponent(normalizedReportId)}`,
      { params: { userId: normalizedUserId } }
    );
  },
};

function normalizeReports(reports: TaskReport[]): TaskReport[] {
  return reports.map(normalizeReport);
}

function normalizeReport(report: TaskReport): TaskReport {
  return {
    ...report,
    id: report.id ?? report.reportID ?? report.reportId,
    createdAt: report.createdAt ?? report.timestamp,
  };
}

function unwrapReportList(data: unknown): TaskReport[] {
  if (Array.isArray(data)) return data as TaskReport[];
  if (data && typeof data === 'object') {
    const body = data as { data?: unknown; reports?: unknown; content?: unknown };
    if (Array.isArray(body.data)) return body.data as TaskReport[];
    if (Array.isArray(body.reports)) return body.reports as TaskReport[];
    if (Array.isArray(body.content)) return body.content as TaskReport[];
  }
  return [];
}
