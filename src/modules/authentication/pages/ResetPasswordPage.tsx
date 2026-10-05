import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../Components/ui/AuthLayout';
import PasswordField from '../Components/register/PasswordField';
import { authService } from '../services/authService';
import { getApiErrorMessage } from '../services/apiError';

// Misma regla que el registro (PN-AUTHPR-7): 8+, mayúscula, minúscula, número y símbolo.
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;
const PASSWORD_HELP = 'Mínimo 8 caracteres, con mayúscula, minúscula, número y un símbolo (@#$%^&+=!), sin espacios.';

/** RF-AUTH-4 (paso 2): código recibido por correo + nueva contraseña. */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const navState = useLocation().state as { email?: string } | null;
  const [email, setEmail] = useState(navState?.email ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const isPasswordValid = PASSWORD_REGEX.test(password);
  const matches = password === confirm;
  const canSubmit = email.trim() !== '' && code.length === 6 && isPasswordValid && matches && !loading;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword(email.trim(), code, password);
      navigate('/login', { replace: true, state: { prefillEmail: email.trim() } });
    } catch (err) {
      setError(getApiErrorMessage(err, 'El código es inválido o ya venció. Pide uno nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError('');
    setNotice('');
    try {
      await authService.forgotPassword(email.trim());
      setNotice('Te enviamos un código nuevo.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo reenviar el código.'));
    }
  };

  const inputCls =
    'w-full rounded-xl border border-[#d7d3e3] bg-[#f3f0f7] p-3.5 text-sm font-medium text-[#17213f] outline-none transition-all placeholder:text-[#6b7696] focus:border-[#263BAA] focus:ring-4 focus:ring-[#263BAA]/10';

  return (
    <AuthLayout title="Crea una contraseña nueva" subtitle="Ingresa el código que llegó a tu correo y elige tu nueva contraseña.">
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3.5">
        {error && (
          <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-center text-xs font-medium text-rose-800 sm:text-sm">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-center text-xs font-medium text-emerald-800 sm:text-sm">
            {notice}
          </div>
        )}

        <input type="email" placeholder="Correo electrónico" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />

        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="Código de 6 dígitos"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          required
          aria-label="Código de recuperación"
          className={`${inputCls} text-center text-lg tracking-[0.5em]`}
        />

        <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} isValid={isPasswordValid} errorMessage={PASSWORD_HELP} />

        <input
          type="password"
          placeholder="Repite la contraseña"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className={inputCls}
        />
        {confirm.length > 0 && !matches && (
          <span className="px-1 text-[11px] font-medium text-rose-700">Las contraseñas no coinciden.</span>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 w-full rounded-xl bg-[#263BAA] py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(38,59,170,0.28)] transition-all hover:bg-[#1a297a] disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Cambiar contraseña'}
        </button>

        <div className="mt-1 flex flex-col items-center gap-1.5 text-xs text-[#4a5578]">
          <span>
            ¿No llegó el código?{' '}
            <button type="button" onClick={resend} disabled={!email.trim()} className="font-semibold text-[#1f2f8f] hover:underline disabled:opacity-50">
              Reenviar
            </button>
          </span>
          <Link to="/login" className="font-semibold text-[#1f2f8f] hover:underline">Volver al inicio de sesión</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
