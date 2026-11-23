const STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/15 text-[#177245] border-emerald-500/30',
  VERIFIED: 'bg-emerald-500/15 text-[#177245] border-emerald-500/30',
  RESOLVED: 'bg-emerald-500/15 text-[#177245] border-emerald-500/30',
  APPROVED: 'bg-emerald-500/15 text-[#177245] border-emerald-500/30',

  PENDING_VERIFICATION: 'bg-amber-500/15 text-[#9a5b00] border-amber-500/30',
  PENDING_REVIEW: 'bg-amber-500/15 text-[#9a5b00] border-amber-500/30',
  OPEN: 'bg-amber-500/15 text-[#9a5b00] border-amber-500/30',

  SUSPENDED: 'bg-orange-500/15 text-[#9a3412] border-orange-500/30',
  BLOCKED: 'bg-rose-500/15 text-[#a73e51] border-rose-500/30',
  REJECTED: 'bg-rose-500/15 text-[#a73e51] border-rose-500/30',
  DISMISSED: 'bg-[#eef1ff] text-[#5b6685] border-[#d7d3e3]',
  UNVERIFIED: 'bg-[#eef1ff] text-[#5b6685] border-[#d7d3e3]',
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
        STYLES[status] || 'bg-[#eef1ff] text-[#5b6685] border-[#d7d3e3]'
      }`}
    >
      {LABELS[status] || status}
    </span>
  );
}
