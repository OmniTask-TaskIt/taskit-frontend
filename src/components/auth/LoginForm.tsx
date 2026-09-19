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
            className="bg-amber-500/20 border border-amber-500 text-vanilla p-3 rounded-xl text-xs sm:text-sm text-center font-medium"
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
          className="w-full p-3.5 rounded-xl bg-[#1e2e85]/60 border border-white/10 text-vanilla outline-none focus:ring-2 focus:ring-vanilla/50 placeholder:text-vanilla/50 text-sm font-medium transition-all"
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
        className="w-full mt-2 py-3.5 bg-vanilla text-[#0B132B] font-bold rounded-xl hover:bg-white transition-all shadow-lg disabled:opacity-50 cursor-pointer text-sm"
      >
        {loading ? 'Iniciando sesión...' : 'Entrar'}
      </motion.button>

      {/* 🌟 Botón de Inicio de Sesión con Google integrado */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink mx-4 text-vanilla/40 text-xs uppercase tracking-wider">o</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <GoogleLoginButton onError={(msg) => setError(msg)} />

      <div className="flex flex-col items-center gap-1.5 mt-2">
        <p className="text-xs text-center text-vanilla/70">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="underline font-semibold hover:text-white">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </form>
  );
}