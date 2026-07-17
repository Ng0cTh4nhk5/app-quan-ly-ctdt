// src/app/Router.tsx
// Task 1.5.3: routing dựa trên URL + route guards theo role (Task 1.4.5)
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import { Role, homePathForRoles } from '../constants/roles';

// Pages (tạm dùng file cũ, rename dần)
import LoginPage from '../LoginPage';
import AdminPage from '../Adminpage';
import ManagerPage from '../ManagerPage';
import ChangePasswordFirstLogin from '../ChangePasswordFirstLogin';

// ── Route guard ──────────────────────────────────────────────────
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: Role[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Bắt buộc đổi mật khẩu lần đầu trước khi vào hệ thống
  if (user?.isFirstLogin) return <Navigate to="/change-password" replace />;

  if (allowedRoles && user) {
    const hasRole = user.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole) return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// ── Wrapper: các page cũ vẫn nhận props user/onLogout ────────────
const AdminRoute = () => {
  const { user, logout } = useAuthStore();
  return <AdminPage user={user} onLogout={logout} />;
};

const SyllabusRoute = () => {
  const { user, logout } = useAuthStore();
  return <ManagerPage user={user} onLogout={logout} />;
};

const ChangePasswordRoute = () => {
  const { user, isAuthenticated, completeFirstLogin, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  return (
    <ChangePasswordFirstLogin
      user={user}
      onDone={() => {
        completeFirstLogin();
        navigate(homePathForRoles(user.roles), { replace: true });
      }}
      onCancel={() => {
        logout();
        navigate('/login', { replace: true });
      }}
    />
  );
};

// ── Redirect gốc theo trạng thái đăng nhập ───────────────────────
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.isFirstLogin) return <Navigate to="/change-password" replace />;
  return <Navigate to={homePathForRoles(user.roles)} replace />;
};

const UnauthorizedPage = () => (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
    <h1 style={{ fontSize: 48, color: '#005AE0' }}>403</h1>
    <p>Bạn không có quyền truy cập trang này.</p>
    <a href="/">Về trang chủ</a>
  </div>
);

const NotFoundPage = () => (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
    <h1 style={{ fontSize: 48, color: '#005AE0' }}>404</h1>
    <p>Trang không tồn tại.</p>
    <a href="/">Về trang chủ</a>
  </div>
);

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Đổi mật khẩu lần đầu (cần đăng nhập) */}
      <Route path="/change-password" element={<ChangePasswordRoute />} />

      {/* Protected: PM only */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[Role.PM]}>
            <AdminRoute />
          </ProtectedRoute>
        }
      />

      {/* Protected: TK, GV */}
      <Route
        path="/syllabus/*"
        element={
          <ProtectedRoute allowedRoles={[Role.TK, Role.GV]}>
            <SyllabusRoute />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);
