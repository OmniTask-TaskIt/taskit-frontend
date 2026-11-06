import { AlertCircle, RotateCw, X } from 'lucide-react';

type TaskErrorStateProps = { message: string; onRetry?: () => void; onClose?: () => void; retryDisabled?: boolean };

export default function TaskErrorState({ message, onRetry, onClose, retryDisabled = false }: TaskErrorStateProps) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#f1ccd2] bg-[#fff3f4] px-4 py-3 text-sm text-[#a73e51]" role="alert">
      <AlertCircle size={17} aria-hidden="true" />
      <span className="flex-1">{message}</span>
      {onRetry && <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[#dbaab3] px-3 py-1.5 font-semibold hover:bg-white" onClick={onRetry} disabled={retryDisabled} aria-disabled={retryDisabled}><RotateCw size={14} aria-hidden="true" />Reintentar</button>}
      {onClose && <button type="button" className="ml-auto" onClick={onClose} aria-label="Cerrar error"><X size={16} /></button>}
    </div>
  );
}
