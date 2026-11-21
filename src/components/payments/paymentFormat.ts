export function formatPaymentAmount(amount: number, currency = 'COP') {
  const code = /^[A-Za-z]{3}$/.test(currency) ? currency.toUpperCase() : 'COP';
  const number = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(amount);
  return `$${number} ${code}`;
}

export function formatPaymentDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function shortTransactionId(id: string) {
  if (id.length <= 14) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}
