import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import bgImage from '../assets/FondoP.jpeg';
import logoImage from '../assets/Logo.jpeg'; 

export default function AuthLayout({ children, title, subtitle }: { children: ReactNode, title: string, subtitle: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden p-4 py-8">
      {/* Imagen de fondo */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat filter brightness-[0.75]"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Capa oscura de contraste */}
      <div className="absolute inset-0 z-0 bg-[#0B132B]/45 backdrop-blur-[2px]" />

      {/* Contenedor Principal (Mismo ancho max-w-lg para Register y Login) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 bg-[#0B132B]/85 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-lg w-full text-vanilla border border-white/15 my-auto"
      >
        {/* Cabecera del Logo (Logo animado por sí mismo) */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 flex flex-col items-center"
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
              className="w-16 h-16 rounded-2xl object-cover border border-white/20 relative z-10" 
            />

          </div>
          <span className="text-[11px] font-semibold tracking-widest text-vanilla/60 uppercase mt-2">Tu tiempo, nuestra tarea</span>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-center">{title}</h2>
        <p className="text-xs sm:text-sm text-vanilla/70 mb-6 text-center px-4">{subtitle}</p>
        
        {children}
      </motion.div>
    </div>
  );
}