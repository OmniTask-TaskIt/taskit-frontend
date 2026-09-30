import { useEffect, useState, type FormEvent } from 'react';
import { Ban, Search, ShieldCheck } from 'lucide-react';
import { adminService, type AccountStatus, type AdminUser } from '../services/adminService';
import StatusBadge from './StatusBadge';
import ReasonPromptModal from './ReasonPromptModal';

const STATUS_FILTERS: { value: AccountStatus | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'ACTIVE', label: 'Activas' },
  { value: 'PENDING_VERIFICATION', label: 'Pend. verificación' },
  { value: 'SUSPENDED', label: 'Suspendidas' },
  { value: 'BLOCKED', label: 'Bloqueadas' },
];

const PAGE_SIZE = 10;

export default function UsersTab() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AccountStatus | ''>('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState<{ user: AdminUser; nextStatus: AccountStatus } | null>(null);

  const fetchUsers = async (targetPage = 0) => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.listUsers({
        status: status || undefined,
        q: query.trim() || undefined,
        page: targetPage,
        size: PAGE_SIZE,
      });
      setUsers(data.content);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch {
      setError('No se pudo cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await fetchUsers(0);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchUsers(0);
  };

  const applyStatusChange = async (reason: string) => {
    if (!pendingAction) return;
    const updated = await adminService.updateUserStatus(pendingAction.user.id, pendingAction.nextStatus, reason);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setPendingAction(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por correo..."
            className="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#263BAA]"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AccountStatus | '')}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#263BAA]"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value} className="bg-[#171A34]">
              {f.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-[#263BAA] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1a297a] transition-colors"
        >
          Buscar
        </button>
      </form>

      {error && <p className="text-sm text-rose-400">{error}</p>}
      {loading ? (
        <p className="text-sm text-white/40">Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-white/40">No se encontraron usuarios con ese criterio.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-semibold text-white">{user.name || user.email}</span>
                  <StatusBadge status={user.accountStatus} />
                  <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">
                    {user.role}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-white/50">
                  {user.email} · {user.authProvider}
                </p>
                {user.blockReason && (
                  <p className="mt-1 text-[11px] text-rose-400/90">Motivo: {user.blockReason}</p>
                )}
              </div>

              <div className="flex flex-shrink-0 gap-2">
                {user.accountStatus === 'ACTIVE' ? (
                  <>
                    <button
                      onClick={() => setPendingAction({ user, nextStatus: 'SUSPENDED' })}
                      className="flex items-center gap-1 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-400 hover:bg-orange-500/20 transition-colors"
                    >
                      <Ban size={13} /> Suspender
                    </button>
                    <button
                      onClick={() => setPendingAction({ user, nextStatus: 'BLOCKED' })}
                      className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                      <Ban size={13} /> Bloquear
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setPendingAction({ user, nextStatus: 'ACTIVE' })}
                    className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <ShieldCheck size={13} /> Reactivar
                  </button>
                )}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="mt-2 flex items-center justify-center gap-3 text-xs text-white/50">
              <button
                disabled={page === 0}
                onClick={() => fetchUsers(page - 1)}
                className="rounded-lg border border-white/15 px-3 py-1.5 disabled:opacity-30"
              >
                Anterior
              </button>
              <span>
                Página {page + 1} de {totalPages}
              </span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => fetchUsers(page + 1)}
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
          title={
            pendingAction.nextStatus === 'ACTIVE'
              ? `Reactivar a ${pendingAction.user.name || pendingAction.user.email}`
              : pendingAction.nextStatus === 'SUSPENDED'
                ? `Suspender a ${pendingAction.user.name || pendingAction.user.email}`
                : `Bloquear a ${pendingAction.user.name || pendingAction.user.email}`
          }
          description={
            pendingAction.nextStatus === 'BLOCKED'
              ? 'El bloqueo es una medida severa; el usuario no podrá iniciar sesión.'
              : undefined
          }
          confirmLabel={pendingAction.nextStatus === 'ACTIVE' ? 'Reactivar' : 'Confirmar'}
          requireReason={pendingAction.nextStatus !== 'ACTIVE'}
          danger={pendingAction.nextStatus !== 'ACTIVE'}
          onConfirm={applyStatusChange}
          onClose={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}
