import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout title="Iniciar Sesión" subtitle="Accede a tu cuenta profesional">
      <LoginForm />
    </AuthLayout>
  );
}