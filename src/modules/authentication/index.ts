// Superficie pública del módulo authentication (auth + perfiles + admin del backend AuthAndProfiles),
// reseñas, reportes y panel de administración). Es lo único que el resto de
// la app (App.tsx, main.tsx, otros módulos) debería importar desde afuera.

// Páginas
export { default as LoginPage } from './pages/LoginPage';
export { default as RegisterPage } from './pages/RegisterPage';
export { default as OtpVerificationPage } from './pages/OtpVerificationPage';
export { default as SelectRolePage } from './pages/SelectRolePage';
export { default as TermsPage } from './pages/TermsPage';
export { default as GithubCallbackPage } from './pages/GithubCallbackPage';
export { default as DashboardPage } from './pages/DashboardPage';
export { default as AdminPage } from './pages/AdminPage';

// Guardas de ruta
export { default as ProtectedRoute } from './Components/auth/ProtectedRoute';
export { default as AdminRoute } from './Components/auth/AdminRoute';

// Servicios y configuración
export { authService } from './services/authService';
export { profileService } from './services/profileService';
export { reviewService } from './services/reviewService';
export { adminService } from './services/adminService';
export { authStore } from './services/authStore';
export { env } from './Config/env';

// Tipos
export type * from './types/auth.types';
export type * from './types/profile.types';
export type * from './types/admin.types';
