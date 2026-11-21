import axios from 'axios';
import { env } from '../modules/authentication/Config/env';
import { authStore } from '../modules/authentication/services/authStore';
import type {
  CheckoutCommand,
  CheckoutSession,
  EscrowReleaseResult,
  EscrowStatus,
  PaymentMovement,
  PaymentProblem,
  PaymentRole,
  PendingCheckout,
} from '../types/payment';

export const PENDING_CHECKOUT_KEY = 'taskit_pending_checkout';

const MERCADO_PAGO_ROOTS = [
  'mercadopago.com',
  'mercadopago.com.ar',
  'mercadopago.com.mx',
  'mercadopago.com.co',
  'mercadopago.com.pe',
  'mercadopago.com.uy',
  'mercadopago.com.br',
  'mercadopago.cl',
];

const FRIENDLY_ERRORS: Record<string, string> = {
  UNSAFE_REDIRECT: 'Bloqueamos la salida porque el enlace de pago no pertenece a Mercado Pago.',
  PAYMENT_NOT_FOUND: 'No encontramos ese pago. Actualiza la página e inténtalo de nuevo.',
  TASK_NOT_PAYABLE: 'Esta tarea todavía no está lista para pagarse.',
  ALREADY_PAID: 'Este pago ya fue registrado. Puedes verlo en tus facturas.',
  CONFLICT: 'Hay otro pago en curso para esta tarea. Revisa tus facturas antes de intentar de nuevo.',
  FORBIDDEN: 'No tienes permiso para hacer este movimiento.',
  COLLECTOR_MISSING: 'El prestador aún no tiene una cuenta de cobro configurada.',
  PROVIDER_UNAVAILABLE: 'Mercado Pago no está disponible en este momento. Inténtalo en unos minutos.',
  VALIDATION_ERROR: 'Faltan datos para iniciar el pago. Revisa la tarea e inténtalo de nuevo.',
};

