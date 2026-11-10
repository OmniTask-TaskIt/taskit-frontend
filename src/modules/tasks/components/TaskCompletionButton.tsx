import { Check, LoaderCircle, RotateCw } from 'lucide-react';
import { useTaskCompletionStatus } from '../hooks/useTaskCompletionStatus';

export default function TaskCompletionButton({ taskId, currentUserId, compact = false }: { taskId: string; currentUserId: string; compact?: boolean }) {
  const { status, loading, completing, error, retry, complete } = useTaskCompletionStatus(taskId, currentUserId);
  const isOwner = status?.ownerId === currentUserId;
  const approvedByCurrentUser = Boolean(status && (isOwner ? status.ownerApproved : status.assigneeId === currentUserId ? status.assigneeApproved : false));
  const approvedByOther = Boolean(status && (isOwner ? status.assigneeApproved : status.ownerApproved));
  const completed = status?.ownerApproved === true && status.assigneeApproved === true;
  const label = loading ? 'Cargando estado...' : completing ? 'Guardando...' : completed ? 'Tarea completada' : approvedByCurrentUser ? 'Ya aprobaste esta tarea' : approvedByOther ? 'Confirmar finalización' : 'Finalizar tarea';
  const tone = completed || approvedByCurrentUser ? 'bg-[#edf0f5] text-[#59647d]' : approvedByOther ? 'bg-[#f6c744] text-[#5b4300]' : 'bg-[#177245] text-white';

  return <div className={compact ? 'space-y-1' : 'space-y-2'}>
    {approvedByOther && !approvedByCurrentUser && !completed && <p className="rounded-lg bg-[#fff6d8] px-2.5 py-2 text-xs font-medium text-[#805f00]" role="status">La otra persona ya aprobó la finalización. Falta tu confirmación.</p>}
    {error && <div className="flex items-center gap-2 text-xs text-[#b64055]" role="alert"><span>{error}</span><button type="button" onClick={() => void retry()} className="font-semibold underline">Reintentar</button></div>}
    <button type="button" onClick={() => void complete()} disabled={loading || completing || approvedByCurrentUser || completed || !status} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-80 ${tone}`} aria-busy={loading || completing}><>{loading || completing ? <LoaderCircle size={14} className="animate-spin" /> : completed || approvedByCurrentUser ? <Check size={14} /> : <RotateCw size={14} />}</>{label}</button>
  </div>;
}
