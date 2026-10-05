import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Contrast, Eye, Info, PersonStanding, RotateCcw, Wind, X } from 'lucide-react';
import { useAccessibility, type ColorBlindMode, type FontScale } from './AccessibilityContext';

const COLOR_MODES: { value: ColorBlindMode; label: string }[] = [
  { value: 'none', label: 'Ninguno' },
  { value: 'protanopia', label: 'Protanopia' },
  { value: 'deuteranopia', label: 'Deuteranopia' },
  { value: 'tritanopia', label: 'Tritanopia' },
  { value: 'achromatopsia', label: 'Escala de grises' },
];

// Solo para el equipo de diseño: muestran cómo ve la app una persona daltónica.
const SIMULATION_MODES: { value: ColorBlindMode; label: string }[] = [
  { value: 'sim-protanopia', label: 'Simular protanopia' },
  { value: 'sim-deuteranopia', label: 'Simular deuteranopia' },
  { value: 'sim-tritanopia', label: 'Simular tritanopia' },
];

const FONT_SCALES: { value: FontScale; label: string }[] = [
  { value: 'normal', label: 'A' },
  { value: 'large', label: 'A+' },
  { value: 'xlarge', label: 'A++' },
];

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const {
    colorBlindMode,
    fontScale,
    highContrast,
    reduceMotion,
    setColorBlindMode,
    setFontScale,
    toggleHighContrast,
    toggleReduceMotion,
    reset,
  } = useAccessibility();

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Cerrar menú de accesibilidad' : 'Abrir menú de accesibilidad'}
        aria-expanded={open}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-4 right-4 z-[100] flex h-12 w-12 items-center justify-center rounded-full bg-[#263BAA] text-white shadow-[0_10px_25px_rgba(38,59,170,0.45)] outline-none focus-visible:ring-4 focus-visible:ring-[#263BAA]/40 sm:bottom-6 sm:right-6"
      >
        {open ? <X size={22} /> : <PersonStanding size={24} />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Opciones de accesibilidad"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-20 right-4 z-[100] w-[calc(100vw-2rem)] max-w-[320px] rounded-2xl border border-[#e2e5f5] bg-white/97 p-4 text-[#17213f] shadow-[0_24px_60px_rgba(23,33,63,0.25)] backdrop-blur-xl sm:bottom-24 sm:right-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold">Accesibilidad</h3>
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#6b7696] hover:text-[#263BAA]"
              >
                <RotateCcw size={12} /> Restablecer
              </button>
            </div>

            <div className="mb-4">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[#34405f]">
                <Eye size={14} /> Corrección de daltonismo
              </p>
              <p className="mb-1.5 text-[11px] leading-snug text-[#6b7696]">
                Ajusta los colores para que sean más fáciles de distinguir según tu tipo de daltonismo.
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {COLOR_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setColorBlindMode(mode.value)}
                    aria-pressed={colorBlindMode === mode.value}
                    className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                      colorBlindMode === mode.value
                        ? 'border-[#263BAA] bg-[#263BAA] text-white'
                        : 'border-[#d7d3e3] bg-[#f6f4fa] text-[#34405f] hover:border-[#b8b1d2]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-1 text-xs font-semibold text-[#34405f]">Simulación (para diseño)</p>
              <p className="mb-1.5 text-[11px] leading-snug text-[#6b7696]">
                Muestra cómo ve TaskIt una persona daltónica. No es una ayuda de accesibilidad.
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {SIMULATION_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setColorBlindMode(mode.value)}
                    aria-pressed={colorBlindMode === mode.value}
                    className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                      colorBlindMode === mode.value
                        ? 'border-[#263BAA] bg-[#263BAA] text-white'
                        : 'border-[#d7d3e3] bg-[#f6f4fa] text-[#34405f] hover:border-[#b8b1d2]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-1.5 text-xs font-semibold text-[#34405f]">Tamaño del texto</p>
              <div className="flex gap-1.5">
                {FONT_SCALES.map((scale) => (
                  <button
                    key={scale.value}
                    type="button"
                    onClick={() => setFontScale(scale.value)}
                    aria-pressed={fontScale === scale.value}
                    className={`flex-1 rounded-lg border py-1.5 text-xs font-bold transition-colors ${
                      fontScale === scale.value
                        ? 'border-[#263BAA] bg-[#263BAA] text-white'
                        : 'border-[#d7d3e3] bg-[#f6f4fa] text-[#34405f] hover:border-[#b8b1d2]'
                    }`}
                  >
                    {scale.label}
                  </button>
                ))}
              </div>
            </div>

            <ToggleRow
              icon={<Contrast size={14} />}
              label="Alto contraste"
              checked={highContrast}
              onChange={toggleHighContrast}
            />
            <ToggleRow
              icon={<Wind size={14} />}
              label="Reducir animaciones"
              checked={reduceMotion}
              onChange={toggleReduceMotion}
            />

            <p className="mt-3 flex items-start gap-1 text-[10px] leading-relaxed text-[#8a94ae]">
              <Info size={12} className="mt-0.5 flex-shrink-0" />
              Tus preferencias se guardan en este dispositivo y se aplican en toda la app.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ToggleRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="mb-2 flex cursor-pointer items-center justify-between rounded-lg border border-[#d7d3e3] bg-[#f6f4fa] px-2.5 py-2 text-xs font-medium text-[#34405f]">
      <span className="flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[#263BAA]' : 'bg-[#c9c4d9]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </label>
  );
}
