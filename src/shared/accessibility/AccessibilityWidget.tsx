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
        className={`fixed bottom-20 right-4 ${open ? 'z-[100]' : 'z-40'} flex h-12 w-12 items-center justify-center rounded-full bg-[#263BAA] text-white shadow-[0_10px_25px_rgba(38,59,170,0.45)] outline-none focus-visible:ring-4 focus-visible:ring-[#263BAA]/40 md:bottom-6 sm:right-6`}
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
            className="fixed bottom-36 right-4 z-[100] max-h-[calc(100dvh-13.5rem)] w-[calc(100vw-2rem)] max-w-[320px] touch-pan-y overflow-y-auto overscroll-contain rounded-2xl border border-[#e2e5f5] bg-white p-4 pt-0 text-[#17213f] shadow-[0_24px_60px_rgba(23,33,63,0.25)] sm:right-6 md:bottom-24 md:max-h-[calc(100dvh-8rem)]"
          >
            <div className="sticky top-0 z-10 -mx-4 mb-3 flex items-center justify-between border-b border-[#eef0f8] bg-white px-4 pb-2 pt-4">
              <h3 className="text-sm font-bold">Accesibilidad</h3>
              <button
                type="button"
                onClick={reset}
                className="flex min-h-[40px] items-center gap-1 px-1 text-xs font-semibold text-[#5b6685] hover:text-[#263BAA]"
              >
                <RotateCcw size={12} /> Restablecer
              </button>
            </div>

            <div className="mb-4">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[#34405f]">
                <Eye size={14} /> Corrección de daltonismo
              </p>
              <p className="mb-1.5 text-xs leading-snug text-[#5b6685]">
                Ajusta los colores para que sean más fáciles de distinguir según tu tipo de daltonismo.
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {COLOR_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setColorBlindMode(mode.value)}
                    aria-pressed={colorBlindMode === mode.value}
                    className={`min-h-[44px] rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
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
              <p className="mb-1.5 text-xs leading-snug text-[#5b6685]">
                Muestra cómo ve TaskIt una persona daltónica. No es una ayuda de accesibilidad.
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {SIMULATION_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setColorBlindMode(mode.value)}
                    aria-pressed={colorBlindMode === mode.value}
                    className={`min-h-[44px] rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
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
                    className={`min-h-[44px] flex-1 rounded-lg border py-1.5 text-xs font-bold transition-colors ${
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

            <p className="mt-3 flex items-start gap-1 text-[11px] leading-relaxed text-[#5b6685]">
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
  // Toda la fila es el botón: antes solo respondía el interruptor pequeño, difícil de acertar con el dedo.
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="mb-2 flex min-h-[48px] w-full items-center justify-between rounded-lg border border-[#d7d3e3] bg-[#f6f4fa] px-2.5 py-2 text-left text-xs font-medium text-[#34405f]"
    >
      <span className="flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span
        aria-hidden="true"
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[#263BAA]' : 'bg-[#c9c4d9]'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  );
}
