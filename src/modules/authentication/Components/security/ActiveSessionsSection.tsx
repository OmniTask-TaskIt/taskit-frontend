import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Laptop, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { sessionService } from '../../services/sessionService';
import { getApiErrorMessage } from '../../services/apiError';
import type { ActiveSession } from '../../types/session.types';

const dateFormat = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : dateFormat.format(date);
}

/**
 * Seguridad de la cuenta: sesiones activas por dispositivo (RF-AUTH-10). Permite cerrar de forma remota cualquier
 * sesión menos la actual (para esa está "Cerrar sesión" del menú). Si ves un dispositivo que no reconoces, ciérralo
 * y cambia la contraseña.
 */
export default function ActiveSessionsSection() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Cambiar reloadKey vuelve a consultar (botón "Reintentar").
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchSessions() {
      try {
        const data = await sessionService.list();
        if (cancelled) return;
        setSessions(data);
        setError('');
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, 'No se pudieron cargar tus sesiones activas.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchSessions();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setLoading(true);
    setError('');
    setReloadKey((key) => key + 1);
  };

  const revoke = async (session: ActiveSession) => {
    if (revokingId) return;
    setRevokingId(session.id);
    setNotice('');
    setError('');
    try {
      await sessionService.revoke(session.id);
      setSessions((prev) => prev.filter((item) => item.id !== session.id));
      setNotice(`Cerraste la sesión de ${session.deviceInfo}.`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cerrar la sesión. Inténtalo de nuevo.'));
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <motion.section
      aria-labelledby="sesiones-activas"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto my-4 flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-[#cfd7ef] bg-white/95 p-6 shadow-[0_18px_45px_rgba(47,61,110,0.1)]"
    >
      <header className="flex flex-col gap-1">
        <h2 id="sesiones-activas" className="flex items-center gap-2 text-lg font-bold text-[#263BAA]">
          <ShieldCheck size={20} /> Sesiones activas
        </h2>
        <p className="text-sm text-[#66718e]">
          Estos son los dispositivos con la sesión iniciada en tu cuenta. Si ves uno que no reconoces, ciérralo y cambia tu
          contraseña.
        </p>
      </header>

      <div aria-live="polite" className="flex flex-col gap-2">
        {notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>}
        {error && (
          <p role="alert" className="flex flex-wrap items-center gap-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
            <button type="button" onClick={retry} className="font-semibold underline">
              Reintentar
            </button>
          </p>
        )}
      </div>

      {loading ? (
        <p role="status" className="flex items-center gap-2 text-sm text-[#66718e]">
          <Loader2 size={16} className="animate-spin" /> Cargando sesiones…
        </p>
      ) : sessions.length === 0 ? (
        !error && <p className="text-sm text-[#66718e]">No hay sesiones activas para mostrar.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex flex-col gap-3 rounded-xl border border-[#e8ebf5] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <Laptop size={22} className="mt-0.5 flex-shrink-0 text-[#263BAA]" aria-hidden="true" />
                <div className="flex flex-col gap-0.5 text-sm text-[#17213f]">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {session.deviceInfo}
                    {session.current && (
                      <span className="rounded-full bg-[#eef2ff] px-2 py-0.5 text-xs font-semibold text-[#263BAA]">
                        Este dispositivo
                      </span>
                    )}
                  </p>
                  <p className="text-[#66718e]">IP {session.ipAddress}</p>
                  <p className="text-[#66718e]">Último uso: {formatDate(session.lastActiveAt)}</p>
                  <p className="text-[#66718e]">Inició: {formatDate(session.createdAt)}</p>
                </div>
              </div>

              {!session.current && (
                <button
                  type="button"
                  onClick={() => void revoke(session)}
                  disabled={revokingId !== null}
                  aria-label={`Cerrar sesión de ${session.deviceInfo}`}
                  className="flex items-center justify-center gap-2 self-start rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:self-center"
                >
                  {revokingId === session.id ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                  Cerrar sesión
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}
