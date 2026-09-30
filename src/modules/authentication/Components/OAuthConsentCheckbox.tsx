import { Link } from 'react-router-dom';

interface OAuthConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * El registro con correo/contraseña ya obliga a marcar el checkbox de
 * Términos y Condiciones antes de crear la cuenta. El login/registro con
 * Google o GitHub, en cambio, puede crear una cuenta nueva de forma
 * silenciosa apenas el proveedor confirma el correo (ver GoogleLoginUseCase /
 * GithubLoginUseCase en el backend), sin que el usuario vea nunca el
 * checkbox. Este componente cierra ese hueco: los botones de Google/GitHub
 * quedan deshabilitados hasta que el usuario acepta explícitamente aquí.
 */
export default function OAuthConsentCheckbox({ checked, onChange }: OAuthConsentCheckboxProps) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-[11px] text-[#66718e]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-[#263BAA]"
      />
      <span>
        Para continuar con Google o GitHub, acepto los{' '}
        <Link to="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#263BAA] hover:underline">
          Términos y Condiciones
        </Link>{' '}
        y la Política de Privacidad de TaskIt.
      </span>
    </label>
  );
}
