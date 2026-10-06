/** Meses completos entre dos fechas (el mes en curso solo cuenta cuando ya se cumplió el día del alta). */
export function monthsBetween(from: Date, to: Date): number {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) months -= 1;
  return Math.max(0, months);
}

const plural = (n: number, singular: string, pluralForm: string) => (n === 1 ? `1 ${singular}` : `${n} ${pluralForm}`);

/** Antigüedad legible a partir de meses completos: "menos de un mes", "3 meses", "1 año y 2 meses". */
export function formatSeniority(months: number): string {
  if (months < 1) return 'menos de un mes';
  if (months < 12) return plural(months, 'mes', 'meses');

  const years = Math.floor(months / 12);
  const rest = months % 12;
  const yearsText = plural(years, 'año', 'años');
  return rest === 0 ? yearsText : `${yearsText} y ${plural(rest, 'mes', 'meses')}`;
}
