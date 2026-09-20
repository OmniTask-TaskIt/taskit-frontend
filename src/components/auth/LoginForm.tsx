import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPasswordField from './LoginPasswordField';
import { authService } from '../../services/authService';
import { authStore } from '../../store/authStore';
import GoogleLoginButton from './GoogleLoginButton';

export default function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
    e.stopPropagation();

    setError('');
    setLoading(true);

    try {
      const data = await authService.login(formData);
      
      authStore.setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('userEmail', formData.email);

      navigate('/select-role');
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data as { error?: string; message?: string };
        const errorMsg = errorData?.message || errorData?.error || 'Credenciales inválidas.';
        const lowerMsg = errorMsg.toLowerCase();

        if (lowerMsg.includes('verificar') || lowerMsg.includes('otp')) {
          localStorage.setItem('userEmail', formData.email);
          setError('⚠️ Aún no has verificado tu cuenta. Redirigiendo al código OTP...');
          setTimeout(() => {
            navigate('/verify-otp');
          }, 1800);
          setLoading(false);
          return;
        }

        if (lowerMsg.includes('no encontrado') || lowerMsg.includes('credenciales') || lowerMsg.includes('not found') || lowerMsg.includes('invalid')) {
          setError('❌ Este correo no está registrado en TaskIt o la contraseña es incorrecta.');
          setLoading(false);
          return;
        }

        setError(errorMsg);
      } else {
        setError('Ocurrió un error inesperado al conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-xs font-medium text-amber-800 sm:text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-1">
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-[#d7d3e3] bg-[#f3f0f7] p-3.5 text-sm font-medium text-[#17213f] outline-none transition-all placeholder:text-[#8a94ae] focus:border-[#263BAA] focus:ring-4 focus:ring-[#263BAA]/10"
        />
      </div>

      <LoginPasswordField 
        value={formData.password}
        onChange={handleChange}
      />

      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        disabled={loading}
        className="mt-2 w-full cursor-pointer rounded-xl bg-[#263BAA] py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(38,59,170,0.28)] transition-all hover:bg-[#1a297a] hover:shadow-[0_16px_36px_rgba(38,59,170,0.38)] disabled:opacity-50"
      >
        {loading ? 'Iniciando sesión...' : 'Entrar'}
      </motion.button>

      {/* 🌟 Botón de Inicio de Sesión con Google integrado */}
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-[#d7d3e3]"></div>
        <span className="mx-4 flex-shrink text-xs uppercase tracking-wider text-[#a3afc8]">o</span>
        <div className="flex-grow border-t border-[#d7d3e3]"></div>
      </div>

      <GoogleLoginButton onError={(msg) => setError(msg)} />

      <div className="flex flex-col items-center gap-1.5 mt-2">
        <p className="text-center text-xs text-[#6b7696]">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-semibold text-[#263BAA] hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </form>
  );
}
