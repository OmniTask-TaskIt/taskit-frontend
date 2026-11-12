import { useEffect, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { authStore } from '../../services/authStore';
import { twoFactorChallenge } from '../../services/twoFactorChallenge';
import axios from 'axios';

interface GoogleLoginButtonProps {
  onError: (msg: string) => void;
  disabled?: boolean;
  onBlockedClick?: () => void;
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Google solo acepta anchos entre 200 y 400 px para su botón.
const GOOGLE_BUTTON_MIN_WIDTH = 200;
const GOOGLE_BUTTON_MAX_WIDTH = 400;

/**
 * El botón de Google se dibuja en un iframe con un ancho fijo en píxeles, así que no
 * se adapta solo al contenedor. Se mide el ancho disponible y se le pasa a Google
 * (dentro del rango permitido) para que en pantallas de celular no se salga de la tarjeta.
 */
function useGoogleButtonWidth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(GOOGLE_BUTTON_MAX_WIDTH);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const update = () => {
      const available = Math.floor(element.getBoundingClientRect().width);
      if (available <= 0) return;
      setWidth(Math.min(GOOGLE_BUTTON_MAX_WIDTH, Math.max(GOOGLE_BUTTON_MIN_WIDTH, available)));
    };

    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { containerRef, width };
}

export default function GoogleLoginButton({ onError, disabled, onBlockedClick }: GoogleLoginButtonProps) {
  const navigate = useNavigate();
  const { containerRef, width } = useGoogleButtonWidth();

  return (
    <div
      ref={containerRef}
      className="relative mt-3 flex w-full min-w-0 justify-center overflow-hidden"
      onClickCapture={(e) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
          onBlockedClick?.();
        }
      }}
    >
      {disabled && (
        // Google renderiza su botón dentro de un iframe propio; para poder
        // bloquear el click y mostrar el aviso de "acepta los términos"
        // se superpone una capa transparente en vez de depender de `disabled`.
        <div
          className="absolute inset-0 z-10 cursor-not-allowed rounded-full"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBlockedClick?.();
          }}
        />
      )}
      <div
        className={disabled ? 'pointer-events-none opacity-50 grayscale' : ''}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            if (!credentialResponse.credential) {
              onError('No se pudo obtener las credenciales de Google.');
              return;
            }

            const decodedToken = parseJwt(credentialResponse.credential);
            const googleEmail = decodedToken?.email;

            if (googleEmail) {
              localStorage.setItem('userEmail', googleEmail);
            }

            const data = await authService.googleLogin(credentialResponse.credential, true);

            // RF-AUTH-9: la cuenta tiene segundo factor, falta el código del correo.
            if (data.twoFactorRequired && data.challengeId) {
              twoFactorChallenge.start({ challengeId: data.challengeId, email: data.email ?? googleEmail ?? '' });
              navigate('/verify-2fa');
              return;
            }

            if (!data.accessToken) {
              onError('El servidor no devolvió un token de acceso válido.');
              return;
            }

            authStore.setTokens(data.accessToken, data.refreshToken);
            
            if (data.email) {
              localStorage.setItem('userEmail', data.email);
            }

            navigate('/select-role');
          } catch (err: unknown) {
            console.error("Error atrapado en Google Login:", err);
            if (axios.isAxiosError(err)) {
              const errorData = err.response?.data as { error?: string; message?: string };
              onError(errorData?.message || errorData?.error || 'Error al autenticar con Google en el servidor.');
            } else {
              onError('Ocurrió un error inesperado al conectar con Google.');
            }
          }
        }}
        onError={() => {
          onError('Error al autenticar con Google. Por favor, inténtalo de nuevo.');
        }}
        theme="filled_black"
        shape="pill"
        size="large"
        width={width}
        />
      </div>
    </div>
  );
}