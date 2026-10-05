import { Navigate, Outlet } from 'react-router-dom';
import { authStore } from '../../services/authStore';

export default function ProtectedRoute() {
  const isAuth = authStore.isAuthenticated();

  if (!isAuth) {
    authStore.clearSession();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}