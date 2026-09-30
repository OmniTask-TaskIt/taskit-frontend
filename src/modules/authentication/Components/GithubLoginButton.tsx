import { env } from '../../../shared/Config/env';

// lucide-react no incluye logos de marcas (GitHub, Google, etc.), así que el
// ícono se dibuja como SVG inline en vez de importarlo de un paquete de íconos.
function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.71 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.6.24 2.77.12 3.06.74.8 1.18 1.83 1.18 3.09 0 4.44-2.7 5.42-5.27 5.7.42.36.78 1.07.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .3.21.66.8.55A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

interface GithubLoginButtonProps {
  disabled?: boolean;
  onBlockedClick?: () => void;
}

/**
 * GitHub usa el flujo de "Authorization Code": este botón solo arma la URL de
 * autorización y redirige el navegador completo a github.com. GitHub luego
 * redirige de vuelta a `env.githubRedirectUri` con `?code=...`, y esa ruta
 * (GithubCallbackPage) es la que intercambia el código por sesión llamando
 * al backend.
 */
export default function GithubLoginButton({ disabled, onBlockedClick }: GithubLoginButtonProps) {
  const handleClick = () => {
    if (disabled) {
      onBlockedClick?.();
      return;
    }

    if (!env.githubClientId) {
      onBlockedClick?.();
      return;
    }

    // Guardamos a dónde volver en caso de que el login se inicie desde
    // /register en vez de /login (misma app, mismo flujo de callback).
    sessionStorage.setItem('githubOauthState', window.location.pathname);
    // El botón solo llega aquí si el usuario ya marcó el checkbox de términos;
    // se recuerda para enviarlo al backend cuando GitHub redirija de vuelta.
    sessionStorage.setItem('githubOauthTermsAccepted', 'true');

    const params = new URLSearchParams({
      client_id: env.githubClientId,
      redirect_uri: env.githubRedirectUri,
      scope: 'read:user user:email',
      allow_signup: 'true',
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-disabled={disabled}
      className={`mt-3 flex w-full items-center justify-center gap-2.5 rounded-full bg-[#161b22] py-3 text-sm font-semibold text-white shadow-md transition-all ${
        disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#0d1117]'
      }`}
    >
      <GithubMark />
      Continuar con GitHub
    </button>
  );
}
