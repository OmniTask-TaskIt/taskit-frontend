// Superficie pública del módulo de autenticación: solo lo que otros
// módulos (App.tsx, rutas) necesitan importar desde afuera.
export { default as LoginPage } from './pages/LoginPage';
export { default as RegisterPage } from './pages/RegisterPage';
export { default as OtpVerificationPage } from './pages/OtpVerificationPage';
export { default as SelectRolePage } from './pages/SelectRolePage';
export { default as TermsPage } from './pages/TermsPage';
export { default as GithubCallbackPage } from './pages/GithubCallbackPage';
export { authService } from './services/authService';
