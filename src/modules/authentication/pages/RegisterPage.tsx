import AuthLayout from '../Components/ui/AuthLayout';
import RegisterForm from '../Components/register/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout title="Únete a TaskIt" subtitle="Crea tu cuenta profesional hoy">
      <RegisterForm />
    </AuthLayout>
  );
}