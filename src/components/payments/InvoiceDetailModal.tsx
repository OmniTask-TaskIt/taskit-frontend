import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { PaymentMovement } from '../../types/payment';
import { formatPaymentAmount, formatPaymentDate, shortTransactionId } from './paymentFormat';

const STAMP: Record<PaymentMovement['status'], string> = {
  PENDING: 'EN VALIDACIÓN',
  RETAINED: 'RETENIDO EN ESCROW',
  RELEASED: 'PAGADO / LIBERADO',
  REFUNDED: 'REEMBOLSADO',
  REJECTED: 'NO PROCESADO',
};

function stepState(invoice: PaymentMovement, step: 1 | 2 | 3) {
  if (invoice.status === 'REJECTED') return step === 1 ? 'off' : 'idle';
  if (step === 1) return 'done';
  if (step === 2) return invoice.status === 'PENDING' ? 'idle' : 'done';
  if (invoice.status === 'RELEASED' || invoice.status === 'REFUNDED') return 'done';
  return 'idle';
}

export default function InvoiceDetailModal({ invoice, onClose }: { invoice: PaymentMovement | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const payer = invoice?.role === 'PAYER';

  const copyId = async () => {
    if (!invoice) return;
    try {
      await navigator.clipboard.writeText(invoice.transactionId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AnimatePresence>
      {invoice && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[#0B132B]/40 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.article
            role="dialog"
            aria-modal="true"
            aria-label={payer ? 'Comprobante de pago' : 'Comprobante de ingreso'}
            layoutId={invoice.preview ? undefined : invoice.transactionId}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            className="payment-receipt max-h-[min(88dvh,720px)] w-full max-w-md overflow-y-auto rounded-3xl border border-[#e6eaf4] bg-white p-6 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide ${payer ? 'text-[#263BAA]' : 'text-emerald-700'}`}>
                  {payer ? 'Comprobante de pago' : 'Comprobante de ingreso'}
                </p>
                <p className={`mt-2 text-3xl font-semibold tabular-nums ${payer ? 'text-[#17213f]' : 'text-emerald-800'}`}>
                  {payer ? '−' : '+'}{formatPaymentAmount(invoice.amount, invoice.currency)}
                </p>
              </div>
              <button type="button" onClick={onClose} className="no-print text-sm font-semibold text-[#5b6685]">Cerrar</button>
            </div>

            {invoice.preview && (
              <p className="mt-3 rounded-full border border-dashed border-[#c9d2ea] px-3 py-1 text-center text-[11px] font-semibold tracking-wide text-[#5b6685]">
                EJEMPLO • VISTA PREVIA
              </p>
            )}

            <p className="mt-4 text-sm text-[#2f3b63]">{invoice.title || `Tarea ${shortTransactionId(invoice.taskId)}`}</p>
            <p className="mt-1 text-xs text-[#5b6685]">{formatPaymentDate(invoice.occurredAt)}</p>

            <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl bg-[#f6f7fc] px-3 py-2">
              <span className="font-mono text-xs text-[#2f3b63]">{shortTransactionId(invoice.transactionId)}</span>
              <button type="button" onClick={() => { void copyId(); }} className="no-print text-xs font-semibold text-[#263BAA]">
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            <p className="mt-4 text-center text-xs font-semibold tracking-[0.14em] text-[#5b6685]">{STAMP[invoice.status]}</p>

            <ol className="mt-4 space-y-2 text-sm">
              {[
                ['Pago iniciado', stepState(invoice, 1)],
                ['Protegido en Escrow', stepState(invoice, 2)],
                [invoice.status === 'REFUNDED' ? 'Reembolsado' : 'Liberado', stepState(invoice, 3)],
              ].map(([label, state]) => (
                <li key={label} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${state === 'done' ? 'bg-[#263BAA]' : state === 'off' ? 'bg-rose-300' : 'bg-[#d5dbeb]'}`} />
                  <span className={state === 'idle' ? 'text-[#5b6685]' : 'text-[#17213f]'}>{label}</span>
                </li>
              ))}
            </ol>

            <button
              type="button"
              onClick={() => window.print()}
              className="no-print mt-6 w-full rounded-xl border border-[#dce2f7] px-4 py-2.5 text-sm font-semibold text-[#263BAA]"
            >
              Descargar / imprimir PDF
            </button>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
