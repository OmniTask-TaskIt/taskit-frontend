import AuthLayout from '../../../shared/layouts/AuthLayout';
import RegisterForm from '../Components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout title="Únete a TaskIt" subtitle="Crea tu cuenta profesional hoy">
      <RegisterForm />
    </AuthLayout>
  );
}