import { AlertCircle, RotateCw, X } from 'lucide-react';

type TaskErrorStateProps = { message: string; onRetry?: () => void; onClose?: () => void; retryDisabled?: boolean };

export default function TaskErrorState({ message, onRetry, onClose, retryDisabled = false }: TaskErrorStateProps) {
  return (
    <div className="relative mb-4 flex flex-col items-start gap-2 rounded-xl border border-[#f1ccd2] bg-[#fff3f4] px-4 py-3 text-sm text-[#a73e51] sm:flex-row sm:items-center sm:gap-3" role="alert">
      <div className={`flex items-start gap-2 sm:flex-1 sm:items-center ${onClose ? 'pr-6 sm:pr-0' : ''}`}>
        <AlertCircle size={17} className="mt-0.5 shrink-0 sm:mt-0" aria-hidden="true" />
        <span>{message}</span>
      </div>
      {onRetry && <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[#dbaab3] px-3 py-1.5 font-semibold hover:bg-white" onClick={onRetry} disabled={retryDisabled} aria-disabled={retryDisabled}><RotateCw size={14} aria-hidden="true" />Reintentar</button>}
      {onClose && <button type="button" className="absolute right-3 top-3 sm:static sm:ml-auto" onClick={onClose} aria-label="Cerrar error"><X size={16} /></button>}
    </div>
  );
}
