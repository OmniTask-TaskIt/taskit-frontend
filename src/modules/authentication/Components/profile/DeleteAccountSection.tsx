import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { profileService } from '../../services/profileService';
import { authStore } from '../../services/authStore';
import { redirectToLogin } from '../../../../utils/navigation';

/**
 * "Zona de peligro" de Mi perfil: eliminar la cuenta propia.
 *
 * El backend (DELETE /profiles/{email}) la borra de forma PERMANENTE: usuario, perfil,
 * documento de identidad guardado y token de sesión. Solo puede hacerlo el dueño del
 * correo (o un admin). Por ser irreversible, hay que escribir el correo para confirmar.
 */
export default function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Mismo correo que el backend compara contra el token (authentication.name).
  const email = authStore.getEmail() ?? '';
  const matches = email !== '' && typed.trim().toLowerCase() === email.toLowerCase();

  const close = () => {
    if (deleting) return;
    setOpen(false);
    setTyped('');
    setError('');
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleting) {
        setOpen(false);
        setTyped('');
        setError('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, deleting]);

  const confirmDelete = async () => {
    if (!matches || deleting) return;
    setDeleting(true);
    setError('');
    try {
      await profileService.deleteAccount(email);
      // La cuenta ya no existe: se descarta toda la sesión local y se vuelve al inicio.
      authStore.clearSession();
      localStorage.clear();
      redirectToLogin();
    } catch {
      setError('No se pudo eliminar la cuenta. Inténtalo de nuevo en unos minutos.');
      setDeleting(false);
    }
  };

  return (
    <section aria-labelledby="zona-peligro" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50/60 p-5">
      <h2 id="zona-peligro" className="flex items-center gap-2 text-sm font-semibold text-rose-700">
        <AlertTriangle size={16} /> Zona de peligro
      </h2>
      <p className="text-sm text-[#66718e]">
        Eliminar tu cuenta borra de forma permanente tu perfil, tu documento de identidad y tu acceso a TaskIt. No se puede
        deshacer.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 self-start rounded-lg border border-rose-300 bg-white px-5 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-600 hover:text-white sm:w-auto"
      >
        <Trash2 size={15} /> Eliminar mi cuenta
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="eliminar-titulo"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-[440px] rounded-2xl border border-white/15 bg-[#171A34] p-6 text-white shadow-2xl"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 id="eliminar-titulo" className="pr-6 text-base font-semibold">
              ¿Eliminar tu cuenta definitivamente?
            </h3>
            <p className="mt-2 text-sm text-white/60">
              Se borrarán tu perfil y tu documento de identidad, y se cerrará tu sesión. Esta acción es permanente.
            </p>

            <label className="mt-4 flex flex-col gap-1.5 text-sm text-white/70">
              Para confirmar, escribe tu correo: <span className="font-semibold text-white">{email}</span>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-rose-500"
              />
            </label>

            {error && (
              <p role="alert" className="mt-2 text-sm text-rose-400">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={close}
                disabled={deleting}
                className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:text-white disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={!matches || deleting}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Eliminar para siempre'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
