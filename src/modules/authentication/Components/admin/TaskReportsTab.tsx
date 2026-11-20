import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ClipboardList, Download, FileText, LoaderCircle, MessageCircle, Paperclip, RefreshCw, Search, Trash2, Users, X } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { taskService } from '../../../tasks/services/taskService';
import { reportService } from '../../../chat/services/reportService';
import type { ReportFile, ReportMessage, TaskReport } from '../../types/profile.types';

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatFileSize(size?: number) {
  if (!size || size < 1) return '0 KB';
  if (size < 1024 * 1024) return `${Math.max(1, Math.ceil(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

async function findTaskName(report: TaskReport): Promise<string | null> {
  const users = report.users ?? [];
  const tasks = await Promise.all(users.flatMap((userId) => [
    taskService.getCreatedTasks(userId),
    taskService.getAssignedTasks(userId),
  ]));
  const task = tasks.flat().find((candidate) => candidate.taskId === report.taskId);
  return task?.taskName ?? null;
}

function getReportId(report: TaskReport): string | null {
  return report.id ?? report.reportID ?? report.reportId ?? null;
}

const taskNameCache = new Map<string, Promise<string | null>>();

async function getCachedTaskName(report: TaskReport): Promise<string | null> {
  if (!report.taskId) return null;
  if (!taskNameCache.has(report.taskId)) {
    taskNameCache.set(report.taskId, findTaskName(report));
  }
  return taskNameCache.get(report.taskId)!;
}

type TaskReportsTabProps = {
  fixedUserId?: string | null;
};

export default function TaskReportsTab({ fixedUserId }: TaskReportsTabProps = {}) {
  const fixedMode = fixedUserId !== undefined;
  const [reports, setReports] = useState<TaskReport[]>([]);
  const [userId, setUserId] = useState('');
  const [activeUserId, setActiveUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailView, setDetailView] = useState<'messages' | 'files' | null>(null);
  const [selectedReport, setSelectedReport] = useState<TaskReport | null>(null);
  const [messages, setMessages] = useState<ReportMessage[]>([]);
  const [files, setFiles] = useState<ReportFile[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [uploadingReportId, setUploadingReportId] = useState('');
  const [uploadNotice, setUploadNotice] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TaskReport | null>(null);
  const [deletingReportId, setDeletingReportId] = useState('');
  const [createdByMap, setCreatedByMap] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<'OPEN' | 'RESOLVED'>('OPEN');
  const [resolveTarget, setResolveTarget] = useState<TaskReport | null>(null);
  const [resolvingReportId, setResolvingReportId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<TaskReport | null>(null);

  const reportStatus = (report: TaskReport): 'OPEN' | 'RESOLVED' | 'DISMISSED' | string =>
    report.status?.toUpperCase() || 'OPEN';

  const canManageReport = (report: TaskReport) => {
    if (!fixedMode || !fixedUserId) return false;
    const reportId = getReportId(report);
    const createdBy = report.createdBy ?? (reportId ? createdByMap[reportId] : undefined);
    return Boolean(createdBy && createdBy === fixedUserId.trim());
  };

  const openMessages = async (report: TaskReport) => {
    const reportId = getReportId(report);
    if (!reportId) {
      setDetailError('Este reporte no tiene un ID válido.');
      setDetailView('messages');
      setSelectedReport(report);
      return;
    }
    setSelectedReport(report);
    setDetailView('messages');
    setDetailLoading(true);
    setDetailError('');
    setMessages([]);
    try {
      setMessages(await adminService.getTaskReportMessages(reportId));
    } catch {
      setDetailError('No se pudieron cargar los mensajes del reporte.');
    } finally {
      setDetailLoading(false);
    }
  };

  const openFiles = async (report: TaskReport) => {
    setSelectedReport(report);
    setDetailView('files');
    setDetailLoading(true);
    setDetailError('');
    setFiles([]);
    try {
      setFiles(await adminService.getTaskReportFiles(report.taskId));
    } catch {
      setDetailError('No se pudieron cargar los archivos adjuntos.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailView(null);
    setSelectedReport(null);
    setDetailError('');
  };

  const confirmDeleteReport = async () => {
    if (!deleteTarget) return;
    const reportId = getReportId(deleteTarget);
    if (!reportId) {
      setUploadError('Este reporte no tiene un reportId válido.');
      setDeleteTarget(null);
      return;
    }

    setDeletingReportId(reportId);
    setUploadNotice('');
    setUploadError('');
    try {
      const userId = fixedUserId?.trim();
      if (!userId) throw new Error('El usuario de la sesión no fue identificado.');
      await adminService.deleteTaskReport(reportId, userId);
      setReports((current) => current.filter((report) => getReportId(report) !== reportId));
      setUploadNotice('Reporte eliminado correctamente.');
      if (selectedReport && getReportId(selectedReport) === reportId) closeDetail();
    } catch (caught) {
      if (typeof caught === 'object' && caught !== null && 'response' in caught) {
        const status = (caught as { response?: { status?: number } }).response?.status;
        if (status === 403) {
          setUploadError('Solo el usuario que creó el reporte puede eliminarlo.');
        } else if (status === 404) {
          setUploadError('El reporte no existe o ya fue eliminado.');
        } else {
          setUploadError(`No se pudo eliminar el reporte (HTTP ${status ?? 'desconocido'}).`);
        }
      } else {
        setUploadError('No se pudo eliminar el reporte. Intenta nuevamente.');
      }
    } finally {
      setDeletingReportId('');
      setDeleteTarget(null);
    }
  };

  const confirmResolveReport = async () => {
    if (!resolveTarget) return;
    const reportId = getReportId(resolveTarget);
    if (!reportId) {
      setUploadError('Este reporte no tiene un reportId válido.');
      setResolveTarget(null);
      return;
    }
    setResolvingReportId(reportId);
    setUploadError('');
    setUploadNotice('');
    try {
      await adminService.resolveTaskReport(reportId);
      setReports((current) =>
        current.map((report) =>
          getReportId(report) === reportId ? { ...report, status: 'RESOLVED' } : report
        )
      );
      setUploadNotice('Reporte resuelto correctamente.');
    } catch (caught) {
      if (typeof caught === 'object' && caught !== null && 'response' in caught) {
        const status = (caught as { response?: { status?: number } }).response?.status;
        if (status === 404) {
          setUploadError('El backend no tiene disponible el endpoint para cambiar el estado del reporte.');
        } else {
          setUploadError(`No se pudo resolver el reporte (HTTP ${status ?? 'desconocido'}).`);
        }
      } else {
        setUploadError('No se pudo resolver el reporte. Intenta nuevamente.');
      }
    } finally {
      setResolvingReportId('');
      setResolveTarget(null);
    }
  };

  const startUpload = (report: TaskReport) => {
    const reportId = getReportId(report);
    if (!reportId) {
      setUploadError('Este reporte no tiene un reportId válido.');
      return;
    }
    uploadTargetRef.current = report;
    setUploadingReportId(reportId);
    setUploadNotice('');
    setUploadError('');
    fileInputRef.current?.click();
  };

  const uploadSelectedFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = '';
    const report = uploadTargetRef.current;
    const reportId = report ? getReportId(report) : null;
    if (!report || !reportId) return;
    if (selectedFiles.length === 0) {
      setUploadingReportId('');
      return;
    }

    setUploadingReportId(reportId);
    setUploadNotice('');
    setUploadError('');
    try {
      for (const file of selectedFiles) {
        await reportService.uploadEvidence(file, reportId);
      }
      setUploadNotice(
        `${selectedFiles.length === 1 ? 'Archivo agregado' : `${selectedFiles.length} archivos agregados`} al reporte.`
      );
      if (detailView === 'files' && selectedReport?.id === reportId) {
        setFiles(await adminService.getTaskReportFiles(report.taskId));
      }
    } catch {
      setUploadError('No se pudieron agregar los archivos al reporte.');
    } finally {
      setUploadingReportId('');
      uploadTargetRef.current = null;
    }
  };

  const loadReports = useCallback(async (filterUserId = '') => {
    setLoading(true);
    setError('');
    if (fixedMode && !filterUserId.trim()) {
      setReports([]);
      setError('No se encontró una identidad de sesión para consultar tus reportes.');
      setLoading(false);
      return;
    }
    try {
      const data = filterUserId
        ? await adminService.listTaskReportsByUser(filterUserId)
        : await adminService.listTaskReports();
      const receivedReports = Array.isArray(data) ? data : [];
      const loadedReports = receivedReports.filter((report) => reportStatus(report) === statusFilter);
      setReports(loadedReports);
      setActiveUserId(filterUserId);
      if (fixedMode) {
        void Promise.all(
          loadedReports.map(async (report) => {
            const reportId = getReportId(report);
            if (!reportId) return null;
            if (report.createdBy) return [reportId, report.createdBy] as const;
            try {
              return [reportId, await adminService.getTaskReportCreatedBy(reportId)] as const;
            } catch {
              return null;
            }
          })
        ).then((creatorEntries) => {
          setCreatedByMap((current) => {
            const next = { ...current };
            creatorEntries.forEach((entry) => {
              if (entry && entry[1]) next[entry[0]] = entry[1];
            });
            return next;
          });
        });
      }
      void Promise.all(loadedReports.map(async (report) => {
        if (report.taskName || !report.taskId) return report;
        try {
          return { ...report, taskName: await getCachedTaskName(report) };
        } catch {
          return report;
        }
      })).then((enrichedReports) => {
        setReports((current) => {
          const currentIds = new Set(
            current.map((report) => getReportId(report)).filter((id): id is string => Boolean(id))
          );
          return enrichedReports.filter((report) => {
            const reportId = getReportId(report);
            return reportId !== null && currentIds.has(reportId);
          });
        });
      });
    } catch (caught) {
      setReports([]);
      if (typeof caught === 'object' && caught !== null && 'response' in caught) {
        const response = (caught as { response?: { status?: number } }).response;
        if (response?.status) {
          setError(`No se pudieron cargar los reportes (HTTP ${response.status}). Intenta nuevamente.`);
          setLoading(false);
          return;
        }
      }
      setError('No se pudieron cargar los reportes de tarea. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [fixedMode, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => void loadReports(fixedUserId?.trim() || ''),
      0
    );
    return () => window.clearTimeout(timer);
  }, [fixedUserId, loadReports, statusFilter]);

  const submitFilter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadReports(userId.trim());
  };

  const clearFilter = () => {
    setUserId('');
    void loadReports();
  };

  return (
    <section className="flex flex-col gap-4" aria-label="Reportes de tarea">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="sr-only"
        aria-label="Agregar archivos al reporte"
        onChange={(event) => void uploadSelectedFiles(event)}
      />
      <div className="flex flex-wrap gap-2">
        {([
          ['OPEN', 'Abiertos'],
          ['RESOLVED', 'Resueltos'],
        ] as const).map(([value, label]) => (
          <button
            type="button"
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === value
                ? 'bg-[#263BAA] text-white'
                : 'border border-[#d9deef] bg-white text-[#5b6685] hover:bg-[#eef1ff]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {uploadNotice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{uploadNotice}</p>}
      {uploadError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{uploadError}</p>}
      {!fixedMode && <form onSubmit={submitFilter} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="task-report-user" className="sr-only">Filtrar por ID de usuario</label>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 focus-within:border-[#7183ff]">
          <Search size={16} className="shrink-0 text-white/40" />
          <input
            id="task-report-user"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="Filtrar por ID de usuario"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-white/40"
          />
        </div>
        <button type="submit" disabled={loading} className="rounded-xl bg-[#263BAA] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#334bd1] disabled:opacity-50">
          Buscar
        </button>
        {activeUserId && <button type="button" onClick={clearFilter} disabled={loading} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 disabled:opacity-50">Ver todos</button>}
        <button type="button" aria-label="Actualizar reportes" onClick={() => void loadReports(activeUserId)} disabled={loading} className="flex items-center justify-center rounded-xl border border-white/15 px-3 py-2.5 text-white/70 hover:bg-white/10 disabled:opacity-50">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </form>}

      {fixedMode ? (
        <div className="flex items-center justify-end">
          <button type="button" aria-label="Actualizar reportes" onClick={() => void loadReports(fixedUserId?.trim() || '')} disabled={loading} className="flex items-center justify-center rounded-xl border border-[#d9deef] bg-white px-3 py-2 text-sm text-[#263BAA] shadow-sm hover:bg-[#f4f6fc] disabled:opacity-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      ) : activeUserId && (
        <p className="text-xs text-white/50">Filtrando por usuario: <code className="text-white/70">{activeUserId}</code></p>
      )}
      {error && <div role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{error}</div>}
      {loading ? (
        <p className={fixedMode ? 'py-6 text-center text-sm text-[#7883a3]' : 'py-6 text-center text-sm text-white/40'}>
          Cargando reportes de tarea...
        </p>
      ) : reports.length === 0 ? (
        <div className={fixedMode ? 'rounded-xl border border-dashed border-[#d9deef] bg-[#f8f9fd] px-4 py-10 text-center' : 'rounded-xl border border-dashed border-white/15 px-4 py-10 text-center'}>
          <ClipboardList className={fixedMode ? 'mx-auto mb-2 text-[#a0a8bd]' : 'mx-auto mb-2 text-white/30'} size={22} />
          <p className={fixedMode ? 'text-sm text-[#7883a3]' : 'text-sm text-white/50'}>
            {fixedUserId ? 'No hay reportes vinculados a tu sesión.' : 'No hay reportes de tarea.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {reports.map((report, index) => (
            <article
              key={getReportId(report) ?? `${report.taskId}-${index}`}
              className={fixedMode
                ? 'rounded-xl border border-[#dfe4f2] bg-[#f8f9fd] p-4 text-[#17213f]'
                : 'rounded-xl border border-white/10 bg-white/5 p-4'}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={fixedMode ? 'text-xs font-semibold uppercase tracking-wide text-[#7883a3]' : 'text-xs font-semibold uppercase tracking-wide text-white/40'}>Tarea</p>
                  {report.taskName && <p className={fixedMode ? 'mt-1 break-words text-sm font-semibold text-[#17213f]' : 'mt-1 break-words text-sm font-semibold text-white'}>{report.taskName}</p>}
                  <p className={fixedMode ? 'mt-1 break-all font-mono text-xs text-[#7883a3]' : 'mt-1 break-all font-mono text-xs text-white/60'}>{report.taskId}</p>
                </div>
                {formatDate(report.createdAt) && <time dateTime={report.createdAt} className={fixedMode ? 'text-xs text-[#7883a3]' : 'text-xs text-white/40'}>{formatDate(report.createdAt)}</time>}
              </div>
              <p className={fixedMode ? 'mt-3 whitespace-pre-wrap text-sm text-[#17213f]' : 'mt-3 whitespace-pre-wrap text-sm text-white'}>{report.reason}</p>
              {report.users && report.users.length > 0 && (
                <div className={fixedMode ? 'mt-3 flex items-start gap-2 text-xs text-[#7883a3]' : 'mt-3 flex items-start gap-2 text-xs text-white/50'}>
                  <Users size={14} className="mt-0.5 shrink-0" />
                  <span className="break-all">Participantes: {report.users.join(', ')}</span>
                </div>
              )}
              {report.id && <p className={fixedMode ? 'mt-2 text-[11px] text-[#7883a3]' : 'mt-2 text-[11px] text-white/30'}>Reporte: {report.id}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void openMessages(report)}
                  className={fixedMode
                    ? 'flex items-center gap-1.5 rounded-lg bg-[#263BAA] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1a297a]'
                    : 'flex items-center gap-1.5 rounded-lg border border-[#7183ff]/30 bg-[#263BAA]/25 px-3 py-2 text-xs font-semibold text-[#e8ecff] hover:bg-[#263BAA]/40'}
                >
                  <MessageCircle size={14} /> Ver mensajes
                </button>
                <button
                  type="button"
                  onClick={() => void openFiles(report)}
                  className={fixedMode
                    ? 'flex items-center gap-1.5 rounded-lg border border-[#cfd6ea] bg-white px-3 py-2 text-xs font-semibold text-[#263BAA] hover:bg-[#eef1ff]'
                    : 'flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10'}
                >
                  <FileText size={14} /> Ver archivos adjuntos
                </button>
                {!fixedMode && reportStatus(report) === 'OPEN' && (
                  <button
                    type="button"
                    onClick={() => setResolveTarget(report)}
                    disabled={Boolean(resolvingReportId)}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resolvingReportId === getReportId(report) ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Resolver
                  </button>
                )}
                {fixedMode && (
                  <button
                    type="button"
                    onClick={() => startUpload(report)}
                    disabled={Boolean(uploadingReportId)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#cfd6ea] bg-white px-3 py-2 text-xs font-semibold text-[#177245] hover:bg-[#e8f7ef] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploadingReportId === getReportId(report) ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <Paperclip size={14} />
                    )}
                    Agregar archivos
                  </button>
                )}
                {canManageReport(report) && (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(report)}
                    disabled={Boolean(deletingReportId)}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={14} /> Eliminar reporte
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {detailView && selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050914]/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetail();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e4e8f3] bg-white p-5 text-[#17213f] shadow-2xl sm:p-6"
          >
            <header className="flex items-start justify-between gap-4 border-b border-[#e4e8f3] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7883a3]">
                  {detailView === 'messages' ? 'Mensajes del reporte' : 'Archivos adjuntos'}
                </p>
                <h2 className="mt-1 text-lg font-bold">{selectedReport.taskName || selectedReport.taskId}</h2>
                {selectedReport.taskName && <p className="mt-1 break-all font-mono text-xs text-[#7883a3]">{selectedReport.taskId}</p>}
              </div>
              <button type="button" aria-label="Cerrar" onClick={closeDetail} className="rounded-lg p-2 text-[#7883a3] hover:bg-[#f1f3fa] hover:text-[#17213f]">
                <X size={18} />
              </button>
            </header>

            {detailLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#7883a3]">
                <LoaderCircle size={17} className="animate-spin" /> Cargando...
              </div>
            ) : detailError ? (
              <p role="alert" className="mt-4 rounded-xl bg-[#fff0f2] px-4 py-3 text-sm text-[#b64055]">{detailError}</p>
            ) : detailView === 'messages' ? (
              messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#7883a3]">Este reporte no tiene mensajes disponibles.</p>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  {messages.map((message, index) => (
                    <article key={message.messageId ?? `${message.timestamp}-${index}`} className="rounded-xl border border-[#e4e8f3] bg-[#f8f9fd] p-4">
                      <div className="flex flex-wrap justify-between gap-2">
                        <span className="break-all text-xs font-semibold text-[#263BAA]">{message.senderId}</span>
                        {formatDate(message.timestamp) && <time className="text-xs text-[#7883a3]">{formatDate(message.timestamp)}</time>}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    </article>
                  ))}
                </div>
              )
            ) : files.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#7883a3]">Este reporte no tiene archivos adjuntos.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                {files.map((file, index) => (
                  <a
                    key={file.key || `${file.fileName}-${index}`}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#e4e8f3] px-4 py-3 hover:bg-[#f8f9fd]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{file.fileName || 'Archivo adjunto'}</p>
                      <p className="mt-1 text-xs text-[#7883a3]">{formatFileSize(file.size)}</p>
                    </div>
                    <Download size={17} className="shrink-0 text-[#263BAA]" />
                  </a>
                ))}
              </div>
            )}

          </section>
        </div>
      )}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050914]/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deletingReportId) setDeleteTarget(null);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="delete-report-title" className="w-full max-w-md rounded-2xl border border-[#e4e8f3] bg-white p-6 text-[#17213f] shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Trash2 size={19} />
              </span>
              <div>
                <h2 id="delete-report-title" className="text-lg font-bold">¿Estás seguro que quieres eliminar este reporte?</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#7883a3]">Esta acción eliminará el reporte de forma permanente.</p>
              </div>
            </div>
            <footer className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={Boolean(deletingReportId)} onClick={() => setDeleteTarget(null)} className="rounded-xl border border-[#d9deef] px-4 py-2.5 text-sm font-semibold text-[#5b6685] hover:bg-[#f4f6fc] disabled:opacity-50">Cancelar</button>
              <button type="button" disabled={Boolean(deletingReportId)} onClick={() => void confirmDeleteReport()} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
                {deletingReportId ? 'Eliminando...' : 'Sí, eliminar reporte'}
              </button>
            </footer>
          </section>
        </div>
      )}
      {resolveTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050914]/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !resolvingReportId) setResolveTarget(null);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="resolve-report-title" className="w-full max-w-md rounded-2xl border border-[#e4e8f3] bg-white p-6 text-[#17213f] shadow-2xl">
            <h2 id="resolve-report-title" className="text-lg font-bold">¿Resolver este reporte de tarea?</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#7883a3]">
              El reporte quedará marcado como RESOLVED.
            </p>
            <footer className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={Boolean(resolvingReportId)} onClick={() => setResolveTarget(null)} className="rounded-xl border border-[#d9deef] px-4 py-2.5 text-sm font-semibold text-[#5b6685] hover:bg-[#f4f6fc] disabled:opacity-50">Cancelar</button>
              <button type="button" disabled={Boolean(resolvingReportId)} onClick={() => void confirmResolveReport()} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                {resolvingReportId ? 'Resolviendo...' : 'Resolver reporte'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
