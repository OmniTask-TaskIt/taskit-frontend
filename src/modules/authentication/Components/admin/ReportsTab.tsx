import { useEffect, useState } from 'react';
import { Check, X as XIcon } from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { AdminReport, Report } from '../../types/profile.types';
import StatusBadge from '../ui/StatusBadge';
import ReasonPromptModal from '../ui/ReasonPromptModal';

const STATUS_FILTERS: { value: Report['status'] | ''; label: string }[] = [
  { value: 'OPEN', label: 'Abiertos' },
  { value: '', label: 'Todos' },
  { value: 'RESOLVED', label: 'Resueltos' },
  { value: 'DISMISSED', label: 'Descartados' },
];

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

/** Persona involucrada en un reporte: nombre y correo si existen; si la cuenta ya no existe, su ID. */
function Person({ id, name, email }: { id: string; name?: string | null; email?: string | null }) {
  const label = name || email;
  if (!label) return <code className="text-white/60">{id}</code>;
  return (
    <span title={id}>
      <strong className="font-semibold text-white/70">{label}</strong>
      {name && email && <span className="text-white/40"> ({email})</span>}
    </span>
  );
}

export default function ReportsTab() {
  const [status, setStatus] = useState<Report['status'] | ''>('OPEN');
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState<{ report: AdminReport; nextStatus: 'RESOLVED' | 'DISMISSED' } | null>(
    null
  );

  const fetchReports = async (targetPage = 0) => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.listReports({ status: status || undefined, page: targetPage, size: PAGE_SIZE });
      setReports(data.content);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch {
      setError('No se pudo cargar la lista de reportes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await fetchReports(0);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const applyResolution = async (note: string) => {
    if (!pendingAction) return;
    const updated = await adminService.resolveReport(pendingAction.report.id, pendingAction.nextStatus, note);
    // resolveReport devuelve ReportResponseDTO (sin nombres): se fusiona para no perderlos.
    setReports((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    setPendingAction(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              status === f.value ? 'bg-[#263BAA] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}
      {loading ? (
        <p className="text-sm text-white/40">Cargando reportes...</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-white/40">No hay reportes con ese filtro.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {reports.map((report) => (
            <div key={report.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-white">{report.reason}</span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={report.status} />
                  <span className="text-[11px] text-white/40">{formatDate(report.createdAt)}</span>
                </div>
              </div>

              {report.comment && <p className="mt-2 text-sm text-white/70">{report.comment}</p>}

              <p className="mt-2 text-[11px] text-white/40">
                Reportado por <Person id={report.reporterId} name={report.reporterName} email={report.reporterEmail} /> contra{' '}
                <Person id={report.revieweeId} name={report.revieweeName} email={report.revieweeEmail} />
              </p>

              {report.resolutionNote && (
                <p className="mt-1 text-[11px] text-white/40">Resolución: {report.resolutionNote}</p>
              )}

              {report.status === 'OPEN' && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setPendingAction({ report, nextStatus: 'RESOLVED' })}
                    className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <Check size={13} /> Resolver
                  </button>
                  <button
                    onClick={() => setPendingAction({ report, nextStatus: 'DISMISSED' })}
                    className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/10 transition-colors"
                  >
                    <XIcon size={13} /> Descartar
                  </button>
                </div>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="mt-2 flex items-center justify-center gap-3 text-xs text-white/50">
              <button
                disabled={page === 0}
                onClick={() => fetchReports(page - 1)}
                className="rounded-lg border border-white/15 px-3 py-1.5 disabled:opacity-30"
              >
                Anterior
              </button>
              <span>
                Página {page + 1} de {totalPages}
              </span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => fetchReports(page + 1)}
                className="rounded-lg border border-white/15 px-3 py-1.5 disabled:opacity-30"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {pendingAction && (
        <ReasonPromptModal
          title={pendingAction.nextStatus === 'RESOLVED' ? 'Marcar reporte como resuelto' : 'Descartar reporte'}
          confirmLabel={pendingAction.nextStatus === 'RESOLVED' ? 'Resolver' : 'Descartar'}
          requireReason={false}
          onConfirm={applyResolution}
          onClose={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}
