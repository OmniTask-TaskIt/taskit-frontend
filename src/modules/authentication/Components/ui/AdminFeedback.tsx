import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

/** Esqueleto de carga para las listas del panel. El texto accesible mantiene el aviso de "Cargando…" para lectores de pantalla. */
export function AdminListSkeleton({ label, rows = 4 }: { label: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-2">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="flex items-center justify-between gap-4 rounded-xl border border-adm-line bg-adm-surface p-4"
        >
          <div className="flex-1 space-y-2.5">
            <div className="adm-skeleton h-3.5 w-2/5 rounded-md" />
            <div className="adm-skeleton h-3 w-3/5 rounded-md" />
          </div>
          <div className="adm-skeleton h-8 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** Estado vacío con icono: invita a cambiar el filtro en vez de dejar la pantalla en blanco. */
export function AdminEmptyState({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-adm-line-strong px-4 py-10 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#263BAA]/10 text-adm-accent">{icon}</span>
      <p className="text-sm text-adm-muted">{children}</p>
    </motion.div>
  );
}

/** Entrada escalonada de cada fila de una lista (limitada para que listas largas no tarden en aparecer). */
export function AdminRow({ index, className, children }: { index: number; className?: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index, 8) * 0.04, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
