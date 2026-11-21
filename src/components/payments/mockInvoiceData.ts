import type { PaymentMovement } from '../../types/payment';

export const MOCK_INVOICE: PaymentMovement = {
  transactionId: 'demo-0000-0000-0000-000000000001',
  taskId: 'demo-01',
  role: 'PAYER',
  amount: 120000,
  currency: 'COP',
  status: 'RELEASED',
  occurredAt: '2026-11-01T15:30:00.000Z',
  preview: true,
  title: 'Diseño de identidad visual — Tarea #demo-01',
};