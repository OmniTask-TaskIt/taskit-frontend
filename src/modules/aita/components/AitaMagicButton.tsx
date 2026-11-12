import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

type Props = {
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export default function AitaMagicButton({
  loading = false,
  loadingLabel = 'Generando...',
  children,
  disabled,
  className = '',
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-sky-50 px-3 py-1.5 text-xs font-semibold text-violet-800 shadow-sm transition hover:from-violet-100 hover:to-sky-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
      <span>{loading ? loadingLabel : children}</span>
    </button>
  );
}
