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
      className="relative flex min-h-screen w-full overflow-hidden bg-[#eef2fb] bg-cover bg-center text-[#17213f] selection:bg-[#dce3ff] selection:text-[#17213f]"
      style={{ backgroundImage: `url(${fondoImage})` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[#f5f7ff]/75 backdrop-blur-[3px]" />

      {/* 🌟 SIDEBAR ANCHO Y CON ALTO CONTRASTE */}
      <motion.aside 
        initial={{ width: 88, x: 0 }}
        whileHover={{ width: 280 }}
        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
        className="z-20 my-auto ml-4 flex h-[94vh] flex-col justify-between overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(47,61,110,0.16)] backdrop-blur-xl group"
      >
        <div className="w-[280px]">
          {/* Logo / Marca */}
          <div className="flex h-20 items-center gap-4 border-b border-[#e8ebf5] p-5">
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
                  ? 'bg-[#263BAA] border-[#263BAA] text-white shadow-[0_8px_18px_rgba(38,59,170,0.22)] font-semibold' 
                  : 'bg-transparent border-transparent text-[#6b7696] hover:bg-[#eef2ff] hover:text-[#263BAA]'
              }`}
            >
              <UserRound size={20} strokeWidth={activeSection === 'profile' ? 2.5 : 2} className="flex-shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity truncate">Mi perfil</span>
            </button>

            <button
              onClick={() => setActiveSection('search')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer border truncate ${
                activeSection === 'search' 
                  ? 'bg-[#263BAA] border-[#263BAA] text-white shadow-[0_8px_18px_rgba(38,59,170,0.22)] font-semibold' 
                  : 'bg-transparent border-transparent text-[#6b7696] hover:bg-[#eef2ff] hover:text-[#263BAA]'
              }`}
            >
              <Search size={20} strokeWidth={activeSection === 'search' ? 2.5 : 2} className="flex-shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity truncate">Buscar profesionales</span>
            </button>

            <button
              onClick={() => setActiveSection('tasks')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer border truncate ${
                activeSection === 'tasks' 
                  ? 'bg-[#263BAA] border-[#263BAA] text-white shadow-[0_8px_18px_rgba(38,59,170,0.22)] font-semibold' 
                  : 'bg-transparent border-transparent text-[#6b7696] hover:bg-[#eef2ff] hover:text-[#263BAA]'
              }`}
            >
              <ClipboardList size={20} strokeWidth={activeSection === 'tasks' ? 2.5 : 2} className="flex-shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity truncate">Gestión de tareas</span>
            </button>
          </nav>
        </div>

        {/* Botón Salir con Contraste Adecuado */}
        <div className="w-[280px] border-t border-[#e8ebf5] p-3">
          <button 
            onClick={() => { authStore.clearSession(); localStorage.clear(); window.location.href = '/login'; }}
            className="w-full cursor-pointer overflow-hidden rounded-xl border border-transparent px-4 py-3 text-left text-sm font-medium text-[#c15a6b] transition-all hover:border-[#f0ccd3] hover:bg-[#fff2f4] hover:text-[#a73e51] flex items-center gap-4"
          >
            <LogOut size={20} strokeWidth={2} className="flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity truncate">Cerrar sesión</span>
          </button>
        </div>
      </motion.aside>

      {/* 🌟 CONTENEDOR PRINCIPAL */}
      <main className="z-10 flex h-screen flex-1 flex-col overflow-y-auto p-5 sm:p-8 custom-scrollbar">
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
