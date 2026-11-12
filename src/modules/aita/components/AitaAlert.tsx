import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

type Props = {
  message: string;
  onDismiss?: () => void;
};

export default function AitaAlert({ message, onDismiss }: Props) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="flex items-start gap-3 rounded-xl border border-orange-200 bg-gradient-to-r from-rose-50 to-orange-50 px-3.5 py-3 text-sm text-rose-900 shadow-sm"
    >
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-orange-500" />
      <p className="flex-1 leading-relaxed">{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Cerrar aviso" className="font-bold leading-none text-rose-700">
          ×
        </button>
      )}
    </motion.div>
  );
}
