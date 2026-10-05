import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../services/authService';
import { authStore } from '../services/authStore';

/**
 * Estado y lógica del formulario de inicio de sesión (correo/contraseña).
 * Incluye el consentimiento de Términos y Condiciones que habilita los
 * botones de Google y GitHub.
 */
export function useLogin() {
  const navigate = useNavigate();
  // /login puede llegar con el correo ya llenado por el estado de navegación:
  // `verifiedEmail` (recién verificó su OTP: además muestra el aviso) o `prefillEmail` (intentó registrar uno existente).
  const navState = useLocation().state as { verifiedEmail?: string; prefillEmail?: string } | null;
  const verifiedEmail = navState?.verifiedEmail;
  const [formData, setFormData] = useState({
    email: verifiedEmail ?? navState?.prefillEmail ?? '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthConsent, setOauthConsent] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setError('');
    setLoading(true);

    try {
      const data = await authService.login(formData);

      authStore.setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('userEmail', formData.email);

      // El administrador NO elige rol: /select-role llama a switch-role y le cambiaría el rol a
      // SEEKER/PROVIDER en la base de datos. Va directo al panel.
      navigate(authStore.getRole() === 'ADMIN' ? '/admin' : '/select-role');
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

        if (
          lowerMsg.includes('no encontrado') ||
          lowerMsg.includes('credenciales') ||
          lowerMsg.includes('not found') ||
          lowerMsg.includes('invalid')
        ) {
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

  return {
    formData,
    error,
    setError,
    loading,
    verifiedNotice: Boolean(verifiedEmail),
    oauthConsent,
    setOauthConsent,
    handleChange,
    handleSubmit,
  };
}
