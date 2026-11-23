import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { ArrowRight, BriefcaseBusiness, Loader2, Search, type LucideIcon } from 'lucide-react';
import AuthLayout from '../Components/ui/AuthLayout';
import { authService } from '../services/authService';
import { authStore } from '../services/authStore';

type Role = 'SEEKER' | 'PROVIDER';

const ROLES: {
  role: Role;
  title: string;
  description: string;
  icon: LucideIcon;
  fromX: number;
  /** Fondo del círculo del icono y color del icono */
  badge: string;
  glow: string;
}[] = [
  {
    role: 'SEEKER',
    title: 'Demandante',
    description: 'Buscar y contratar servicios',
    icon: Search,
    fromX: -40,
    badge: 'from-[#dfe5ff] to-[#b9c6ff] text-[#263BAA]',
    glow: 'hover:shadow-[0_18px_40px_-12px_rgba(38,59,170,0.45)] focus-visible:shadow-[0_18px_40px_-12px_rgba(38,59,170,0.45)]',
  },
  {
    role: 'PROVIDER',
    title: 'Prestador',
    description: 'Ofrecer servicios y ver tareas',
    icon: BriefcaseBusiness,
    fromX: 40,
    badge: 'from-[#fff4d6] to-[#ffd98a] text-[#8a5a00]',
    glow: 'hover:shadow-[0_18px_40px_-12px_rgba(214,150,20,0.5)] focus-visible:shadow-[0_18px_40px_-12px_rgba(214,150,20,0.5)]',
  },
];

// Al entrar el cursor (o el foco) en la tarjeta, el icono "salta" y la flecha avanza.
// Ambos heredan el estado "hover" de la tarjeta; el vaivén permanente va en un elemento aparte.
const iconVariants: Variants = {
  hover: { y: -6, rotate: [0, -10, 10, 0], scale: 1.12, transition: { duration: 0.5 } },
};

const arrowVariants: Variants = {
  hover: { x: 5 },
};

export default function SelectRolePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [error, setError] = useState('');

  const userEmail = localStorage.getItem('userEmail') || '';

  const handleSelectRole = async (role: Role) => {
    if (!userEmail) {
      setError('No se encontró el correo de sesión. Por favor, inicia sesión de nuevo.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setLoading(true);
    setSelectedRole(role);
    setError('');

    try {
      const data = await authService.switchRole(userEmail, role);

      authStore.setTokens(data.accessToken, data.refreshToken);

      navigate('/dashboard');
    } catch (err) {
      console.error("Error al cambiar rol:", err);
      setError('No se pudo asignar el rol. Inténtalo de nuevo.');
      setSelectedRole(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="¿Cómo deseas ingresar hoy?" subtitle="Selecciona tu perfil en TaskIt" animatedBackground>
      <div className="w-full flex flex-col gap-4">
        <AnimatePresence>
          {error && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto', x: [0, -6, 6, -4, 4, 0] }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-medium text-[#b42318]"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
          {ROLES.map(({ role, title, description, icon: Icon, fromX, badge, glow }, index) => {
            const isSelected = selectedRole === role;
            return (
              <motion.button
                key={role}
                type="button"
                disabled={loading}
                onClick={() => handleSelectRole(role)}
                initial={{ opacity: 0, x: fromX, y: 16 }}
                animate={{ opacity: loading && !isSelected ? 0.45 : 1, x: 0, y: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.25 + index * 0.12 }}
                whileHover={loading ? undefined : 'hover'}
                whileFocus={loading ? undefined : 'hover'}
                whileTap={loading ? undefined : { scale: 0.97 }}
                className={`role-card group relative flex cursor-pointer flex-col items-center overflow-hidden rounded-2xl border border-[#d7d3e3] bg-white p-6 text-center text-[#17213f] shadow-[0_10px_24px_rgba(47,61,110,0.1)] outline-none transition-[border-color,background-color,box-shadow] duration-300 hover:border-[#263BAA] hover:bg-[#f4f6ff] focus-visible:border-[#263BAA] focus-visible:ring-2 focus-visible:ring-[#263BAA]/40 disabled:cursor-wait ${glow} ${
                  isSelected ? 'border-[#263BAA] bg-[#f4f6ff]' : ''
                }`}
              >
                {/* Brillo que cruza la tarjeta al pasar el cursor */}
                <span
                  aria-hidden="true"
                  className="role-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                />

                <motion.span variants={iconVariants} className="relative mb-3 flex">
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }}
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-inner ${badge}`}
                  >
                    {isSelected ? <Loader2 size={28} className="animate-spin" /> : <Icon size={28} strokeWidth={2} />}
                  </motion.span>
                </motion.span>

                <h3 className="text-base font-bold text-[#17213f]">{title}</h3>
                <p className="mt-1 text-xs text-[#5b6685]">{description}</p>

                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#263BAA] opacity-70 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {isSelected ? 'Entrando...' : 'Elegir'}
                  {!isSelected && (
                    <motion.span variants={arrowVariants} className="flex">
                      <ArrowRight size={14} />
                    </motion.span>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>

        {loading && (
          <p role="status" className="text-xs text-center text-[#5b6685] animate-pulse">
            Configurando tu perfil...
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
