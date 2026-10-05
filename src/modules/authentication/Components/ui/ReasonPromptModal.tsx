import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ReasonPromptModalProps {
  title: string;
  description?: string;
  confirmLabel: string;
  requireReason?: boolean;
  danger?: boolean;
  onConfirm: (reason: string) => Promise<void> | void;
  onClose: () => void;
}

/** Modal chico reutilizado por Usuarios, Verificaciones y Reportes para pedir un motivo antes de una acción. */
export default function ReasonPromptModal({
  title,
  description,
  confirmLabel,
  requireReason = true,
  danger = false,
  onConfirm,
  onClose,
}: ReasonPromptModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError('Este campo es obligatorio.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
    } catch {
      setError('No se pudo completar la acción. Inténtalo de nuevo.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-[420px] rounded-2xl border border-[rgba(255,255,255,0.15)] bg-[#171A34] p-6 shadow-2xl text-white relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="pr-6 text-base font-semibold">{title}</h3>
        {description && <p className="mt-1 text-xs text-white/50">{description}</p>}

        <label className="mt-4 flex flex-col gap-1.5 text-sm text-white/70">
          Motivo {requireReason ? '' : '(opcional)'}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            className="rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-[#263BAA]"
          />
        </label>

        {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60 ${
              danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#263BAA] hover:bg-[#1a297a]'
            }`}
          >
            {submitting ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
