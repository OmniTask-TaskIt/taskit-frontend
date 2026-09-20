import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';

export default function TaskSectionPlaceholder() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto p-6 rounded-2xl border border-dashed border-[#cfd7ef] bg-white/95 text-center shadow-[0_18px_45px_rgba(47,61,110,0.1)] my-4"
    >
      <ClipboardList size={28} strokeWidth={2} className="mx-auto mb-2 text-[#263BAA]" />
      <h3 className="text-lg font-bold text-[#263BAA]">Sección de Tareas TaskIt</h3>
      <p className="text-xs text-[#263BAA]/60 mt-1 mb-4">
        Aquí podrás gestionar tus tareas publicadas, aceptar servicios y hacer seguimiento en tiempo real.
      </p>
      <div className="py-3 px-4 bg-[#0B132B]/50 rounded-xl border border-white/5 text-[#263BAA]/40 text-xs font-mono">
        [ Próximamente: Módulo de Tareas / Demandas / Proveedores ]
      </div>
    </motion.div>
  );
}
