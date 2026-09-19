import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import { authService } from '../services/authService';
import { authStore } from '../store/authStore';

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSuccessAnim, setIsSuccessAnim] = useState(false);

  const email = localStorage.getItem('userEmail') || '';

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (pastedData.length === otp.length && !isNaN(Number(pastedData))) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[otp.length - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const finalOtpCode = otp.join('');
    if (finalOtpCode.length < otp.length) {
      setError('Por favor completa los 6 dígitos del código.');
      return;
    }

    if (!email) {
      setError('El email es obligatorio. Por favor regístrate nuevamente.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyOtp(email, finalOtpCode);
      
      if (response.accessToken) {
        authStore.setTokens(response.accessToken, response.refreshToken);
      }

      setIsSuccessAnim(true);
      setSuccessMsg('¡Código verificado con éxito! Redirigiendo...');
      
      setTimeout(() => {
        navigate('/select-role');
      }, 1500);

    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
        setError(axiosErr.response?.data?.message || axiosErr.response?.data?.error || 'Código OTP inválido o expirado.');
      } else {
        setError('Ocurrió un error al verificar el código.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('No hay un correo registrado para reenviar el código.');
      return;
    }

    try {
      await authService.resendOtp(email);
      setSuccessMsg('¡Nuevo código reenviado a tu correo exitosamente!');
    } catch {
      setError('No se pudo reenviar el código. Inténtalo más tarde.');
    }
  };

  return (
    <AuthLayout title="Verifica tu cuenta" subtitle={`Ingresa el código de 6 dígitos que enviamos a ${email || 'tu correo'}`}>
      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-5">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full bg-red-500/20 border border-red-500 text-vanilla p-3 rounded-xl text-xs sm:text-center font-medium"
            >
              {error}
            </motion.div>
          )}
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full bg-green-500/20 border border-green-500 text-vanilla p-3 rounded-xl text-xs sm:text-center font-medium"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🌟 Casillas OTP con movimiento fluido, onda elástica al escribir y baile de éxito */}
        <div className="flex justify-center gap-2 sm:gap-3 my-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              animate={
                isSuccessAnim
                  ? {
                        y: [0, -12, 0, -6, 0],
                      backgroundColor: ['#1e2e85', '#2eeba8', '#1e2e85'],
                      borderColor: '#2eeba8',
                      transition: { delay: index * 0.08, duration: 0.6 }
                    }
                  : {
                      scale: digit ? 1.08 : 1,
                      y: digit ? -4 : 0,
                      borderColor: digit ? 'rgba(46, 235, 168, 0.7)' : 'rgba(255, 255, 255, 0.2)',
                    }
              }
              whileFocus={{ scale: 1.12, borderColor: 'rgba(255, 255, 255, 0.9)' }}
              transition={{ type: 'spring', stiffness: 350, damping: 18 }}
              className={`w-11 h-14 sm:w-12 sm:h-15 text-center text-xl sm:text-2xl font-bold rounded-xl bg-[#1e2e85]/60 border text-vanilla outline-none transition-colors shadow-inner ${
                digit ? 'bg-[#25399e] shadow-lg shadow-black/40' : ''
              }`}
            />
          ))}
        </div>

        {/* Botón de envío */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading || isSuccessAnim}
          className="w-full py-3.5 bg-vanilla text-[#0B132B] font-bold rounded-xl hover:bg-white transition-all shadow-lg disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2 text-sm mt-1"
        >
          {loading ? (
            <>
              <motion.svg 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 text-[#0B132B]" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </motion.svg>
              <span>Verificando código...</span>
            </>
          ) : isSuccessAnim ? (
            '¡Verificado con éxito! 🎉'
          ) : (
            'Verificar Código'
          )}
        </motion.button>

        {/* Opciones adicionales */}
        <div className="flex flex-col items-center gap-2 mt-2">
          <div className="text-xs text-center text-vanilla/70">
            ¿No recibiste el código?{' '}
            <button
              type="button"
              onClick={handleResendCode}
              className="underline font-semibold hover:text-white cursor-pointer bg-transparent border-none text-vanilla"
            >
              Reenviar
            </button>
          </div>

          <Link to="/login" className="text-xs text-vanilla/60 hover:text-vanilla transition-colors mt-1">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}