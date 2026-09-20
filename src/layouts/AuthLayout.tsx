import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import bgImage from '../assets/FondoP.jpeg';
import logoImage from '../assets/Logo.jpeg'; 

export default function AuthLayout({ children, title, subtitle }: { children: ReactNode, title: string, subtitle: string }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#dfe6fb] p-3 py-6 sm:p-6 sm:py-8">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-65"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#e8edff]/88 via-[#dfe6fb]/76 to-[#cbd6f4]/82" />
      <div className="absolute -left-24 top-16 z-0 h-72 w-72 rounded-full bg-[#263BAA]/15 blur-3xl" />
      <div className="absolute -right-24 bottom-8 z-0 h-80 w-80 rounded-full bg-[#FFF4D6]/60 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 my-auto flex w-full max-w-lg flex-col items-center rounded-[1.5rem] border border-[#cbd6f4]/80 bg-[#eaf0ff]/92 p-5 text-[#17213f] shadow-[0_24px_70px_rgba(38,59,170,0.2)] backdrop-blur-xl sm:rounded-[2rem] sm:p-10"
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
          <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7696]">Tu tiempo, nuestra tarea</span>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-center">{title}</h2>
        <p className="text-xs sm:text-sm text-[#66718e] mb-6 text-center px-4">{subtitle}</p>
        
        {children}
      </motion.div>
    </div>
  );
}
