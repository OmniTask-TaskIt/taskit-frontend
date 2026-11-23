import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authStore } from '../modules/authentication/services/authStore';
import { clearPendingCheckout, paymentService, readPendingCheckout } from '../services/paymentService';
import { pushPaymentNotice } from '../services/paymentNotices';
import { formatPaymentAmount } from '../components/payments/paymentFormat';

type Landing = 'approved' | 'pending' | 'failure';

function landingFrom(status: string): Landing {
  const value = status.toLowerCase();
  if (value === 'approved' || value === 'success') return 'approved';
  if (value === 'pending' || value === 'in_process') return 'pending';
  return 'failure';
}

const COPY: Record<Landing, { title: string; body: string }> = {
  approved: {
    title: 'Pago asegurado en Escrow',
    body: 'Tus fondos quedan protegidos hasta que confirmes la entrega.',
  },
  pending: {
    title: 'Pago en validación por Mercado Pago',
    body: 'Te avisaremos cuando el pago quede retenido en escrow.',
  },
  failure: {
    title: 'Pago no completado',
    body: 'Puedes intentarlo nuevamente cuando quieras.',
  },
};

export default function PaymentCallbackPage() {
  const [params] = useSearchParams();
  const [ready, setReady] = useState(false);
  const pending = readPendingCheckout();
  const status = params.get('collection_status') || params.get('status') || '';
  const landing = landingFrom(status);
  const taskId = pending?.taskId || params.get('external_reference') || '';
  const amount = pending ? formatPaymentAmount(pending.amount, pending.currency) : '';

  useEffect(() => {
    let active = true;
    const userId = authStore.getUserId();
    clearPendingCheckout();
    if (landing === 'approved') {
      pushPaymentNotice({
        title: 'Pago asegurado en Escrow',
        body: amount ? `Tu pago de ${amount} quedó protegido hasta confirmar la entrega.` : 'Tu pago quedó protegido hasta confirmar la entrega.',
        actionLabel: 'Ver comprobante',
        href: '/dashboard?section=invoices',
      });
    }
    const finish = () => {
      if (active) setReady(true);
    };
    if (!userId) {
      finish();
      return () => {
        active = false;
      };
    }
    paymentService.getHistory(userId).then(finish).catch(finish);
    return () => {
      active = false;
    };
  }, [amount, landing]);

  const copy = COPY[landing];

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4">
      <section className="w-full max-w-md rounded-3xl border border-[#e6eaf4] bg-white p-8 text-center shadow-[0_18px_50px_rgba(47,61,110,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5b6685]">
          {ready ? 'Listo' : 'Verificando estado de tu pago...'}
        </p>
        <h1 className="mt-3 text-2xl font-bold text-[#17213f]">{ready ? copy.title : 'Un momento'}</h1>
        <p className="mt-2 text-sm leading-6 text-[#5b6685]">{ready ? copy.body : 'Estamos sincronizando el resultado con tu tarea.'}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            to={taskId ? `/dashboard?section=tasks&taskId=${encodeURIComponent(taskId)}` : '/dashboard?section=tasks'}
            className="rounded-xl bg-[#263BAA] px-4 py-2.5 text-sm font-bold text-white"
          >
            Volver a mi tarea
          </Link>
          <Link to="/dashboard?section=invoices" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#263BAA]">
            Ver mis facturas
          </Link>
        </div>
      </section>
    </main>
  );
}
