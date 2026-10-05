import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPasswordField from './LoginPasswordField';
import GoogleLoginButton from './GoogleLoginButton';
import GithubLoginButton from './GithubLoginButton';
import OAuthConsentCheckbox from './OAuthConsentCheckbox';
import { useLogin } from '../../Hooks/useLogin';

export default function LoginForm() {
  const { formData, error, setError, loading, verifiedNotice, oauthConsent, setOauthConsent, handleChange, handleSubmit } =
    useLogin();

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
      {verifiedNotice && !error && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-medium text-emerald-800 sm:text-sm"
        >
          ✅ Cuenta verificada. Inicia sesión para continuar.
        </div>
      )}

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

      {/* 🌟 Botones de inicio de sesión social */}
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-[#d7d3e3]"></div>
        <span className="mx-4 flex-shrink text-xs uppercase tracking-wider text-[#a3afc8]">o</span>
        <div className="flex-grow border-t border-[#d7d3e3]"></div>
      </div>

      <OAuthConsentCheckbox checked={oauthConsent} onChange={setOauthConsent} />

      <GoogleLoginButton
        onError={(msg) => setError(msg)}
        disabled={!oauthConsent}
        onBlockedClick={() => setError('Debes aceptar los Términos y Condiciones para continuar con Google.')}
      />

      <GithubLoginButton
        disabled={!oauthConsent}
        onBlockedClick={() => setError('Debes aceptar los Términos y Condiciones para continuar con GitHub.')}
      />

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
