import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { env } from './shared/Config/env';
import { AccessibilityProvider } from './shared/accessibility/AccessibilityProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <GoogleOAuthProvider clientId={env.googleClientId}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </AccessibilityProvider>
  </React.StrictMode>
);

// Registro del Service Worker para instalar TaskIt como app en el celular.
// Se hace después del primer render y solo en producción/HTTPS para no
// interferir con el hot-reload de `vite dev`.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[TaskIt] No se pudo registrar el Service Worker:', err);
    });
  });
}
