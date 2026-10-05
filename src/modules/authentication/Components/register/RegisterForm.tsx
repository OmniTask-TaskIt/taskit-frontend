import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import RoleSelector from './RoleSelector';
import PasswordField from './PasswordField';
import GoogleLoginButton from '../auth/GoogleLoginButton';
import GithubLoginButton from '../auth/GithubLoginButton';
import { useRegister, registerMessages } from '../../Hooks/useRegister';

export default function RegisterForm() {
  const { formData, error, setError, loading, isEmailValid, isPasswordValid, handleChange, setRole, handleSubmit } =
    useRegister();

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
        className="w-full rounded-xl border border-[#d7d3e3] bg-[#f3f0f7] p-3 sm:p-3.5 text-sm font-medium text-[#17213f] outline-none transition-all placeholder:text-[#7d89aa] focus:border-[#263BAA] focus:ring-4 focus:ring-[#263BAA]/10"
      />

      <div className="flex flex-col gap-1">
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-[#d7d3e3] bg-[#f3f0f7] p-3 sm:p-3.5 text-sm font-medium text-[#17213f] outline-none transition-all placeholder:text-[#7d89aa] focus:border-[#263BAA] focus:ring-4 focus:ring-[#263BAA]/10"
        />
        {formData.email.length > 0 && !isEmailValid && (
          <span className="px-1 text-[11px] font-medium text-rose-700">
            {registerMessages.emailRegex}
          </span>
        )}
      </div>

      <PasswordField 
        value={formData.password}
        onChange={handleChange}
        isValid={isPasswordValid}
        errorMessage={registerMessages.passwordRegex}
      />

      <RoleSelector 
        selectedRole={formData.role}
        onSelectRole={setRole}
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
          <Link
            to="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#263BAA] hover:underline"
          >
            Términos y Condiciones
          </Link>
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

      {/* 🌟 Alta con proveedores sociales: usa el mismo checkbox de arriba como
          consentimiento explícito, ya que el backend crea la cuenta y marca
          los términos como aceptados apenas Google/GitHub confirman el correo. */}
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-[#d7d3e3]"></div>
        <span className="mx-4 flex-shrink text-xs uppercase tracking-wider text-[#a3afc8]">o</span>
        <div className="flex-grow border-t border-[#d7d3e3]"></div>
      </div>

      <GoogleLoginButton
        onError={(msg) => setError(msg)}
        disabled={!formData.acceptedTerms}
        onBlockedClick={() => setError('Debes aceptar los Términos y Condiciones para continuar con Google.')}
      />

      <GithubLoginButton
        disabled={!formData.acceptedTerms}
        onBlockedClick={() => setError('Debes aceptar los Términos y Condiciones para continuar con GitHub.')}
      />

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
