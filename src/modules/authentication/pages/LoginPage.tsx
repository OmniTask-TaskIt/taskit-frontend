import AuthLayout from '../../../shared/layouts/AuthLayout';
import LoginForm from '../Components/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout title="Iniciar Sesión" subtitle="Accede a tu cuenta profesional">
      <LoginForm />
    </AuthLayout>
  );
}