import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { authStore } from '../../store/authStore';
import axios from 'axios';

interface GoogleLoginButtonProps {
  onError: (msg: string) => void;
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

export default function GoogleLoginButton({ onError }: GoogleLoginButtonProps) {
  const navigate = useNavigate();

  return (
    <div 
      className="w-full flex justify-center mt-3"
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

            const data = await authService.googleLogin(credentialResponse.credential);
            
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
        width="380"
      />
    </div>
  );
}