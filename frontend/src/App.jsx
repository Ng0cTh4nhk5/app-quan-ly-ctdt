// App.jsx
import { useState, useEffect } from 'react';
import Adminquanlytaikhoan from './Adminpage';
import ManagerPage from './ManagerPage';
import LoginPage from './LoginPage';
import ChangePasswordFirstLogin from './ChangePasswordFirstLogin';
import { apiLogin } from './api';

// roleId 1 = Root Admin, roleId 2 = Manager (Quản lý), roleId 3 = Biên soạn
// Backend trả role string: "ADMIN" hoặc roleId number
const resolveRole = (data) => {
  const roleStr  = data?.user?.role  ?? '';
  const roleId   = data?.user?.roleId ?? data?.user?.role_id ?? 0;
  if (roleStr === 'ADMIN' || roleId === 1) return 'ADMIN';
  if (roleStr === 'MANAGER' || roleId === 2) return 'MANAGER';
  if (roleStr === 'COMPILER' || roleId === 3) return 'COMPILER';
  // fallback: nếu không rõ nhưng có token → mặc định MANAGER
  return 'MANAGER';
};

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      if (user.isFirstLogin) {
        setCurrentPage('changePassword');
      } else {
        setCurrentPage(getPageForRole(user.role));
      }
    }
    setIsLoading(false);
  }, []);

  const getPageForRole = (role) => {
    if (role === 'ADMIN')    return 'admin';
    if (role === 'MANAGER')  return 'manager';
    if (role === 'COMPILER') return 'manager'; // biên soạn cũng vào manager layout
    return 'manager';
  };

  const handleLogin = async (username, password) => {
    const { ok, data } = await apiLogin(username, password);

    if (!ok) {
      const msg = data?.message || data?.title || 'Tên đăng nhập hoặc mật khẩu không đúng!';
      return { success: false, message: msg };
    }

    const token = data?.token;
    if (!token) {
      return { success: false, message: 'Không nhận được token từ server!' };
    }

    sessionStorage.setItem('token', token);

    const role = resolveRole(data);

    const userSession = {
      username:     username,
      name:         data?.user?.name     || data?.user?.fullName || username,
      role,
      roleId:       data?.user?.roleId   || data?.user?.role_id  || 0,
      email:        data?.user?.email    || '',
      isFirstLogin: data?.user?.isFirstLogin ?? false,
    };

    sessionStorage.setItem('currentUser', JSON.stringify(userSession));
    setCurrentUser(userSession);

    if (userSession.isFirstLogin) {
      setCurrentPage('changePassword');
    } else {
      setCurrentPage(getPageForRole(role));
    }

    return { success: true };
  };

  const handleChangePasswordDone = () => {
    if (currentUser) {
      const updatedUser = { ...currentUser, isFirstLogin: false };
      sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setCurrentPage(getPageForRole(updatedUser.role));
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('token');
    setCurrentUser(null);
    setCurrentPage('login');
  };

  if (isLoading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#CFE5F9',
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #005AE0',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#374151' }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  switch (currentPage) {
    case 'login':
      return <LoginPage onLogin={handleLogin} />;

    case 'changePassword':
      return (
        <ChangePasswordFirstLogin
          user={currentUser}
          onDone={handleChangePasswordDone}
          onCancel={handleLogout}
        />
      );

    case 'admin':
      return <Adminquanlytaikhoan user={currentUser} onLogout={handleLogout} />;

    case 'manager':
      return <ManagerPage user={currentUser} onLogout={handleLogout} />;

    default:
      return <LoginPage onLogin={handleLogin} />;
  }
}

export default App;