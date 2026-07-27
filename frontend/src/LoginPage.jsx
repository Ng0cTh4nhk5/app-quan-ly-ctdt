// LoginPage.jsx
// Giao diện scene gốc (khung cảnh xanh + hình trang trí trôi nổi).
// Task 1.5.4: form controls dùng Ant Design (Form/Input/Button) — theme dark cục bộ cho khớp card.
// Task 1.5.1: mọi API call qua axiosInstance (VITE_API_URL), không còn fetch/hardcoded URL.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfigProvider, Form, Input, Button, theme as antdTheme } from 'antd';
import { useAuthStore } from './features/auth/store/authStore';
import { homePathForRoles } from './constants/roles';
import { apiForgotPassword } from './services/authService';

function ArcLogo() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="22" stroke="url(#g1)" strokeWidth="4.5" fill="none"
        strokeDasharray="80 60" strokeLinecap="round" />
      <path d="M9 26 Q16 8 36 16" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round" fill="none" />
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="52" y2="52">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BoltSVG({ size = 38, opacity = 1 }) {
  return (
    <svg width={size} height={size * 1.35} viewBox="0 0 38 52" fill="none" style={{ opacity }}>
      <defs>
        <linearGradient id="boltG" x1="0" y1="0" x2="38" y2="52">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M26 3L8 30h14L16 49l22-30H24L30 3z"
        fill="url(#boltG)" style={{ filter: "drop-shadow(0 2px 8px #1d4ed870)" }} />
    </svg>
  );
}

