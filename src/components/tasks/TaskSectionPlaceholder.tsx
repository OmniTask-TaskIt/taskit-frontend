import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';

export default function TaskSectionPlaceholder() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto p-6 bg-[#162252]/80 backdrop-blur-md rounded-2xl border border-dashed border-vanilla/30 shadow-2xl text-center my-4"
    >
      <ClipboardList size={28} strokeWidth={2} className="mx-auto mb-2 text-vanilla" />
      <h3 className="text-lg font-bold text-vanilla">Sección de Tareas TaskIt</h3>
      <p className="text-xs text-vanilla/60 mt-1 mb-4">
        Aquí podrás gestionar tus tareas publicadas, aceptar servicios y hacer seguimiento en tiempo real.
      </p>
      <div className="py-3 px-4 bg-[#0B132B]/50 rounded-xl border border-white/5 text-vanilla/40 text-xs font-mono">
        [ Próximamente: Módulo de Tareas / Demandas / Proveedores ]
      </div>
    </motion.div>
  );
}