import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, RefreshCw, Search, Users } from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { TaskReport } from '../../types/profile.types';

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function TaskReportsTab() {
  const [reports, setReports] = useState<TaskReport[]>([]);
  const [userId, setUserId] = useState('');
  const [activeUserId, setActiveUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async (filterUserId = '') => {
    setLoading(true);
    setError('');
    try {
      const data = filterUserId
        ? await adminService.listTaskReportsByUser(filterUserId)
        : await adminService.listTaskReports();
      setReports(Array.isArray(data) ? data : []);
      setActiveUserId(filterUserId);
    } catch {
      setReports([]);
      setError('No se pudieron cargar los reportes de tarea. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadReports(), 0);
    return () => window.clearTimeout(timer);
  }, [loadReports]);

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
      <form onSubmit={submitFilter} className="flex flex-col gap-2 sm:flex-row">
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
      </form>

      {activeUserId && <p className="text-xs text-white/50">Filtrando por usuario: <code className="text-white/70">{activeUserId}</code></p>}
      {error && <div role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{error}</div>}
      {loading ? (
        <p className="py-6 text-center text-sm text-white/40">Cargando reportes de tarea...</p>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center">
          <ClipboardList className="mx-auto mb-2 text-white/30" size={22} />
          <p className="text-sm text-white/50">{activeUserId ? 'No hay reportes para ese usuario.' : 'No hay reportes de tarea.'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {reports.map((report, index) => (
            <article key={report.id ?? `${report.taskId}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Tarea</p>
                  <p className="mt-1 break-all font-mono text-sm text-white/80">{report.taskId}</p>
                </div>
                {formatDate(report.createdAt) && <time dateTime={report.createdAt} className="text-xs text-white/40">{formatDate(report.createdAt)}</time>}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-white">{report.reason}</p>
              {report.users && report.users.length > 0 && (
                <div className="mt-3 flex items-start gap-2 text-xs text-white/50">
                  <Users size={14} className="mt-0.5 shrink-0" />
                  <span className="break-all">Participantes: {report.users.join(', ')}</span>
                </div>
              )}
              {report.id && <p className="mt-2 text-[11px] text-white/30">Reporte: {report.id}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
