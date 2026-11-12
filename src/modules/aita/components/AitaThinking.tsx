import { Sparkles } from 'lucide-react';

export default function AitaThinking({ label = 'La IA está pensando...' }: { label?: string }) {
  return (
    <div aria-live="polite" className="rounded-xl border border-violet-100 bg-violet-50/80 p-3">
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-violet-800">
        <Sparkles size={14} className="animate-pulse" />
        {label}
      </p>
      <div className="space-y-2">
        <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-violet-200/80" />
        <div className="h-2.5 w-3/5 animate-pulse rounded-full bg-sky-200/80" />
      </div>
    </div>
  );
}
