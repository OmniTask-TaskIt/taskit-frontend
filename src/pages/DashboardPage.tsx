import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskSectionPlaceholder from '../components/tasks/TaskSectionPlaceholder';
import ProfileSearchSection from '../components/profile/ProfileSearchSection';
import UserProfileCard from '../components/profile/UserProfileCard';
import { authStore } from '../store/authStore';
import { ClipboardList, LogOut, Search, UserRound } from 'lucide-react';

import fondoImage from '../assets/FondoP.jpeg';

type SectionType = 'profile' | 'search' | 'tasks';

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<SectionType>('profile');
  
  return (
    <div 
      className="w-full min-h-screen flex relative overflow-hidden bg-cover bg-center selection:bg-[#FFF4D6] selection:text-[#0B132B]"
      style={{ backgroundImage: `url(${fondoImage})` }}
    >
      {/* 🌟 OVERLAY SUTIL */}
      <div className="absolute inset-0 bg-[#0B132B]/40 backdrop-blur-[1px] pointer-events-none" />

      {/* 🌟 SIDEBAR ANCHO Y CON ALTO CONTRASTE */}
      <motion.aside 
        initial={{ width: 88, x: 0 }}
        whileHover={{ width: 280 }}
        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
        className="h-[94vh] my-auto ml-4 rounded-3xl flex flex-col justify-between border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-20 overflow-hidden group backdrop-blur-xl bg-[#171A34]/85"
      >
        <div className="w-[280px]">
          {/* Logo / Marca */}
          <div className="p-5 h-20 border-b border-white/15 flex items-center gap-4">
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#FFF4D6] text-[#0B132B] flex items-center justify-center font-black text-xl shadow-lg">
              T
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden pr-4">
              <h2 className="text-sm font-bold text-white tracking-wide truncate">TaskIt</h2>
              <p className="text-[11px] text-white/70 font-semibold tracking-wider uppercase truncate">Workspace</p>
            </div>
          </div>

          {/* Opciones de Navegación con Texto Visible y Contraste Alto */}
          <nav className="p-3 flex flex-col gap-2.5 mt-3">
            <button
              onClick={() => setActiveSection('profile')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer border truncate ${
                activeSection === 'profile' 
                  ? 'bg-[#263BAA] border-white/30 text-white shadow-md font-semibold' 
                  : 'bg-transparent border-transparent text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <UserRound size={20} strokeWidth={activeSection === 'profile' ? 2.5 : 2} className="flex-shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity truncate">Mi perfil</span>
            </button>

            <button
              onClick={() => setActiveSection('search')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer border truncate ${
                activeSection === 'search' 
                  ? 'bg-[#263BAA] border-white/30 text-white shadow-md font-semibold' 
                  : 'bg-transparent border-transparent text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Search size={20} strokeWidth={activeSection === 'search' ? 2.5 : 2} className="flex-shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity truncate">Buscar profesionales</span>
            </button>

            <button
              onClick={() => setActiveSection('tasks')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer border truncate ${
                activeSection === 'tasks' 
                  ? 'bg-[#263BAA] border-white/30 text-white shadow-md font-semibold' 
                  : 'bg-transparent border-transparent text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ClipboardList size={20} strokeWidth={activeSection === 'tasks' ? 2.5 : 2} className="flex-shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity truncate">Gestión de tareas</span>
            </button>
          </nav>
        </div>

        {/* Botón Salir con Contraste Adecuado */}
        <div className="p-3 border-t border-white/15 w-[280px]">
          <button 
            onClick={() => { authStore.clearSession(); localStorage.clear(); window.location.href = '/login'; }}
            className="w-full flex items-center gap-4 py-3 px-4 text-red-300 hover:bg-red-500/20 hover:text-white rounded-xl text-sm font-medium transition-all cursor-pointer overflow-hidden border border-transparent hover:border-red-500/40"
          >
            <LogOut size={20} strokeWidth={2} className="flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity truncate">Cerrar sesión</span>
          </button>
        </div>
      </motion.aside>

      {/* 🌟 CONTENEDOR PRINCIPAL */}
      <main className="flex-1 flex flex-col z-10 p-6 sm:p-10 h-screen overflow-y-auto custom-scrollbar">
        <div className="w-full flex-1">
          <AnimatePresence mode="wait">
            {activeSection === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
                <UserProfileCard />
              </motion.div>
            )}

            {activeSection === 'search' && (
              <motion.div key="search" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
                <ProfileSearchSection />
              </motion.div>
            )}

            {activeSection === 'tasks' && (
              <motion.div key="tasks" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
                <TaskSectionPlaceholder />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}