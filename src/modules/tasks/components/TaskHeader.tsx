import { ClipboardList, Loader2, Plus, RefreshCw } from 'lucide-react';

type TaskHeaderProps = {
  onCreate: () => void;
  onRefresh: () => void;
  loading: boolean;
};

export default function TaskHeader({ onCreate, onRefresh, loading }: TaskHeaderProps) {
  return <header className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
    <div><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#657399]"><ClipboardList size={15} className="text-[#263BAA]" /> Espacio de trabajo</div><h1 className="text-3xl font-extrabold tracking-tight text-[#0B132B] sm:text-4xl">Gestión de tareas</h1><p className="mt-2 max-w-xl text-sm text-[#5b6685] sm:text-base">Publica, encuentra y administra tus tareas en un solo lugar.</p></div>
    <div className="flex flex-col gap-2 sm:flex-row">
      <button type="button" onClick={onRefresh} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#dfe4f2] bg-white px-4 text-sm font-bold text-[#263BAA] transition hover:bg-[#f4f6ff] disabled:cursor-not-allowed disabled:opacity-60" aria-busy={loading}>
        {loading ? <Loader2 size={17} className="animate-spin" /> : <RefreshCw size={17} />} {loading ? 'Actualizando…' : 'Actualizar tareas'}
      </button>
      <button type="button" onClick={onCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#263BAA] px-5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(38,59,170,0.25)]"><Plus size={18} /> Publicar tarea</button>
    </div>
  </header>;
}
