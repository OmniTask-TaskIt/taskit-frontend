import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../../modules/tasks/services/taskService';
import type { Task } from '../../modules/tasks/types/task.types';
import { paymentErrorMessage, paymentService } from '../../services/paymentService';
import type { PaymentMovement, TaskPaymentStatus } from '../../types/payment';
import { usePayments } from '../../hooks/usePayments';
import { formatPaymentAmount } from './paymentFormat';

type Props = {
  task: Task;
  currentUserId: string;
  onChanged?: () => void;
};

function latestForTask(items: PaymentMovement[], taskId: string) {
  return items
    .filter((item) => item.taskId === taskId && !item.preview)
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))[0];
}

export default function EscrowActionCard({ task, currentUserId, onChanged }: Props) {
  const ownerId = task.taskOwner || task.ownerId || '';
  const assigneeId = task.taskAssignee || task.assigneeId || '';
  const isPayer = Boolean(currentUserId) && currentUserId === ownerId;
  const isPayee = Boolean(currentUserId) && currentUserId === assigneeId;
  const { items, refresh } = usePayments(isPayer || isPayee ? currentUserId : null);
  const movement = latestForTask(items, task.taskId);
  const [fetchedWorkflow, setFetchedWorkflow] = useState<{
    taskId: string;
    baseStatus: string;
    status: string;
  } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isPayer && !isPayee) return undefined;
    let active = true;
    taskService.getCompletionStatus(task.taskId).then((status) => {
      if (active && status?.status) {
        setFetchedWorkflow({
          taskId: task.taskId,
          baseStatus: task.taskStatus,
          status: String(status.status),
        });
      }
    }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, [isPayee, isPayer, task.taskId, task.taskStatus]);

  if (!isPayer && !isPayee) return null;

  const workflow =
    fetchedWorkflow &&
    fetchedWorkflow.taskId === task.taskId &&
    fetchedWorkflow.baseStatus === task.taskStatus
      ? fetchedWorkflow.status
      : task.taskStatus;

  const paymentStatus: TaskPaymentStatus = movement?.status ?? task.paymentStatus ?? 'UNPAID';
  const amountLabel = formatPaymentAmount(movement?.amount ?? task.price, movement?.currency ?? 'COP');
  const semiCompleted = workflow === 'SEMI_COMPLETED';
  const invoiceHref = `/dashboard?section=invoices&taskId=${encodeURIComponent(task.taskId)}`;

  const pay = async () => {
    if (connecting) return;
    if (!assigneeId) {
      setMessage('Esta tarea todavía no tiene un prestador a quien pagarle.');
      return;
    }
    setConnecting(true);
    setMessage(null);
    try {
      const session = await paymentService.createCheckout({
        taskId: task.taskId,
        payerId: currentUserId,
        payeeId: assigneeId,
        payeeCollectorId: paymentService.collectorId,
        amount: Math.round(Number(task.price)),
        currency: 'COP',
        marketplaceFee: 0,
      });
      paymentService.redirectToCheckout(session);
    } catch (caught) {
      setMessage(paymentErrorMessage(caught));
      setConnecting(false);
    }
  };

  const release = async () => {
    setReleasing(true);
    setMessage(null);
    try {
      await taskService.completeTask(task.taskId, { userId: currentUserId });
      if (movement) {
        try {
          await paymentService.releaseEscrow({ transactionId: movement.transactionId, taskId: task.taskId });
        } catch {
          setMessage('La entrega quedó confirmada. Los fondos se liberan en cuanto Mercado Pago confirme el cierre.');
        }
      }
      await refresh();
      onChanged?.();
    } catch {
      setMessage('No pudimos confirmar la entrega. Inténtalo de nuevo en un momento.');
    } finally {
      setReleasing(false);
    }
  };

  if (isPayee) {
    return (
      <section className="mt-5 rounded-2xl border border-[#e4e8f3] bg-[#f8f9fd] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8290ae]">Cobro en escrow</p>
        <p className="mt-2 text-sm leading-6 text-[#2f3b63]">{payeeCopy(paymentStatus, semiCompleted, amountLabel)}</p>
        {(paymentStatus === 'RELEASED' || paymentStatus === 'REFUNDED') && (
          <Link to={invoiceHref} className="mt-3 inline-flex text-sm font-semibold text-[#263BAA]">
            {paymentStatus === 'RELEASED' ? 'Ver comprobante de ingreso' : 'Ver comprobante'}
          </Link>
        )}
        {message && <p className="mt-2 text-sm text-[#9a5b00]">{message}</p>}
      </section>
    );
  }

  if (paymentStatus === 'RETAINED') {
    return (
      <section className="mt-5 rounded-2xl border border-[#d9e2ff] bg-[#f5f7ff] p-4">
        <p className="text-sm font-semibold text-[#263BAA]">Fondos protegidos en Escrow</p>
        <p className="mt-1 text-sm text-[#5b6685]">{amountLabel} quedan reservados hasta que confirmes la entrega.</p>
        <button
          type="button"
          onClick={() => { void release(); }}
          disabled={releasing}
          className="mt-4 rounded-xl bg-[#263BAA] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-70"
        >
          {releasing ? 'Confirmando entrega...' : 'Confirmar entrega y liberar pago'}
        </button>
        {message && <p className="mt-2 text-sm text-[#5b6685]">{message}</p>}
      </section>
    );
  }

  if (paymentStatus === 'RELEASED' || paymentStatus === 'REFUNDED') {
    const released = paymentStatus === 'RELEASED';
    return (
      <section className={`mt-5 rounded-2xl border p-4 ${released ? 'border-emerald-200 bg-emerald-50/70' : 'border-rose-200 bg-rose-50/70'}`}>
        <p className={`text-sm font-semibold ${released ? 'text-emerald-800' : 'text-rose-800'}`}>
          {released ? 'Pago liberado al prestador' : 'Monto reembolsado'}
        </p>
        <Link to={invoiceHref} className="mt-2 inline-flex text-sm font-semibold text-[#263BAA]">
          {released ? 'Ver factura' : 'Ver comprobante de reembolso'}
        </Link>
      </section>
    );
  }

  const canPay = semiCompleted && paymentStatus !== 'PENDING';
  const hint = paymentStatus === 'PENDING'
    ? 'Pago en validación por Mercado Pago.'
    : 'Disponible cuando el prestador finalice su parte.';

  return (
    <section className="mt-5">
      <button
        type="button"
        onClick={() => { void pay(); }}
        disabled={!canPay || connecting}
        title={canPay ? 'Pagar con Mercado Pago Checkout Pro' : hint}
        className="rounded-xl bg-[#263BAA] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[#d5dbeb] disabled:text-[#5b6685]"
      >
        {connecting ? 'Conectando con Mercado Pago...' : 'Pagar y asegurar en Escrow'}
      </button>
      {!canPay && <p className="mt-2 text-xs leading-5 text-[#657399]">{hint}</p>}
      {message && <p className="mt-2 text-sm text-[#9a3412]" role="alert">{message}</p>}
    </section>
  );
}

function payeeCopy(status: TaskPaymentStatus, semiCompleted: boolean, amount: string) {
  if (status === 'RETAINED') return `¡Pago asegurado en Escrow! El cliente ya depositó ${amount}. Entrega el trabajo para recibir tus fondos.`;
  if (status === 'RELEASED') return '¡Fondos liberados! El pago de esta tarea ya fue acreditado.';
  if (status === 'REFUNDED') return 'Transacción reembolsada tras revisión de disputa.';
  if (status === 'PENDING') return 'El cliente inició el pago. Mercado Pago todavía lo está validando.';
  if (status === 'REJECTED') return 'El pago del cliente no se completó. Puede intentarlo de nuevo desde la tarea.';
  if (semiCompleted) return 'Esperando que el cliente realice el pago en Escrow para proceder con la entrega final.';
  return 'El cobro en escrow se habilita cuando termines tu parte y el cliente confirme el pago.';
}