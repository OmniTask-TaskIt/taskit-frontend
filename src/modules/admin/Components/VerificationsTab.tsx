import { useState, type FormEvent } from 'react';
import { ExternalLink, Search, ShieldCheck, ShieldX } from 'lucide-react';
import { profileService, type Profile } from '../../dashboard/services/profileService';
import { adminService, type VerificationDecision } from '../services/adminService';
import StatusBadge from './StatusBadge';
import ReasonPromptModal from './ReasonPromptModal';

/**
 * El backend todavía no expone una "cola" de verificaciones pendientes
 * (solo aprobar/rechazar un userId puntual), así que por ahora se busca al
 * profesional por nombre, igual que en el directorio, y desde ahí se
 * revisa su estado. Ver README: sería un buen endpoint a agregar después
 * (GET /admin/verification-documents?status=PENDING_REVIEW).
 */
export default function VerificationsTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [docError, setDocError] = useState('');
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);
  const [pendingDecision, setPendingDecision] = useState<{ profile: Profile; decision: VerificationDecision } | null>(
    null
  );

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await profileService.searchProfiles(query.trim());
      setResults(data || []);
    } catch {
      setError('No se pudo completar la búsqueda.');
    } finally {
      setLoading(false);
    }
  };

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
    setResults((prev) => prev.map((p) => (p.userId === updated.userId ? { ...p, ...updated } : p)));
    setPendingDecision(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar profesional por nombre..."
            className="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#263BAA]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#263BAA] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1a297a] transition-colors disabled:opacity-60"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <p className="text-sm text-rose-400">{error}</p>}
      {docError && <p className="text-sm text-rose-400">{docError}</p>}

      {results.length === 0 && !loading ? (
        <p className="text-sm text-white/40">Busca un profesional para revisar su verificación de identidad.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {results.map((profile) => (
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

              <div className="flex flex-shrink-0 gap-2">
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
