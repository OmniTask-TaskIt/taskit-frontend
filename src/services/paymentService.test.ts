import { describe, expect, it, vi } from 'vitest';

const http = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
}));

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    default: {
      create: () => ({
        post: http.post,
        get: http.get,
        interceptors: { request: { use: vi.fn() } },
      }),
      isAxiosError: actual.default.isAxiosError,
    },
  };
});

import { isSafeMercadoPagoUrl, paymentErrorMessage, paymentService, readPendingCheckout, PENDING_CHECKOUT_KEY } from './paymentService';

describe('redirección segura a Mercado Pago', () => {
  it('acepta solo https en dominios oficiales', () => {
    expect(isSafeMercadoPagoUrl('https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=1')).toBe(true);
    expect(isSafeMercadoPagoUrl('https://sandbox.mercadopago.com/checkout/v1/redirect?pref_id=1')).toBe(true);
    expect(isSafeMercadoPagoUrl('https://www.mercadopago.com/checkout')).toBe(true);
    expect(isSafeMercadoPagoUrl('http://www.mercadopago.com.co/checkout')).toBe(false);
    expect(isSafeMercadoPagoUrl('https://evil.example/mercadopago.com')).toBe(false);
    expect(isSafeMercadoPagoUrl('https://mercadopago.com.evil.com/pay')).toBe(false);
    expect(isSafeMercadoPagoUrl('https://notmercadopago.com/pay')).toBe(false);
  });

  it('no guarda contexto ni sale si el init-point no es de Mercado Pago', async () => {
    http.post.mockResolvedValueOnce({
      data: {
        outcome: 'create',
        'transaction-id': 'tx-1',
        'task-id': 'task-1',
        status: 'PENDING',
        amount: 50000,
        currency: 'COP',
        'mp-preference-id': 'pref',
        'init-point': 'https://phishing.example/pay',
      },
    });

    await expect(paymentService.createCheckout({
      taskId: 'task-1',
      payerId: 'payer',
      payeeId: 'payee',
      payeeCollectorId: '3494430459',
      amount: 50000,
    })).rejects.toThrow(/mercado pago/i);
    expect(sessionStorage.getItem(PENDING_CHECKOUT_KEY)).toBeNull();
  });

  it('traduce el código del backend y no muestra el detalle técnico', () => {
    const error = {
      isAxiosError: true,
      message: 'Request failed with status code 409',
      response: {
        status: 409,
        data: { code: 'CONFLICT', message: 'OptimisticLockException', details: 'at PaymentService.java:88' },
      },
    };
    const message = paymentErrorMessage(error);
    expect(message).toMatch(/otro pago en curso/i);
    expect(message).not.toMatch(/OptimisticLock|java:88/i);
    expect(readPendingCheckout()).toBeNull();
  });
});
