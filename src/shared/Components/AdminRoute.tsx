import { Navigate, Outlet } from 'react-router-dom';
import { authStore } from '../store/authStore';

/**
 * Protege /admin: exige sesión válida (como ProtectedRoute) y además rol
 * ADMIN. Es solo una capa de UX (oculta el panel a quien no debería verlo);
 * la autorización real la sigue aplicando el backend en cada endpoint de
 * /api/v1/admin/** con @PreAuthorize("hasRole('ADMIN')").
 */
export default function AdminRoute() {
  const isAuth = authStore.isAuthenticated();

  if (!isAuth) {
    authStore.clearSession();
    return <Navigate to="/login" replace />;
  }

  if (!authStore.isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
