import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import SelectRolePage from './pages/SelectRolePage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <main className="min-h-screen w-full bg-[#0B132B]">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/select-role" element={<SelectRolePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </main>
  );
}

export default App;