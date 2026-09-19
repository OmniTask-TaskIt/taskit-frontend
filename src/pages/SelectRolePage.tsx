import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import { authService } from '../services/authService';
import { authStore } from '../store/authStore';
import { BriefcaseBusiness, Search } from 'lucide-react';

export default function SelectRolePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userEmail = localStorage.getItem('userEmail') || '';

  const handleSelectRole = async (role: 'SEEKER' | 'PROVIDER') => {
    if (!userEmail) {
      setError('No se encontró el correo de sesión. Por favor, inicia sesión de nuevo.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await authService.switchRole(userEmail, role);
      
      authStore.setTokens(data.accessToken, data.refreshToken);

      navigate('/dashboard');
    } catch (err) {
      console.error("Error al cambiar rol:", err);
      setError('No se pudo asignar el rol. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="¿Cómo deseas ingresar hoy?" subtitle="Selecciona tu perfil en TaskIt">
      <div className="w-full flex flex-col gap-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-vanilla p-3 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => !loading && handleSelectRole('SEEKER')}
            className="cursor-pointer p-6 rounded-2xl bg-[#1e2e85]/50 border border-white/15 flex flex-col items-center text-center transition-all hover:bg-[#1e2e85] hover:border-vanilla/50 shadow-lg"
          >
            <Search size={30} strokeWidth={2} className="mb-2 text-vanilla" />
            <h3 className="text-base font-bold text-vanilla">Demandante</h3>
            <p className="text-xs text-vanilla/70 mt-1">Buscar y contratar servicios</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => !loading && handleSelectRole('PROVIDER')}
            className="cursor-pointer p-6 rounded-2xl bg-[#1e2e85]/50 border border-white/15 flex flex-col items-center text-center transition-all hover:bg-[#1e2e85] hover:border-vanilla/50 shadow-lg"
          >
            <BriefcaseBusiness size={30} strokeWidth={2} className="mb-2 text-vanilla" />
            <h3 className="text-base font-bold text-vanilla">Prestador</h3>
            <p className="text-xs text-vanilla/70 mt-1">Ofrecer servicios y ver tareas</p>
          </motion.div>
        </div>

        {loading && (
          <p className="text-xs text-center text-vanilla/60 animate-pulse">
            Configurando tu perfil...
          </p>
        )}
      </div>
    </AuthLayout>
  );
}