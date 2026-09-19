import AuthLayout from '../layouts/AuthLayout';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout title="Únete a TaskIt" subtitle="Crea tu cuenta profesional hoy">
      <RegisterForm />
    </AuthLayout>
  );
}