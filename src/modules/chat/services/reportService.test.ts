import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reportService } from './reportService';

const post = vi.hoisted(() => vi.fn());
const httpDelete = vi.hoisted(() => vi.fn());
const httpPatch = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
      },
      post,
      delete: httpDelete,
      patch: httpPatch,
      get: vi.fn(),
    })),
  },
}));

vi.mock('../../authentication/services/authStore', () => ({
  authStore: {
    getAccessToken: vi.fn(() => 'access-token'),
  },
}));

vi.mock('../../authentication/services/deviceId', () => ({
  deviceId: {
    get: vi.fn(() => 'device-1'),
  },
}));

vi.mock('../config/reportConfig', () => ({
  REPORT_API_BASE: 'http://localhost:8080/api/v1',
  REPORT_CONFIG_ERROR: 'VITE_REPORT_API_URL no está configurada.',
}));

describe('reportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('crea el reporte y luego sube evidencia usando el reportId', async () => {
    post
      .mockResolvedValueOnce({ data: { reportID: 'report-1', taskId: 'task-7', reason: 'Problema' } })
      .mockResolvedValueOnce({ data: { url: 'https://example.test/evidencia.jpg' } });

    const file = new File(['evidencia'], 'evidencia.jpg', { type: 'image/jpeg' });

    const createdReport = await reportService.createReport(
      '  task-7  ',
      'Problema',
      ['u1', 'u2'],
      '  u1  '
    );
    await expect(reportService.uploadEvidence(file, createdReport.id!)).resolves.toBe(
      'https://example.test/evidencia.jpg'
    );

    const reportForm = post.mock.calls[0][1] as FormData;
    const uploadForm = post.mock.calls[1][1] as FormData;

    expect(reportForm.get('taskId')).toBe('task-7');
    expect(reportForm.get('createdBy')).toBe('u1');
    expect(uploadForm.get('file')).toBe(file);
    expect(uploadForm.has('taskId')).toBe(false);
    expect(uploadForm.has('folder')).toBe(false);
    expect(post).toHaveBeenNthCalledWith(1, '/reports', reportForm);
    expect(post).toHaveBeenNthCalledWith(2, '/files/reports/report-1/upload', uploadForm);
  });

  it('rechaza subir evidencia sin reportId y crear un reporte sin taskId', async () => {
    await expect(
      reportService.uploadEvidence(new File(['x'], 'x.txt'), '  ')
    ).rejects.toThrow('reporte no fue identificado');
    await expect(reportService.createReport('  ', 'Problema', ['u1', 'u2'], 'u1'))
      .rejects.toThrow('tarea del reporte');
  });

  it('elimina un reporte usando su reportId', async () => {
    httpDelete.mockResolvedValue({ data: null });
    await reportService.deleteReport('  report-1  ', '  u1  ');
    expect(httpDelete).toHaveBeenCalledWith('/reports/report-1', { params: { userId: 'u1' } });
  });

  it('rechaza eliminar un reporte sin reportId', async () => {
    await expect(reportService.deleteReport('  ', 'u1'))
      .rejects.toThrow('reporte no fue identificado');
  });

  it('marca un reporte como resuelto', async () => {
    httpPatch.mockResolvedValue({ data: null });
    await reportService.setReportStatus('  report-1  ', 'RESOLVED');
    expect(httpPatch).toHaveBeenCalledWith(
      '/reports/report-1/status',
      null,
      { params: { status: 'RESOLVED' } }
    );
  });
});
