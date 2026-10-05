import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../Components/ui/AuthLayout';
import { authService } from '../services/authService';
import { getApiErrorMessage } from '../services/apiError';

/** RF-AUTH-4 (paso 1): el usuario pide un código de recuperación a su correo. */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem('userEmail') ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      navigate('/reset-password', { state: { email: email.trim() } });
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo enviar el código. Inténtalo de nuevo en unos minutos.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recupera tu contraseña"
      subtitle="Escribe tu correo y te enviaremos un código de 6 dígitos que vence en 15 minutos."
    >
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3.5">
        {error && (
          <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-center text-xs font-medium text-rose-800 sm:text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-[#d7d3e3] bg-[#f3f0f7] p-3.5 text-sm font-medium text-[#17213f] outline-none transition-all placeholder:text-[#6b7696] focus:border-[#263BAA] focus:ring-4 focus:ring-[#263BAA]/10"
        />

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="mt-1 w-full rounded-xl bg-[#263BAA] py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(38,59,170,0.28)] transition-all hover:bg-[#1a297a] disabled:opacity-50"
        >
          {loading ? 'Enviando código...' : 'Enviar código'}
        </button>

        <Link to="/login" className="mt-1 text-center text-xs font-semibold text-[#1f2f8f] hover:underline">
          Volver al inicio de sesión
        </Link>
      </form>
    </AuthLayout>
  );
}
