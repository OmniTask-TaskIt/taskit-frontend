import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Flag, X } from 'lucide-react';
import { profileService } from '../services/profileService';

const REASONS = [
  'Comportamiento inapropiado',
  'Sospecha de fraude o estafa',
  'Perfil falso o suplantación de identidad',
  'Incumplimiento de una tarea acordada',
  'Contenido ofensivo o discriminatorio',
  'Otro',
];

interface ReportProfileModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

export default function ReportProfileModal({ userId, userName, onClose }: ReportProfileModalProps) {
  const [reason, setReason] = useState(REASONS[0]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await profileService.reportProfile(userId, reason, comment.trim());
      setDone(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data as { message?: string } | undefined;
        if (status === 409) {
          setError('Ya tienes un reporte abierto contra este usuario. Nuestro equipo ya lo está revisando.');
        } else {
          setError(data?.message || 'No se pudo enviar el reporte. Inténtalo de nuevo.');
        }
      } else {
        setError('Ocurrió un error inesperado al enviar el reporte.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-[440px] rounded-2xl border border-[rgba(255,255,255,0.15)] bg-[#171A34] p-6 shadow-2xl text-white relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <Flag size={22} />
            </div>
            <h3 className="text-base font-semibold">Reporte enviado</h3>
            <p className="text-sm text-white/60">
              Gracias por avisarnos. Nuestro equipo de moderación va a revisar el perfil de {userName}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-xl bg-[#263BAA] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1a297a] transition-colors"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-2 pr-6">
              <Flag size={18} className="text-rose-400" />
              <h3 className="text-base font-semibold">Reportar a {userName}</h3>
            </div>
            <p className="text-xs text-white/50">
              Cuéntanos qué pasó. Los reportes se revisan de forma confidencial por nuestro equipo de seguridad.
            </p>

            <label className="flex flex-col gap-1.5 text-sm text-white/70">
              Motivo
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white outline-none focus:border-[#263BAA]"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r} className="bg-[#171A34]">
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm text-white/70">
              Detalles (opcional)
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Describe brevemente lo que ocurrió..."
                className="rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#263BAA]"
              />
            </label>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <div className="flex justify-end gap-3 mt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 transition-colors disabled:opacity-60"
              >
                {submitting ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
