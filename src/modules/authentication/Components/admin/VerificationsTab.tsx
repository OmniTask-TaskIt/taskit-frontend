import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, ShieldCheck, ShieldX } from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { Profile, VerificationStatus } from '../../types/profile.types';
import type { VerificationDecision } from '../../types/admin.types';
import StatusBadge from '../ui/StatusBadge';
import ReasonPromptModal from '../ui/ReasonPromptModal';

const STATUS_FILTERS: { value: VerificationStatus; label: string }[] = [
  { value: 'PENDING_REVIEW', label: 'En revisión' },
  { value: 'VERIFIED', label: 'Verificados' },
  { value: 'REJECTED', label: 'Rechazados' },
  { value: 'UNVERIFIED', label: 'Sin verificar' },
];

const PAGE_SIZE = 10;

/**
 * Cola de verificaciones de identidad (GET /admin/verification-documents).
 * Por defecto muestra las pendientes de revisión, de la más antigua a la más
 * reciente; los demás filtros sirven para auditar el historial.
 */
export default function VerificationsTab() {
  const [status, setStatus] = useState<VerificationStatus>('PENDING_REVIEW');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [docError, setDocError] = useState('');
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);
  const [pendingDecision, setPendingDecision] = useState<{ profile: Profile; decision: VerificationDecision } | null>(
    null
  );

  const fetchQueue = useCallback(
    async (targetPage = 0) => {
      setLoading(true);
      setError('');
      try {
        const data = await adminService.listVerifications({ status, page: targetPage, size: PAGE_SIZE });
        setProfiles(data.content);
        setPage(data.page);
        setTotalPages(data.totalPages);
      } catch {
        setError('No se pudo cargar la cola de verificaciones.');
      } finally {
        setLoading(false);
      }
    },
    [status]
  );

  useEffect(() => {
    // Se invoca como tarea asíncrona para no actualizar estado de forma síncrona dentro del efecto.
    void (async () => {
      await fetchQueue(0);
    })();
  }, [fetchQueue]);

  const viewDocument = async (userId: string) => {
    setDocError('');
    setLoadingDoc(userId);
    try {
      const access = await adminService.getVerificationDocumentAccess(userId);
      window.open(access.url, '_blank', 'noopener,noreferrer');
    } catch {
      setDocError('No se pudo obtener el enlace al documento. ¿El usuario ya subió uno?');
    } finally {
      setLoadingDoc(null);
    }
  };

  const applyDecision = async (reason: string) => {
    if (!pendingDecision) return;
    const updated = await adminService.resolveVerification(pendingDecision.profile.userId, pendingDecision.decision, reason);
    // El perfil resuelto deja de pertenecer a la cola que se está viendo.
    setProfiles((prev) =>
      updated.identityVerificationStatus === status
        ? prev.map((p) => (p.userId === updated.userId ? { ...p, ...updated } : p))
        : prev.filter((p) => p.userId !== updated.userId)
    );
    setPendingDecision(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            aria-pressed={status === f.value}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              status === f.value ? 'bg-[#263BAA] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}
      {docError && <p className="text-sm text-rose-400">{docError}</p>}

      {loading ? (
        <p className="text-sm text-white/40">Cargando verificaciones...</p>
      ) : profiles.length === 0 ? (
        <p className="text-sm text-white/40">No hay verificaciones con ese estado.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {profiles.map((profile) => (
            <div
              key={profile.userId}
              className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-semibold text-white">
                    {profile.fullName || 'Profesional TaskIt'}
                  </span>
                  <StatusBadge status={profile.identityVerificationStatus} />
                </div>
                <p className="mt-0.5 truncate text-xs text-white/50">{profile.userId}</p>
              </div>

              <div className="flex flex-shrink-0 flex-wrap gap-2">
                <button
                  onClick={() => viewDocument(profile.userId)}
                  disabled={loadingDoc === profile.userId}
                  className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10 transition-colors disabled:opacity-60"
                >
                  <ExternalLink size={13} /> {loadingDoc === profile.userId ? 'Abriendo...' : 'Ver documento'}
                </button>
                {profile.identityVerificationStatus === 'PENDING_REVIEW' && (
                  <>
                    <button
                      onClick={() => setPendingDecision({ profile, decision: 'APPROVED' })}
                      className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    >
                      <ShieldCheck size={13} /> Aprobar
                    </button>
                    <button
                      onClick={() => setPendingDecision({ profile, decision: 'REJECTED' })}
                      className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                      <ShieldX size={13} /> Rechazar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-white/50">
          <button
            onClick={() => fetchQueue(page - 1)}
            disabled={page === 0 || loading}
            aria-label="Página anterior"
            className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 hover:bg-white/10 disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Anterior
          </button>
          <span>
            Página {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => fetchQueue(page + 1)}
            disabled={page + 1 >= totalPages || loading}
            aria-label="Página siguiente"
            className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 hover:bg-white/10 disabled:opacity-40"
          >
            Siguiente <ChevronRight size={14} />
          </button>
        </div>
      )}

      {pendingDecision && (
        <ReasonPromptModal
          title={
            pendingDecision.decision === 'APPROVED'
              ? `Aprobar verificación de ${pendingDecision.profile.fullName || 'este usuario'}`
              : `Rechazar verificación de ${pendingDecision.profile.fullName || 'este usuario'}`
          }
          confirmLabel={pendingDecision.decision === 'APPROVED' ? 'Aprobar' : 'Rechazar'}
          requireReason={pendingDecision.decision === 'REJECTED'}
          danger={pendingDecision.decision === 'REJECTED'}
          onConfirm={applyDecision}
          onClose={() => setPendingDecision(null)}
        />
      )}
    </div>
  );
}
