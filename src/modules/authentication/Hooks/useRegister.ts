import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../services/authService';
import type { RegisterData, SelectableRole } from '../types/auth.types';

/** Mensajes de validación (espejo de las reglas del backend). */
export const registerMessages = {
  emailRegex:
    'El correo debe ser de dominio Gmail, Hotmail, Yahoo o un correo institucional/corporativo válido.',
  passwordRegex:
    'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.',
};

const emailRegex =
  /^[A-Za-z0-9._%+-]+@(gmail\.com|hotmail\.com|yahoo\.com|.*\.edu|.*\.edu\.[a-z]{2}|[A-Za-z0-9.-]+\.[a-z]{2,})$/;
const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;

/**
 * Estado y lógica del formulario de registro con correo/contraseña.
 * La aceptación de Términos (`acceptedTerms`) también habilita los botones
 * de registro con Google y GitHub.
 */
export function useRegister() {
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

  const isEmailValid = emailRegex.test(formData.email);
  const isPasswordValid = passwordRegex.test(formData.password);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const setRole = (role: SelectableRole) => setFormData({ ...formData, role });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.acceptedTerms) {
      setError('Debe aceptar los Términos y Condiciones y la Política de Privacidad.');
      return;
    }

    if (!isEmailValid) {
      setError(registerMessages.emailRegex);
      return;
    }

    if (!isPasswordValid) {
      setError(registerMessages.passwordRegex);
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
        // El backend manda `message` (detalle) y `error` (etiqueta corta, p. ej. "Petición inválida").
        const errorMsg = errorData?.message || errorData?.error || '';
        const combined = `${errorData?.message ?? ''} ${errorData?.error ?? ''}`.toLowerCase();

        if (combined.includes('registrado') || combined.includes('existe')) {
          // Con el correo ya registrado, el login resuelve el resto: si la cuenta sigue sin verificar,
          // el login mismo lleva al código OTP; si ya está verificada, entra normal.
          setError('Este correo ya está registrado. Redirigiendo al inicio de sesión...');
          setTimeout(() => {
            navigate('/login', { state: { prefillEmail: formData.email } });
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

  return {
    formData,
    error,
    setError,
    loading,
    isEmailValid,
    isPasswordValid,
    handleChange,
    setRole,
    handleSubmit,
  };
}
