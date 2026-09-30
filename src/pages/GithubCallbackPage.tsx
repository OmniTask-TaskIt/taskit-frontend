import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../layouts/AuthLayout';
import { authService } from '../services/authService';
import { authStore } from '../store/authStore';

/**
 * GitHub redirige aquí con ?code=... (o ?error=... si el usuario canceló).
 * Esta página solo hace el intercambio del código por sesión y navega a
 * /select-role; no tiene contenido propio que el usuario deba leer.
 */
function readCallbackParams() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const githubError = params.get('error_description') || params.get('error');

  let earlyError = '';
  if (githubError) earlyError = 'Inicio de sesión con GitHub cancelado.';
  else if (!code) earlyError = 'No se recibió el código de autorización de GitHub.';

  return { code, earlyError };
}

export default function GithubCallbackPage() {
  const navigate = useNavigate();
  const [{ code, earlyError }] = useState(readCallbackParams);
  const [asyncError, setAsyncError] = useState('');
  const error = earlyError || asyncError;
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    if (earlyError || !code) {
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    (async () => {
      try {
        const acceptedTerms = sessionStorage.getItem('githubOauthTermsAccepted') === 'true';
        sessionStorage.removeItem('githubOauthTermsAccepted');
        const data = await authService.githubLogin(code, acceptedTerms);

        if (!data.accessToken) {
          setAsyncError('El servidor no devolvió un token de acceso válido.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        authStore.setTokens(data.accessToken, data.refreshToken);
        if (data.email) {
          localStorage.setItem('userEmail', data.email);
        }

        navigate('/select-role', { replace: true });
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const errorData = err.response?.data as { error?: string; message?: string };
          setAsyncError(errorData?.message || errorData?.error || 'Error al autenticar con GitHub.');
        } else {
          setAsyncError('Ocurrió un error inesperado al conectar con GitHub.');
        }
        setTimeout(() => navigate('/login'), 2500);
      }
    })();
  }, [navigate, code, earlyError]);

  return (
    <AuthLayout title="Conectando con GitHub" subtitle={error || 'Verificando tu cuenta, un momento...'}>
      <div className="flex w-full flex-col items-center gap-3 py-4">
        {!error && (
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#263BAA]/20 border-t-[#263BAA]" />
        )}
        {error && <p className="text-center text-xs text-rose-700">Redirigiendo al inicio de sesión...</p>}
      </div>
    </AuthLayout>
  );
}
