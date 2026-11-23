const STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/15 text-adm-ok border-emerald-500/30',
  VERIFIED: 'bg-emerald-500/15 text-adm-ok border-emerald-500/30',
  RESOLVED: 'bg-emerald-500/15 text-adm-ok border-emerald-500/30',
  APPROVED: 'bg-emerald-500/15 text-adm-ok border-emerald-500/30',

  PENDING_VERIFICATION: 'bg-amber-500/15 text-adm-warn border-amber-500/30',
  PENDING_REVIEW: 'bg-amber-500/15 text-adm-warn border-amber-500/30',
  OPEN: 'bg-amber-500/15 text-adm-warn border-amber-500/30',

  SUSPENDED: 'bg-orange-500/15 text-adm-orange border-orange-500/30',
  BLOCKED: 'bg-rose-500/15 text-adm-danger border-rose-500/30',
  REJECTED: 'bg-rose-500/15 text-adm-danger border-rose-500/30',
  DISMISSED: 'bg-adm-soft text-adm-muted border-adm-line-strong',
  UNVERIFIED: 'bg-adm-soft text-adm-muted border-adm-line-strong',
};

const LABELS: Record<string, string> = {
  ACTIVE: 'Activa',
  PENDING_VERIFICATION: 'Pend. verificación',
  SUSPENDED: 'Suspendida',
  BLOCKED: 'Bloqueada',
  VERIFIED: 'Verificado',
  PENDING_REVIEW: 'En revisión',
  UNVERIFIED: 'Sin verificar',
  REJECTED: 'Rechazado',
  OPEN: 'Abierto',
  RESOLVED: 'Resuelto',
  DISMISSED: 'Descartado',
  APPROVED: 'Aprobado',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
        STYLES[status] || 'bg-adm-soft text-adm-muted border-adm-line-strong'
      }`}
    >
      {LABELS[status] || status}
    </span>
  );
}
