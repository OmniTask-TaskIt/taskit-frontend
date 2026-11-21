import type { PaymentMovement } from '../../types/payment';
import { MOCK_INVOICE } from './mockInvoiceData';

export default function MockInvoicePreview({ onOpen }: { onOpen: (invoice: PaymentMovement) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(MOCK_INVOICE)}
      className="mt-4 w-full rounded-2xl border border-dashed border-[#c9d2ea] bg-white/80 p-4 text-left transition hover:border-[#263BAA]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-[#f3f5fb] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#5b6685]">
          EJEMPLO • VISTA PREVIA
        </span>
        <span className="text-sm font-semibold tabular-nums text-[#17213f]">$120.000 COP</span>
      </div>
      <p className="mt-3 text-sm font-semibold text-[#17213f]">Diseño de identidad visual — Tarea #demo-01</p>
      <p className="mt-1 text-xs text-[#657399]">Así se verá un comprobante real cuando completes y pagues una tarea. No representa dinero.</p>
    </button>
  );
}