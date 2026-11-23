import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { BrushCleaning, ChefHat, GraduationCap, PawPrint, Wrench, type LucideIcon } from 'lucide-react';
import bgImage from '../../../../assets/FondoP.jpeg';
import logoImage from '../../../../assets/Logo.jpeg'; 

/**
 * Burbujas de servicios que flotan al fondo (solo decorativas). Van en las zonas despejadas de la foto
 * (arriba y abajo del centro) para no encimarse con los iconos que ya trae la imagen.
 */
const FLOATING_SERVICES: { icon: LucideIcon; left: string; top: string; size: number; delay: number; duration: number; tone: string; hideOnMobile?: boolean }[] = [
  { icon: Wrench, left: '30%', top: '7%', size: 46, delay: 0.2, duration: 7, tone: 'bg-[#e3e0ff]/90 text-[#4b3fb5]' },
  { icon: PawPrint, left: '64%', top: '9%', size: 50, delay: 1, duration: 8, tone: 'bg-[#cfe9ff]/90 text-[#1f6fb2]' },
  { icon: GraduationCap, left: '24%', top: '87%', size: 52, delay: 0.6, duration: 7.5, tone: 'bg-[#ffe9b0]/90 text-[#a86a00]' },
  { icon: ChefHat, left: '68%', top: '86%', size: 50, delay: 1.5, duration: 8.5, tone: 'bg-[#ffd3dc]/90 text-[#b64055]' },
  { icon: BrushCleaning, left: '46%', top: '92%', size: 40, delay: 0.9, duration: 6.5, tone: 'bg-[#d3f1e1]/90 text-[#177245]', hideOnMobile: true },
];

/** Burbujas suaves que suben despacio de abajo hacia arriba. */
const RISING_BUBBLES = [
  { left: '12%', size: 14, duration: 16, delay: 0 },
  { left: '27%', size: 22, duration: 20, delay: 4 },
  { left: '41%', size: 10, duration: 14, delay: 8 },
  { left: '58%', size: 18, duration: 18, delay: 2 },
  { left: '73%', size: 12, duration: 15, delay: 6 },
  { left: '88%', size: 20, duration: 21, delay: 10 },
];

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  /** Añade orbes de luz y burbujas de servicios que flotan al fondo. Apagado por defecto para no cambiar las demás pantallas. */
  animatedBackground?: boolean;
}

export default function AuthLayout({ children, title, subtitle, animatedBackground = false }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#f0edf4] p-3 py-6 sm:p-6 sm:py-8">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-65"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 z-0 bg-transparent" />
      <div className="absolute -left-24 top-16 z-0 h-72 w-72 rounded-full bg-[#aeb9e8]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-8 z-0 h-80 w-80 rounded-full bg-[#FFF4D6]/60 blur-3xl" />

      {animatedBackground && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-[#7183ff]/25 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -50, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-[#ffd98a]/40 blur-3xl"
          />
          {RISING_BUBBLES.map(({ left, size, duration, delay }, i) => (
            <motion.span
              key={`bubble-${i}`}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: '-115vh', opacity: [0, 0.8, 0.8, 0] }}
              transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
              style={{ left, bottom: -40, width: size, height: size }}
              className="absolute rounded-full border border-white/70 bg-white/40 shadow-[0_0_18px_rgba(255,255,255,0.7)]"
            />
          ))}
          {FLOATING_SERVICES.map(({ icon: Icon, left, top, size, delay, duration, tone, hideOnMobile }, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, y: [0, -16, 0], rotate: [-4, 4, -4] }}
              transition={{
                opacity: { duration: 0.6, delay },
                scale: { duration: 0.6, delay },
                y: { duration, delay, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: duration + 1, delay, repeat: Infinity, ease: 'easeInOut' },
              }}
              style={{ left, top, width: size, height: size }}
              className={`absolute flex items-center justify-center rounded-full shadow-[0_10px_24px_rgba(38,59,170,0.12)] backdrop-blur-sm ${tone} ${
                hideOnMobile ? 'hidden sm:flex' : ''
              }`}
            >
              <Icon size={size * 0.46} strokeWidth={2} />
            </motion.span>
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 my-auto flex w-full max-w-lg flex-col items-center rounded-[1.5rem] border border-[#d9d4e5]/90 bg-[#f6f2f2]/94 p-5 text-[#17213f] shadow-[0_24px_70px_rgba(54,63,115,0.16)] backdrop-blur-xl sm:rounded-[2rem] sm:p-10"
      >
        {/* Cabecera del Logo (Logo animado por sí mismo) */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-3 flex flex-col items-center sm:mb-4"
        >
          <div className="flex items-center justify-center mb-1">
            
            {/* 🌟 Tu Logo con Animación Flotante y Resplandor 🌟 */}
            <motion.img 
              src={logoImage} 
              alt="TaskIt Logo" 
              animate={{ 
                y: [0, -6, 0],
                boxShadow: [
                  "0px 4px 10px rgba(255, 255, 255, 0.05)",
                  "0px 10px 25px rgba(59, 130, 246, 0.4)",
                  "0px 4px 10px rgba(255, 255, 255, 0.05)"
                ]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3.5,
                ease: "easeInOut" 
              }}
              className="relative z-10 h-16 w-16 rounded-2xl border border-[#dce3ff] object-cover shadow-[0_10px_22px_rgba(38,59,170,0.18)]" 
            />

          </div>
          <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5b6685]">Tu tiempo, nuestra tarea</span>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-center">{title}</h2>
        <p className="text-xs sm:text-sm text-[#5b6685] mb-6 text-center px-4">{subtitle}</p>
        
        {children}
      </motion.div>
    </div>
  );
}