const client = axios.create({
  baseURL: env.paymentApiUrl,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = authStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export class PaymentRequestError extends Error implements PaymentProblem {
  code: string;
  status: number;
  details?: string;

  constructor(problem: PaymentProblem) {
    super(problem.message);
    this.name = 'PaymentRequestError';
    this.code = problem.code;
    this.status = problem.status;
    this.details = problem.details;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function readString(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
}

function readNumber(record: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return 0;
}

function readStatus(value: string): EscrowStatus {
  const status = value.toUpperCase();
  if (status === 'RETAINED' || status === 'RELEASED' || status === 'REFUNDED' || status === 'REJECTED' || status === 'PENDING') {
    return status;
  }
  return 'PENDING';
}

function readRole(value: string): PaymentRole {
  return value.toUpperCase() === 'PAYEE' ? 'PAYEE' : 'PAYER';
}

export function paymentErrorMessage(error: unknown): string {
  if (error instanceof PaymentRequestError) return error.message;
  if (axios.isAxiosError(error)) {
    const body = asRecord(error.response?.data);
    const code = readString(body, 'code').toUpperCase();
    if (code && FRIENDLY_ERRORS[code]) return FRIENDLY_ERRORS[code];
    const status = error.response?.status ?? 0;
    if (status === 403) return FRIENDLY_ERRORS.FORBIDDEN;
    if (status === 404) return FRIENDLY_ERRORS.PAYMENT_NOT_FOUND;
    if (status === 409) return FRIENDLY_ERRORS.CONFLICT;
    if (status === 503) return FRIENDLY_ERRORS.PROVIDER_UNAVAILABLE;
    if (status >= 500) return 'No pudimos completar el pago. Inténtalo de nuevo en un momento.';
    if (!error.response) return 'No hay conexión con el servicio de pagos. Revisa tu red e inténtalo otra vez.';
  }
  return 'No pudimos completar esta acción de pago. Inténtalo de nuevo.';
}

function toProblem(error: unknown): PaymentRequestError {
  if (error instanceof PaymentRequestError) return error;
  if (axios.isAxiosError(error)) {
    const body = asRecord(error.response?.data);
    const code = readString(body, 'code').toUpperCase() || `HTTP_${error.response?.status ?? 0}`;
    return new PaymentRequestError({
      code,
      message: paymentErrorMessage(error),
      details: readString(body, 'details') || undefined,
      status: error.response?.status ?? 0,
    });
  }
  return new PaymentRequestError({
    code: 'UNKNOWN',
    message: paymentErrorMessage(error),
    status: 0,
  });
}

/** Solo permite salir hacia dominios oficiales de Mercado Pago por HTTPS. */
export function isSafeMercadoPagoUrl(initPoint: string): boolean {
  let url: URL;
  try {
    url = new URL(initPoint);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  if (url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  return MERCADO_PAGO_ROOTS.some((root) => host === root || host.endsWith(`.${root}`));
}

export function rememberPendingCheckout(pending: PendingCheckout) {
  sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(pending));
}

export function readPendingCheckout(): PendingCheckout | null {
  const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingCheckout;
    if (!parsed.taskId || !parsed.transactionId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingCheckout() {
  sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
}

function mapCheckout(data: unknown): CheckoutSession {
  const record = asRecord(data);
  const initPoint = readString(record, 'init-point', 'initPoint', 'init_point');
  return {
    outcome: readString(record, 'outcome') || 'create',
    transactionId: readString(record, 'transaction-id', 'transactionId'),
    taskId: readString(record, 'task-id', 'taskId'),
    status: readStatus(readString(record, 'status')),
    amount: readNumber(record, 'amount'),
    currency: readString(record, 'currency') || 'COP',
    preferenceId: readString(record, 'mp-preference-id', 'preferenceId'),
    initPoint,
  };
}

function mapMovement(data: unknown): PaymentMovement | null {
  const record = asRecord(data);
  const transactionId = readString(record, 'transaction-id', 'transactionId');
  const taskId = readString(record, 'task-id', 'taskId');
  if (!transactionId || !taskId) return null;
  return {
    transactionId,
    taskId,
    role: readRole(readString(record, 'role')),
    amount: readNumber(record, 'amount'),
    currency: readString(record, 'currency') || 'COP',
    status: readStatus(readString(record, 'status')),
    occurredAt: readString(record, 'occurred-at', 'occurredAt'),
  };
}

export const paymentService = {
  collectorId: env.payeeCollectorId,

  async createCheckout(command: CheckoutCommand): Promise<CheckoutSession> {
    try {
      const response = await client.post('/payments/checkout', {
        'task-id': command.taskId,
        'payer-id': command.payerId,
        'payee-id': command.payeeId,
        'payee-collector-id': command.payeeCollectorId || env.payeeCollectorId,
        amount: command.amount,
        currency: command.currency || 'COP',
        'marketplace-fee': command.marketplaceFee ?? 0,
      });
      const session = mapCheckout(response.data);
      if (!isSafeMercadoPagoUrl(session.initPoint)) {
        throw new PaymentRequestError({
          code: 'UNSAFE_REDIRECT',
          message: FRIENDLY_ERRORS.UNSAFE_REDIRECT,
          status: 0,
        });
      }
      return session;
    } catch (error) {
      throw toProblem(error);
    }
  },

  async getHistory(userId: string): Promise<PaymentMovement[]> {
    try {
      const response = await client.get('/payments/history', { params: { 'user-id': userId } });
      const items = asRecord(response.data).items;
      if (!Array.isArray(items)) return [];
      return items.map(mapMovement).filter((item): item is PaymentMovement => item !== null);
    } catch (error) {
      throw toProblem(error);
    }
  },

  async releaseEscrow(input: { transactionId: string; taskId?: string }): Promise<EscrowReleaseResult> {
    try {
      const response = await client.post('/payments/escrow/release', {
        'transaction-id': input.transactionId,
        'task-id': input.taskId,
      });
      const record = asRecord(response.data);
      return {
        outcome: readString(record, 'outcome'),
        action: readString(record, 'action') || 'release',
        reason: readString(record, 'reason'),
        transactionId: readString(record, 'transaction-id', 'transactionId') || input.transactionId,
        status: readString(record, 'status') || 'RELEASED',
      };
    } catch (error) {
      throw toProblem(error);
    }
  },

  redirectToCheckout(session: CheckoutSession) {
    if (!isSafeMercadoPagoUrl(session.initPoint)) {
      throw new PaymentRequestError({
        code: 'UNSAFE_REDIRECT',
        message: FRIENDLY_ERRORS.UNSAFE_REDIRECT,
        status: 0,
      });
    }
    rememberPendingCheckout({
      taskId: session.taskId,
      transactionId: session.transactionId,
      amount: session.amount,
      currency: session.currency,
      timestamp: Date.now(),
    });
    window.location.assign(session.initPoint);
  },
};
