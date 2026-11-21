/** Contratos de taskit-payment-service. Las llaves kebab-case se mapean a estos modelos. */

export type CheckoutOutcome = 'create' | 'resume' | 'replay' | string;

export type EscrowStatus = 'PENDING' | 'RETAINED' | 'RELEASED' | 'REFUNDED' | 'REJECTED';

export type TaskPaymentStatus = 'UNPAID' | EscrowStatus;

export type PaymentRole = 'PAYER' | 'PAYEE';

export interface CheckoutCommand {
  taskId: string;
  payerId: string;
  payeeId: string;
  payeeCollectorId: string;
  amount: number;
  currency?: string;
  marketplaceFee?: number;
}

export interface CheckoutSession {
  outcome: CheckoutOutcome;
  transactionId: string;
  taskId: string;
  status: EscrowStatus;
  amount: number;
  currency: string;
  preferenceId: string;
  initPoint: string;
}

export interface PaymentMovement {
  transactionId: string;
  taskId: string;
  role: PaymentRole;
  amount: number;
  currency: string;
  status: EscrowStatus;
  occurredAt: string;
  /** Solo presente en la factura de ejemplo. Nunca representa dinero real. */
  preview?: boolean;
  title?: string;
}

export interface EscrowReleaseResult {
  outcome: string;
  action: string;
  reason: string;
  transactionId: string;
  status: EscrowStatus | string;
}

export interface PendingCheckout {
  taskId: string;
  transactionId: string;
  amount: number;
  currency: string;
  timestamp: number;
}

export interface PaymentProblem {
  code: string;
  message: string;
  details?: string;
  status: number;
}
