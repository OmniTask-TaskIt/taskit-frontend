export interface PaymentNotice {
  id: string;
  title: string;
  body: string;
  actionLabel?: string;
  href?: string;
}

const listeners = new Set<(notice: PaymentNotice) => void>();
export const PAYMENT_NOTICE_PREF = 'taskit_payment_notices';

export function subscribePaymentNotices(listener: (notice: PaymentNotice) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function browserNoticesAllowed() {
  return (
    typeof Notification !== 'undefined' &&
    Notification.permission === 'granted' &&
    localStorage.getItem(PAYMENT_NOTICE_PREF) === 'on'
  );
}

function playSoftCue() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  try {
    navigator.vibrate?.(12);
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 660;
    gain.gain.value = 0.015;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.12);
    oscillator.stop(context.currentTime + 0.13);
    window.setTimeout(() => void context.close(), 250);
  } catch {
    // El aviso visual sigue siendo la fuente principal.
  }
}

export function pushPaymentNotice(notice: Omit<PaymentNotice, 'id'>) {
  const full: PaymentNotice = { ...notice, id: crypto.randomUUID() };
  listeners.forEach((listener) => listener(full));
  playSoftCue();
  if (browserNoticesAllowed() && document.hidden) {
    try {
      new Notification(full.title, { body: full.body });
    } catch {
      // El navegador puede bloquear la notificación nativa sin afectar el aviso interno.
    }
  }
}

export async function enablePaymentNotices(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;
  const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  const enabled = permission === 'granted';
  localStorage.setItem(PAYMENT_NOTICE_PREF, enabled ? 'on' : 'off');
  return enabled;
}

export function disablePaymentNotices() {
  localStorage.setItem(PAYMENT_NOTICE_PREF, 'off');
}

export function paymentNoticesEnabled() {
  return localStorage.getItem(PAYMENT_NOTICE_PREF) === 'on' && browserNoticesAllowed();
}