function WaveSVG({ width = 100, color = "#60a5fa", opacity = 0.5 }) {
  return (
    <svg width={width} height={width * 0.28} viewBox="0 0 100 28" fill="none" style={{ opacity }}>
      <path d="M2 14 Q16 4 30 14 Q44 24 58 14 Q72 4 86 14 Q93 19 98 15"
        stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function CurlSVG({ width = 120, color = "#60a5fa", opacity = 0.2 }) {
  return (
    <svg width={width} height={width * 0.65} viewBox="0 0 120 78" fill="none" style={{ opacity }}>
      <path d="M14 65 Q40 12 82 38 Q106 54 96 18"
        stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const Shapes = () => (
  <>
    <div className="shape f3" style={{ top: "10%", left: "50%", transform: "translateX(-50%)" }}><ArcLogo /></div>
    <div className="shape f1" style={{ top: "37%", left: "28%" }}><BoltSVG size={34} opacity={0.88} /></div>
    <div className="shape f2" style={{ top: "51%", left: "25.5%" }}><BoltSVG size={26} opacity={0.72} /></div>
    <div className="shape f4" style={{ top: "32%", right: "10%" }}><WaveSVG width={90} color="#93c5fd" opacity={0.42} /></div>
    <div className="shape f2" style={{ bottom: "23%", left: "50%", transform: "translateX(-50%)" }}><WaveSVG width={78} color="#93c5fd" opacity={0.48} /></div>
    <div className="shape f3" style={{ bottom: "13%", right: "4%" }}><WaveSVG width={140} color="#60a5fa" opacity={0.28} /></div>
    <div className="shape f5" style={{ bottom: "7%", right: "16%" }}><WaveSVG width={80} color="#93c5fd" opacity={0.2} /></div>
    <div className="shape f4" style={{ bottom: "5%", left: "2%" }}><CurlSVG width={210} color="#60a5fa" opacity={0.14} /></div>
    <div className="shape f5" style={{ top: "22%", left: "7%" }}><CurlSVG width={140} color="#93c5fd" opacity={0.1} /></div>
  </>
);

// Theme antd cục bộ: dark + translucent để khớp card trong scene xanh
const sceneTheme = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: '#60a5fa',
    colorBgContainer: 'rgba(255,255,255,0.08)',
    colorBorder: 'rgba(147,197,253,0.25)',
    colorText: '#e0eaff',
    colorTextPlaceholder: 'rgba(147,197,253,0.45)',
    borderRadius: 7,
    fontFamily: "'Sora', sans-serif",
    fontSize: 13,
  },
  components: {
    Input: { controlHeight: 34 },
    Button: { controlHeight: 34 },
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [page, setPage] = useState('login'); // "login" | "forgot"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleLogin = async ({ username, password }) => {
    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    if (result.user.isFirstLogin) {
      navigate('/change-password', { replace: true });
    } else {
      navigate(homePathForRoles(result.user.roles), { replace: true });
    }
  };

  const handleForgot = async ({ email }) => {
    setError('');
    setForgotSuccess('');
    setLoading(true);
    const { ok, data } = await apiForgotPassword(email);
    setLoading(false);

    if (ok) {
      setForgotSuccess('Đã gửi email đặt lại mật khẩu! Vui lòng kiểm tra hộp thư.');
    } else {
      setError(data?.message || 'Email không tồn tại trong hệ thống!');
    }
  };

  const switchPage = (next) => {
    setPage(next);
    setError('');
    setForgotSuccess('');
  };

  return (
    <ConfigProvider theme={sceneTheme}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #8693b5;
          font-family: 'Sora', sans-serif;
          padding: 24px;
        }

        /* Scene: giữ tỉ lệ 16/9 bằng cách dùng padding-top thay vì aspect-ratio */
        .login-scene {
          position: relative;
          width: 100%;
          max-width: 980px;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(140deg, #1a4fc4 0%, #1a3ea0 35%, #1e40af 65%, #2254cc 100%);
          box-shadow: 0 40px 100px #0a1a4a50, 0 8px 32px #1e3a8a30;
        }

        /* Dùng pseudo-element để tạo tỉ lệ 16/9 */
        .login-scene::after {
          content: '';
          display: block;
          padding-top: 56.25%; /* 9/16 = 56.25% */
        }

        .login-scene::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 50% 55%, #1d4ed828 0%, transparent 65%),
            radial-gradient(ellipse 45% 55% at 18% 55%, #1e40af44 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 82% 42%, #3b82f618 0%, transparent 55%);
          z-index: 0;
        }

        /* Tất cả nội dung bên trong scene phải nằm trong .login-content */
        .login-content {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .inner-panel {
          position: absolute;
          top: 11%; left: 9%; right: 9%; bottom: 9%;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          z-index: 0;
        }

        .page-label {
          position: absolute;
          top: 18px; left: 24px;
          font-size: 13px;
          font-weight: 400;
          color: rgba(220,235,255,0.75);
          letter-spacing: 0.02em;
          z-index: 3;
        }

        .shape { position: absolute; z-index: 1; pointer-events: none; }
        .f1 { animation: fy 5.5s ease-in-out infinite; }
        .f2 { animation: fy 6.5s ease-in-out infinite; animation-delay: -2s; }
        .f3 { animation: fy 7s ease-in-out infinite; animation-delay: -3.5s; }
        .f4 { animation: fy 8s ease-in-out infinite; animation-delay: -1s; }
        .f5 { animation: fy 9s ease-in-out infinite; animation-delay: -4s; }
        @keyframes fy { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

        /* Card nằm giữa scene */
        .login-card {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 34%;
          min-width: 240px;
          max-width: 320px;
          z-index: 2;
        }

        .card-inner { display: flex; flex-direction: column; }

        .card-title {
          font-size: 15px;
          font-weight: 700;
          color: #e0eaff;
          margin-bottom: 14px;
          letter-spacing: 0.01em;
        }

        /* ── Ant Design overrides: nén khoảng cách + style label theo design gốc ── */
        .login-card .ant-form-item { margin-bottom: 10px; }
        .login-card .ant-form-item .ant-form-item-label { padding-bottom: 4px; }
        .login-card .ant-form-item-label > label {
          font-size: 10px;
          color: #93c5fd;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          height: auto;
        }
        .login-card .ant-form-item-explain-error {
          font-size: 10px;
          color: #fca5a5;
        }
        .login-card .ant-input,
        .login-card .ant-input-affix-wrapper { font-family: 'Sora', sans-serif; }

        /* Nút chính giữ gradient của design gốc */
        .login-card .ant-btn-primary {
          background: linear-gradient(135deg, #1e3a8a, #2054d0);
          color: #dbeafe;
          font-weight: 600;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 18px #1e3a8a55;
        }
        .login-card .ant-btn-primary:not(:disabled):hover {
          background: linear-gradient(135deg, #1e3a8a, #2054d0);
          opacity: 0.9;
          transform: translateY(-1.5px);
        }

        .forgot-link {
          display: block;
          text-align: right;
          font-size: 10px;
          color: #88b4e8;
          margin-top: 2px;
          margin-bottom: 12px;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'Sora', sans-serif;
          width: 100%;
          padding: 0;
          transition: color 0.2s;
        }
        .forgot-link:hover { color: #dbeafe; }

        .back-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: #88b4e8;
          margin-bottom: 12px;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'Sora', sans-serif;
          padding: 0;
          transition: color 0.2s;
        }
        .back-link:hover { color: #dbeafe; }

        .error-message {
          font-size: 10px;
          color: #fca5a5;
          margin-bottom: 8px;
          text-align: center;
        }

        .success-message {
          font-size: 10px;
          color: #6ee7b7;
          margin-bottom: 8px;
          text-align: center;
        }
      `}</style>

      <div className="login-root">
        <div className="login-scene">
          {/* Tất cả nội dung trong login-content để nằm đúng trong scene */}
          <div className="login-content">
            <div className="inner-panel" />
            <span className="page-label">{page === 'login' ? 'Đăng nhập' : 'Quên mật khẩu'}</span>
            <Shapes />

            <div className="login-card">
              {page === 'login' ? (
                <div className="card-inner" key="login">
                  <div className="card-title">Login</div>

                  <Form onFinish={handleLogin} layout="vertical" requiredMark={false}>
                    <Form.Item
                      name="username"
                      label="Tên đăng nhập"
                      rules={[{ required: true, message: 'Nhập tên đăng nhập' }]}
                    >
                      <Input placeholder="username" autoFocus />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[{ required: true, message: 'Nhập mật khẩu' }]}
                    >
                      <Input.Password placeholder="Password" />
                    </Form.Item>

                    {error && <div className="error-message">{error}</div>}

                    <button type="button" className="forgot-link" onClick={() => switchPage('forgot')}>
                      Forgot Password?
                    </button>

                    <Button type="primary" htmlType="submit" block loading={loading}>
                      {loading ? 'Đang đăng nhập...' : 'Sign in'}
                    </Button>
                  </Form>
                </div>
              ) : (
                <div className="card-inner" key="forgot">
                  <div className="card-title">Quên mật khẩu</div>

                  <Form onFinish={handleForgot} layout="vertical" requiredMark={false}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' },
                      ]}
                    >
                      <Input placeholder="email@example.com" autoFocus />
                    </Form.Item>

                    {error && <div className="error-message">{error}</div>}
                    {forgotSuccess && <div className="success-message">{forgotSuccess}</div>}

                    <button type="button" className="back-link" onClick={() => switchPage('login')}>
                      ← Quay lại đăng nhập
                    </button>

                    <Button type="primary" htmlType="submit" block loading={loading}>
                      {loading ? 'Đang gửi...' : 'Gửi email'}
                    </Button>
                  </Form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
