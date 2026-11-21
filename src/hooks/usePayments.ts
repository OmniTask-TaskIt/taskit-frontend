import { useCallback, useEffect, useState } from 'react';
import { paymentErrorMessage, paymentService } from '../services/paymentService';
import { pushPaymentNotice } from '../services/paymentNotices';
import type { EscrowStatus, PaymentMovement } from '../types/payment';
import { formatPaymentAmount } from '../components/payments/paymentFormat';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let cache: PaymentMovement[] = [];
let cachedUserId = '';
let lastError: string | null = null;
let knownStatus = new Map<string, EscrowStatus>();
let primed = false;
const subscribers = new Set<() => void>();
let pollTimer = 0;
let activeUserId = '';

function isValidUuid(value: string | null | undefined): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value.trim());
}

function moneyLabel(item: PaymentMovement) {
  return formatPaymentAmount(item.amount, item.currency);
}

function notifyTransition(item: PaymentMovement, previous: EscrowStatus | undefined) {
  if (!primed || !previous || previous === item.status) return;
  const amount = moneyLabel(item);
  const invoices = '/dashboard?section=invoices';
  if (item.status === 'RETAINED' && (previous === 'PENDING' || previous === 'REJECTED')) {
    pushPaymentNotice({
      title: 'Pago asegurado en Escrow',
      body: `Tu pago de ${amount} quedó protegido hasta confirmar la entrega.`,
      actionLabel: 'Ver comprobante',
      href: invoices,
    });
    return;
  }
  if (item.status === 'RELEASED') {
    pushPaymentNotice(
      item.role === 'PAYEE'
        ? { title: '¡Recibiste un pago!', body: `Se liberaron ${amount} a tu cuenta.`, actionLabel: 'Ver comprobante', href: invoices }
        : { title: 'Fondos liberados al prestador', body: `El pago de ${amount} ya fue acreditado al prestador.`, actionLabel: 'Ver factura', href: invoices },
    );
    return;
  }
  if (item.status === 'REFUNDED') {
    pushPaymentNotice({ title: 'Reembolso procesado', body: `${amount} devueltos.`, actionLabel: 'Ver comprobante', href: invoices });
    return;
  }
  if (item.status === 'REJECTED') {
    pushPaymentNotice({
      title: 'No se pudo procesar el pago',
      body: 'Puedes reintentar desde tu tarea.',
      actionLabel: 'Ir a la tarea',
      href: `/dashboard?section=tasks&taskId=${encodeURIComponent(item.taskId)}`,
    });
  }
}

async function refreshHistory(userId: string) {
  if (!isValidUuid(userId)) {
    cache = [];
    lastError = null;
    subscribers.forEach((listener) => listener());
    return;
  }
  try {
    const items = await paymentService.getHistory(userId);
    items.forEach((item) => notifyTransition(item, knownStatus.get(item.transactionId)));
    knownStatus = new Map(items.map((item) => [item.transactionId, item.status]));
    primed = true;
    cache = items;
    cachedUserId = userId;
    lastError = null;
  } catch (caught) {
    lastError = paymentErrorMessage(caught);
  } finally {
    subscribers.forEach((listener) => listener());
  }
}

function startPolling(userId: string) {
  if (activeUserId !== userId) {
    activeUserId = userId;
    cache = [];
    knownStatus = new Map();
    primed = false;
    lastError = null;
    cachedUserId = userId;
    if (pollTimer) {
      window.clearInterval(pollTimer);
      pollTimer = 0;
    }
  }
  const tick = () => {
    void refreshHistory(userId);
  };
  tick();
  if (!pollTimer) pollTimer = window.setInterval(tick, 20000);
  return () => {
    if (activeUserId === userId && subscribers.size === 0) {
      window.clearInterval(pollTimer);
      pollTimer = 0;
    }
  };
}

export function usePayments(userId: string | null) {
  const validId = isValidUuid(userId) ? userId.trim() : null;
  const [items, setItems] = useState<PaymentMovement[]>(validId && cachedUserId === validId ? cache : []);
  const [loading, setLoading] = useState(Boolean(validId) && cachedUserId !== validId);
  const [error, setError] = useState<string | null>(lastError);

  const refresh = useCallback(async () => {
    if (!validId) return;
    setLoading(true);
    await refreshHistory(validId);
    setLoading(false);
  }, [validId]);

  useEffect(() => {
    if (!validId) return undefined;
    const sync = () => {
      setItems(cache);
      setError(lastError);
      setLoading(false);
    };
    subscribers.add(sync);
    const stop = startPolling(validId);
    return () => {
      subscribers.delete(sync);
      stop();
    };
  }, [validId]);

  return {
    items: validId ? items : [],
    loading: validId ? loading : false,
    error: validId ? error : null,
    refresh,
  };
}