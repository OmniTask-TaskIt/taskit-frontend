import AuthLayout from '../Components/ui/AuthLayout';
import LoginForm from '../Components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout title="Iniciar Sesión" subtitle="Accede a tu cuenta profesional">
      <LoginForm />
    </AuthLayout>
  );
}