import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import type { AdminTheme } from '../../services/adminTheme';

interface ThemeToggleProps {
  theme: AdminTheme;
  onToggle: () => void;
}

/** Interruptor noche (luna) / día (sol). El icono activo es el del modo en el que está el panel. */
export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
      title={isDark ? 'Modo noche' : 'Modo día'}
      onClick={onToggle}
      className="relative flex h-10 w-[76px] shrink-0 items-center rounded-full border border-adm-line-strong bg-adm-surface px-1 hover:border-adm-hover-border"
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 text-adm-muted">
        <Sun size={15} aria-hidden="true" />
        <Moon size={15} aria-hidden="true" />
      </span>
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#263BAA] text-white shadow-md ${
          isDark ? 'ml-auto' : 'mr-auto'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex"
          >
            {isDark ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
