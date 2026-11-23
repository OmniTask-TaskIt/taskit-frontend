import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { disablePaymentNotices, enablePaymentNotices, paymentNoticesEnabled } from '../../services/paymentNotices';
import type { PaymentMovement } from '../../types/payment';
import { usePayments } from '../../hooks/usePayments';
import InvoiceDetailModal from './InvoiceDetailModal';
import MockInvoicePreview from './MockInvoicePreview';
import { formatPaymentAmount, formatPaymentDate, shortTransactionId } from './paymentFormat';

type Filter = 'all' | 'paid' | 'income' | 'escrow';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'paid', label: 'Pagos realizados' },
  { id: 'income', label: 'Ingresos' },
  { id: 'escrow', label: 'En Escrow' },
];

function matches(filter: Filter, item: PaymentMovement) {
  if (filter === 'paid') return item.role === 'PAYER';
  if (filter === 'income') return item.role === 'PAYEE';
  if (filter === 'escrow') return item.status === 'RETAINED' || item.status === 'PENDING';
  return true;
}

export default function InvoiceList({ userId, onExploreTasks }: { userId: string; onExploreTasks: () => void }) {
  const { items, loading, error, refresh } = usePayments(userId || null);
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<PaymentMovement | null>(null);
  const [noticesOn, setNoticesOn] = useState(() => paymentNoticesEnabled());
  const [copiedId, setCopiedId] = useState('');

  const visible = useMemo(
    () => items.filter((item) => matches(filter, item)).sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)),
    [filter, items],
  );

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(''), 1200);
    } catch {
      setCopiedId('');
    }
  };

  const toggleNotices = async () => {
    if (noticesOn) {
      disablePaymentNotices();
      setNoticesOn(false);
      return;
    }
    setNoticesOn(await enablePaymentNotices());
  };

  return (
    <section className="mx-auto w-full max-w-3xl">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#263BAA]">Movimientos</p>
          <h1 className="mt-1 text-2xl font-bold text-[#17213f]">Facturas y movimientos</h1>
        </div>
        <button type="button" onClick={() => { void toggleNotices(); }} className="rounded-full border border-[#dce2f7] bg-white px-3 py-1.5 text-xs font-semibold text-[#263BAA]">
          {noticesOn ? 'Avisos de pago activos' : 'Activar avisos de pago'}
        </button>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === item.id ? 'bg-[#263BAA] text-white' : 'bg-white text-[#5b6685] ring-1 ring-[#e4e8f3]'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-[#f3caca] bg-white px-4 py-3 text-sm text-[#9a3412]" role="alert">
          {error}
          <button type="button" onClick={() => { void refresh(); }} className="ml-3 font-semibold text-[#263BAA]">Reintentar</button>
        </div>
      )}

      {loading && items.length === 0 && <p className="text-sm text-[#5b6685]">Cargando movimientos...</p>}

      {!loading && items.length === 0 && !error && (
        <div className="rounded-3xl border border-[#e4e8f3] bg-white/90 p-6">
          <h2 className="text-lg font-semibold text-[#17213f]">Aún no tienes facturas registradas</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#5b6685]">
            Completa y paga tu primera tarea en Task It para generar tus comprobantes automáticamente.
          </p>
          <button type="button" onClick={onExploreTasks} className="mt-4 rounded-xl bg-[#263BAA] px-4 py-2.5 text-sm font-bold text-white">
            Explorar mis tareas
          </button>
          <MockInvoicePreview onOpen={setSelected} />
        </div>
      )}

      <ul className="space-y-3">
        {visible.map((item, index) => {
          const payer = item.role === 'PAYER';
          return (
            <motion.li
              key={item.transactionId}
              layoutId={item.transactionId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 6) * 0.04 }}
            >
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="w-full rounded-2xl border border-[#e6eaf4] bg-white px-4 py-4 text-left shadow-[0_8px_24px_rgba(47,61,110,0.05)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-xs font-semibold ${payer ? 'text-[#263BAA]' : 'text-emerald-700'}`}>
                      {payer ? 'Comprobante de pago' : 'Comprobante de ingreso'}
                    </p>
                    <p className="mt-1 text-xs text-[#5b6685]">{formatPaymentDate(item.occurredAt)}</p>
                  </div>
                  <p className={`text-lg font-semibold tabular-nums ${payer ? 'text-[#17213f]' : 'text-emerald-800'}`}>
                    {payer ? '−' : '+'}{formatPaymentAmount(item.amount, item.currency)}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[#5b6685]">{shortTransactionId(item.transactionId)}</span>
                  <span
                    role="presentation"
                    onClick={(event) => {
                      event.stopPropagation();
                      void copyId(item.transactionId);
                    }}
                    className="text-xs font-semibold text-[#263BAA]"
                  >
                    {copiedId === item.transactionId ? 'Copiado' : 'Copiar'}
                  </span>
                </div>
              </button>
            </motion.li>
          );
        })}
      </ul>

      {!loading && items.length > 0 && visible.length === 0 && (
        <p className="mt-4 text-sm text-[#5b6685]">No hay movimientos con este filtro.</p>
      )}

      <InvoiceDetailModal invoice={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
