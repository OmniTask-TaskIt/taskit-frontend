import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '../Components/ui/AuthLayout';
import { authService } from '../services/authService';

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
      // El backend responde solo { message }: verificar el correo NO inicia sesión, así que se
      // va al login con el correo ya llenado (antes se intentaba entrar a /select-role sin tokens).
      await authService.verifyOtp(email, finalOtpCode);

      setIsSuccessAnim(true);
      setSuccessMsg('¡Código verificado con éxito! Redirigiendo al inicio de sesión...');
      
      setTimeout(() => {
        navigate('/login', { replace: true, state: { verifiedEmail: email } });
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
              className="w-full rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-[#b42318] sm:text-center"
            >
              {error}
            </motion.div>
          )}
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800 sm:text-center"
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
                      backgroundColor: ['#ffffff', '#bbf7d0', '#ffffff'],
                      borderColor: '#22c55e',
                      transition: { delay: index * 0.08, duration: 0.6 }
                    }
                  : {
                      scale: digit ? 1.08 : 1,
                      y: digit ? -4 : 0,
                      borderColor: digit ? 'rgba(34, 197, 94, 0.8)' : '#c9d2f7',
                    }
              }
              whileFocus={{ scale: 1.12, borderColor: '#263BAA' }}
              transition={{ type: 'spring', stiffness: 350, damping: 18 }}
              className={`w-11 h-14 sm:w-12 sm:h-15 text-center text-xl sm:text-2xl font-bold rounded-xl bg-white border text-[#17213f] outline-none transition-colors shadow-inner ${
                digit ? 'bg-[#f3f6ff] shadow-lg shadow-[#263BAA]/20' : ''
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
          className="w-full py-3.5 bg-[#263BAA] text-white font-bold rounded-xl hover:bg-[#1a297a] transition-all shadow-[0_12px_28px_rgba(38,59,170,0.28)] disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2 text-sm mt-1"
        >
          {loading ? (
            <>
              <motion.svg 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 text-white" 
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
          <div className="text-xs text-center text-[#5b6685]">
            ¿No recibiste el código?{' '}
            <button
              type="button"
              onClick={handleResendCode}
              className="underline font-semibold hover:text-[#1a297a] cursor-pointer bg-transparent border-none text-[#263BAA]"
            >
              Reenviar
            </button>
          </div>

          <Link to="/login" className="text-xs text-[#5b6685] hover:text-[#263BAA] transition-colors mt-1">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}