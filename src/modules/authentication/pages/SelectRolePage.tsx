import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../Components/ui/AuthLayout';
import { authService } from '../services/authService';
import { authStore } from '../services/authStore';
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
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-medium text-[#b42318]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => !loading && handleSelectRole('SEEKER')}
            className="cursor-pointer p-6 rounded-2xl border border-[#d7d3e3] bg-white text-[#17213f] flex flex-col items-center text-center transition-all hover:border-[#263BAA] hover:bg-[#eef1ff] shadow-[0_10px_24px_rgba(47,61,110,0.1)]"
          >
            <Search size={30} strokeWidth={2} className="mb-2 text-[#263BAA]" />
            <h3 className="text-base font-bold text-[#17213f]">Demandante</h3>
            <p className="text-xs text-[#5b6685] mt-1">Buscar y contratar servicios</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => !loading && handleSelectRole('PROVIDER')}
            className="cursor-pointer p-6 rounded-2xl border border-[#d7d3e3] bg-white text-[#17213f] flex flex-col items-center text-center transition-all hover:border-[#263BAA] hover:bg-[#eef1ff] shadow-[0_10px_24px_rgba(47,61,110,0.1)]"
          >
            <BriefcaseBusiness size={30} strokeWidth={2} className="mb-2 text-[#263BAA]" />
            <h3 className="text-base font-bold text-[#17213f]">Prestador</h3>
            <p className="text-xs text-[#5b6685] mt-1">Ofrecer servicios y ver tareas</p>
          </motion.div>
        </div>

        {loading && (
          <p className="text-xs text-center text-[#5b6685] animate-pulse">
            Configurando tu perfil...
          </p>
        )}
      </div>
    </AuthLayout>
  );
}