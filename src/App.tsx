import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import PaymentCallbackPage from './pages/PaymentCallbackPage';
import PaymentPushToast from './components/payments/PaymentPushToast';
import {
  LoginPage,
  RegisterPage,
  OtpVerificationPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  PublicProfilePage,
  SelectRolePage,
  TermsPage,
  GithubCallbackPage,
  DashboardPage,
  AdminPage,
  TwoFactorLoginPage,
  ProtectedRoute,
  AdminRoute,
} from './modules/authentication';

function TaskShortcut() {
  const { taskId } = useParams();
  const target = taskId ? `/dashboard?section=tasks&taskId=${encodeURIComponent(taskId)}` : '/dashboard?section=tasks';
  return <Navigate to={target} replace />;
}

function App() {
  return (
    <main className="min-h-screen w-full bg-[#eef2fb]">
      <PaymentPushToast />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />
        <Route path="/verify-2fa" element={<TwoFactorLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/auth/github/callback" element={<GithubCallbackPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/select-role" element={<SelectRolePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile/:userId" element={<PublicProfilePage />} />
          <Route path="/payments/callback" element={<PaymentCallbackPage />} />
          <Route path="/tasks/:taskId" element={<TaskShortcut />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </main>
  );
}

export default App;