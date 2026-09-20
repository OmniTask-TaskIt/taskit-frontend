import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import RoleSelector from '../RoleSelector';
import PasswordField from './PasswordField';
import { authService, type RegisterData } from '../../services/authService';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    role: 'SEEKER', 
    acceptedTerms: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const backendMessages = {
    emailRegex: "El correo debe ser de dominio Gmail, Hotmail, Yahoo o un correo institucional/corporativo válido.",
    passwordRegex: "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.",
  };

  const emailRegex = /^[A-Za-z0-9._%+-]+@(gmail\.com|hotmail\.com|yahoo\.com|.*\.edu|.*\.edu\.[a-z]{2}|[A-Za-z0-9.-]+\.[a-z]{2,})$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;

  const isEmailValid = emailRegex.test(formData.email);
  const isPasswordValid = passwordRegex.test(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.acceptedTerms) {
      setError('Debe aceptar los Términos y Condiciones y la Política de Privacidad.');
      return;
    }

    if (!isEmailValid) {
      setError(backendMessages.emailRegex);
      return;
    }

    if (!isPasswordValid) {
      setError(backendMessages.passwordRegex);
      return;
    }

    setLoading(true);
    try {
      await authService.register(formData);
      
      localStorage.setItem('userEmail', formData.email);
      
      navigate('/verify-otp');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data as { error?: string; message?: string };
        const errorMsg = errorData?.error || errorData?.message || '';

        if (errorMsg.toLowerCase().includes('registrado') || errorMsg.toLowerCase().includes('exist')) {
          localStorage.setItem('userEmail', formData.email);
          setError('Este correo ya está registrado. Redirigiendo a verificación...');
          setTimeout(() => {
            navigate('/verify-otp');
          }, 1500);
          return;
        }

        setError(errorMsg || 'Ocurrió un error al registrar el usuario.');
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:gap-3.5">
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-xs font-medium text-rose-800 sm:text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <input
        type="text"
        name="name"
        placeholder="Nombre completo"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full rounded-xl border border-[#cbd6f4] bg-[#f1f4ff] p-3 sm:p-3.5 text-sm font-medium text-[#17213f] outline-none transition-all placeholder:text-[#7d89aa] focus:border-[#263BAA] focus:ring-4 focus:ring-[#263BAA]/10"
      />

      <div className="flex flex-col gap-1">
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-[#cbd6f4] bg-[#f1f4ff] p-3 sm:p-3.5 text-sm font-medium text-[#17213f] outline-none transition-all placeholder:text-[#7d89aa] focus:border-[#263BAA] focus:ring-4 focus:ring-[#263BAA]/10"
        />
        {formData.email.length > 0 && !isEmailValid && (
          <span className="px-1 text-[11px] font-medium text-rose-700">
            {backendMessages.emailRegex}
          </span>
        )}
      </div>

      <PasswordField 
        value={formData.password}
        onChange={handleChange}
        isValid={isPasswordValid}
        errorMessage={backendMessages.passwordRegex}
      />

      <RoleSelector 
        selectedRole={formData.role}
        onSelectRole={(role) => setFormData({ ...formData, role })}
      />

      <label className="mt-1 flex cursor-pointer items-start gap-2.5 text-xs text-[#66718e]">
        <input
          type="checkbox"
          name="acceptedTerms"
          checked={formData.acceptedTerms}
          onChange={handleChange}
          className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-[#263BAA]"
        />
        <span>
          Acepto los{' '}
          <a
            href="https://taskit.blob.core.windows.net/legal-docs/terminos-y-condiciones.pdf?sp=r&st=2026-09-16T17:55:47Z&se=2026-09-17T02:10:47Z&spr=https&sv=2026-02-06&sr=b&sig=0HQGSvNEnWj67SU5YAr4P2OEL5iltqToZomPeNVik6s%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#263BAA] hover:underline"
          >
            Términos y Condiciones
          </a>
        </span>
      </label>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={loading}
        className="mt-2 w-full cursor-pointer rounded-xl bg-[#263BAA] py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(38,59,170,0.28)] transition-all hover:bg-[#1a297a] hover:shadow-[0_16px_36px_rgba(38,59,170,0.38)] disabled:opacity-50"
      >
        {loading ? 'Registrando cuenta...' : 'Crear cuenta'}
      </motion.button>

      <div className="flex flex-col items-center gap-1.5 mt-2">
        <p className="text-center text-xs text-[#6b7696]">
          ¿Ya tienes una cuenta en TaskIt?{' '}
          <Link to="/login" className="font-semibold text-[#263BAA] hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </form>
  );
}
