import { Routes, Route, Navigate } from 'react-router-dom';
import {
  LoginPage,
  RegisterPage,
  OtpVerificationPage,
  SelectRolePage,
  TermsPage,
  GithubCallbackPage,
  DashboardPage,
  AdminPage,
  ProtectedRoute,
  AdminRoute,
} from './modules/authentication';

function App() {
  return (
    <main className="min-h-screen w-full bg-[#0B132B]">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/auth/github/callback" element={<GithubCallbackPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/select-role" element={<SelectRolePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
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