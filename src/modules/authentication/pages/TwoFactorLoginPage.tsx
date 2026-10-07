import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../Components/ui/AuthLayout';
import { authService } from '../services/authService';
import { authStore } from '../services/authStore';
import { getApiErrorMessage } from '../services/apiError';
import { twoFactorChallenge } from '../services/twoFactorChallenge';

/**
 * RF-AUTH-9, segundo paso del inicio de sesión: pide el código de 6 dígitos que llegó al correo y lo canjea (junto
 * con el reto que dejó el login) por los tokens. Sin reto abierto no hay nada que verificar y vuelve al login.
 */
export default function TwoFactorLoginPage() {
  const navigate = useNavigate();
  // El reto se lee una sola vez: leerlo en cada render no cambia nada, pero así la pantalla no parpadea al limpiarlo.
  const [challenge] = useState(() => twoFactorChallenge.get());
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!challenge) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(code)) {
      setError('Ingresa los 6 dígitos del código.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.verifyTwoFactorLogin(challenge.challengeId, code);
      if (!data.accessToken) {
        setError('El servidor no devolvió un token de acceso válido.');
        return;
      }

      twoFactorChallenge.clear();
      authStore.setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('userEmail', data.email ?? challenge.email);
      // Igual que el login normal: el administrador va directo a su panel y no elige rol.
      navigate(authStore.getRole() === 'ADMIN' ? '/admin' : '/select-role', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo verificar el código. Inténtalo de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  const backToLogin = () => {
    twoFactorChallenge.clear();
    navigate('/login', { replace: true });
  };

  return (
    <AuthLayout
      title="Verificación en dos pasos"
      subtitle={`Ingresa el código de 6 dígitos que enviamos a ${challenge.email || 'tu correo'}`}
    >
      <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-4">
        {error && (
          <p role="alert" className="w-full rounded-xl border border-red-300 bg-red-50 p-3 text-center text-xs font-medium text-red-700">
            {error}
          </p>
        )}

        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          aria-label="Código de verificación"
          placeholder="000000"
          className="w-full max-w-[14rem] rounded-xl border border-[#cfd7ef] bg-white px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-[#17213f] outline-none focus:border-[#263BAA]"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-xl bg-[#263BAA] py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#1e2e85] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Verificando...' : 'Verificar y entrar'}
        </button>

        <p className="text-center text-xs text-[#17213f]/70">El código vence en 5 minutos. Si no lo ves, revisa tu carpeta de spam.</p>

        <button type="button" onClick={backToLogin} className="cursor-pointer text-xs font-semibold text-[#263BAA] underline">
          Volver al inicio de sesión
        </button>
      </form>
    </AuthLayout>
  );
}
