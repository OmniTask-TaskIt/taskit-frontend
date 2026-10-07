import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import { twoFactorService } from '../../services/twoFactorService';
import { getApiErrorMessage } from '../../services/apiError';

type Step = 'idle' | 'enter-code';

/**
 * RF-AUTH-9: activar o desactivar la verificación en dos pasos por correo. Ambos cambios se confirman con un código
 * enviado al correo de la cuenta (así una sesión robada no puede quitar la protección).
 */
export default function TwoFactorSection() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const current = await twoFactorService.status();
        if (!cancelled) setEnabled(current);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, 'No se pudo consultar el estado de la verificación en dos pasos.'));
      }
    }

    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  const requestCode = async () => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { message } = enabled ? await twoFactorService.requestDisable() : await twoFactorService.requestEnable();
      setNotice(message);
      setCode('');
      setStep('enter-code');
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo enviar el código. Inténtalo de nuevo.'));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(code)) {
      setError('Ingresa los 6 dígitos del código.');
      return;
    }

    setBusy(true);
    try {
      const { message } = enabled ? await twoFactorService.confirmDisable(code) : await twoFactorService.confirmEnable(code);
      setEnabled(!enabled);
      setStep('idle');
      setCode('');
      setNotice(message);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo verificar el código. Inténtalo de nuevo.'));
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    setStep('idle');
    setCode('');
    setError('');
    setNotice('');
  };

  return (
    <motion.section
      aria-labelledby="verificacion-dos-pasos"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto my-4 flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-[#cfd7ef] bg-white/95 p-6 shadow-[0_18px_45px_rgba(47,61,110,0.1)]"
    >
      <header className="flex flex-col gap-1">
        <h2 id="verificacion-dos-pasos" className="flex items-center gap-2 text-lg font-bold text-[#263BAA]">
          {enabled ? <ShieldCheck size={20} /> : <ShieldOff size={20} />} Verificación en dos pasos
        </h2>
        <p className="text-sm text-[#66718e]">
          Al iniciar sesión te pediremos, además de tu contraseña, un código que enviamos a tu correo. Aplica también al
          acceso con Google y GitHub.
        </p>
      </header>

      <div aria-live="polite" className="flex flex-col gap-2">
        {notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>}
        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
      </div>

      {enabled === null ? (
        !error && (
          <p role="status" className="flex items-center gap-2 text-sm text-[#66718e]">
            <Loader2 size={16} className="animate-spin" /> Consultando estado…
          </p>
        )
      ) : step === 'idle' ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#17213f]">
            Estado:{' '}
            <span className={enabled ? 'text-emerald-700' : 'text-[#66718e]'}>{enabled ? 'Activada' : 'Desactivada'}</span>
          </p>
          <button
            type="button"
            onClick={() => void requestCode()}
            disabled={busy}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              enabled
                ? 'border border-rose-300 bg-white text-rose-600 hover:bg-rose-600 hover:text-white'
                : 'bg-[#263BAA] text-white hover:bg-[#1e2e85]'
            }`}
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {enabled ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ) : (
        <form onSubmit={confirm} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-[#17213f]">
            Código de verificación
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-40 rounded-lg border border-[#cfd7ef] px-3 py-2 text-center text-lg font-bold tracking-[0.3em] outline-none focus:border-[#263BAA]"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-2 rounded-lg bg-[#263BAA] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1e2e85] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {enabled ? 'Confirmar y desactivar' : 'Confirmar y activar'}
          </button>
          <button type="button" onClick={cancel} disabled={busy} className="px-2 py-2 text-sm font-medium text-[#66718e] underline">
            Cancelar
          </button>
        </form>
      )}
    </motion.section>
  );
}
