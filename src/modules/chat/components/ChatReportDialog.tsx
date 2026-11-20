import { useRef, useState } from 'react';
import { AlertTriangle, Paperclip, X } from 'lucide-react';
import { reportService } from '../services/reportService';

type ChatReportDialogProps = {
  taskId: string;
  users: string[];
  onClose: () => void;
  onCreated: () => void;
};

export default function ChatReportDialog({ taskId, users, onClose, onCreated }: ChatReportDialogProps) {
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reason.trim()) {
      setError('Describe la razón del reporte para continuar.');
      return;
    }
    if (users.length < 2) {
      setError('No fue posible identificar a los dos participantes de este chat.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      for (const file of files) await reportService.uploadEvidence(file, taskId);
      await reportService.createReport(taskId, reason.trim(), users);
      onCreated();
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('VITE_REPORT_API_URL')) {
        setError(error.message);
      } else {
        setError('No se pudo crear el reporte. Revisa tu conexión e inténtalo de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111a37]/55 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="chat-report-title" className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 text-[#17213f] shadow-[0_24px_80px_rgba(23,33,63,0.28)] sm:p-7">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#fff0f2] text-[#c9364f]"><AlertTriangle size={19} /></span>
            <div><h2 id="chat-report-title" className="text-lg font-bold">Reportar conversación</h2><p className="mt-1 text-sm text-[#7883a3]">Cuéntanos qué ocurrió. El equipo revisará el reporte.</p></div>
          </div>
          <button type="button" aria-label="Cerrar" onClick={onClose} disabled={submitting} className="rounded-lg p-2 text-[#7883a3] hover:bg-[#f4f6fc] hover:text-[#17213f] disabled:opacity-50"><X size={18} /></button>
        </header>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label htmlFor="report-reason" className="flex flex-col gap-2 text-sm font-semibold">Razón del reporte
            <textarea id="report-reason" value={reason} onChange={(event) => setReason(event.target.value)} rows={5} maxLength={2000} required placeholder="Describe brevemente el problema..." className="resize-y rounded-xl border border-[#d9deef] bg-white px-3 py-3 font-normal outline-none placeholder:text-[#a0a8bd] focus:border-[#263BAA] focus:ring-2 focus:ring-[#263BAA]/15" />
          </label>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Evidencias <span className="font-normal text-[#7883a3]">(opcional)</span></span>
            <input ref={fileInput} type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} className="sr-only" aria-label="Adjuntar archivos de evidencia" />
            <button type="button" onClick={() => fileInput.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#cbd2e6] bg-[#f8f9fd] px-4 py-3 text-sm font-medium text-[#5b6685] hover:border-[#263BAA] hover:text-[#263BAA]"><Paperclip size={16} /> Adjuntar archivos</button>
            {files.length > 0 && <ul className="flex flex-col gap-1 text-xs text-[#5b6685]">{files.map((file, index) => <li key={`${file.name}-${file.lastModified}-${index}`} className="truncate">{file.name} <span className="text-[#9aa3b9]">({Math.max(1, Math.ceil(file.size / 1024))} KB)</span></li>)}</ul>}
          </div>
          {error && <p role="alert" className="rounded-xl bg-[#fff0f2] px-3 py-2 text-sm text-[#b64055]">{error}</p>}
          <footer className="mt-1 flex justify-end gap-3 border-t border-[#e8ebf5] pt-4">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-xl border border-[#d9deef] px-4 py-2.5 text-sm font-semibold text-[#5b6685] hover:bg-[#f4f6fc] disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={submitting || !reason.trim()} className="rounded-xl bg-[#c9364f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ae2940] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? 'Creando reporte...' : 'Crear reporte'}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
