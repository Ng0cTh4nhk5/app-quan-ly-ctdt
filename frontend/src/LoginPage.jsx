// LoginPage.jsx
// Swagger: POST /auth/login → { username, password }
// Lưu ý: field là "username" không phải "email"
import { useState } from "react";

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

export default function LoginPage({ onLogin }) {
  const [page, setPage] = useState("login"); // "login" | "forgot"

  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setLoginError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    setLoginError("");
    setLoading(true);

    const result = await onLogin(username, password);

    if (!result.success) {
      setLoginError(result.message);
    }
    setLoading(false);
  };

  const handleForgot = async () => {
    if (!forgotEmail) {
      setForgotError("Vui lòng nhập email!");
      return;
    }
    setForgotError("");
    setForgotLoading(true);

    try {
      const res = await fetch(
        'https://startup-backend-production-d78d.up.railway.app/auth/forgot-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail }),
        }
      );
      if (res.ok) {
        setForgotSuccess("Đã gửi email đặt lại mật khẩu! Vui lòng kiểm tra hộp thư.");
      } else {
        const data = await res.json().catch(() => ({}));
        setForgotError(data?.message || "Email không tồn tại trong hệ thống!");
      }
    } catch {
      setForgotError("Lỗi kết nối server, thử lại sau!");
    }
    setForgotLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (page === "login") handleLogin();
      else handleForgot();
    }
  };

  return (
    <>
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
          width: 30%;
          min-width: 220px;
          max-width: 300px;
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

        .field-group { margin-bottom: 9px; }

        .field-label {
          font-size: 9px;
          color: #93c5fd;
          margin-bottom: 4px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .input-wrap { position: relative; }

        .login-input {
          width: 100%;
          padding: 7px 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(147,197,253,0.25);
          border-radius: 7px;
          color: #e0eaff;
          font-size: 10px;
          font-family: 'Sora', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          /* Quan trọng: đảm bảo input không bị overflow ra ngoài card */
          box-sizing: border-box;
          display: block;
        }
        .login-input::placeholder { color: rgba(147,197,253,0.45); }
        .login-input:focus { border-color: #60a5fa; background: rgba(255,255,255,0.13); }
        .login-input.error { border-color: #f87171; }

        /* Password input cần padding-right để không bị đè bởi eye button */
        .login-input.with-eye { padding-right: 28px; }

        .eye-btn {
          position: absolute;
          right: 7px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 11px;
          padding: 0;
          line-height: 1;
          color: #93c5fd;
        }

        .forgot-link {
          display: block;
          text-align: right;
          font-size: 9px;
          color: #88b4e8;
          margin-top: -2px;
          margin-bottom: 11px;
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
          font-size: 9px;
          color: #88b4e8;
          margin-bottom: 11px;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'Sora', sans-serif;
          padding: 0;
          transition: color 0.2s;
        }
        .back-link:hover { color: #dbeafe; }

        .error-message {
          font-size: 9px;
          color: #fca5a5;
          margin-bottom: 7px;
          text-align: center;
        }

        .success-message {
          font-size: 9px;
          color: #6ee7b7;
          margin-bottom: 7px;
          text-align: center;
        }

        .main-btn {
          width: 100%;
          padding: 8px;
          background: linear-gradient(135deg, #1e3a8a, #2054d0);
          color: #dbeafe;
          border: none;
          border-radius: 7px;
          font-family: 'Sora', sans-serif;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 18px #1e3a8a55;
          transition: opacity 0.2s, transform 0.15s;
        }
        .main-btn:hover { opacity: 0.9; transform: translateY(-1.5px); }
        .main-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .spinner {
          display: inline-block;
          width: 9px; height: 9px;
          border: 2px solid #60a5fa44;
          border-top-color: #e0eaff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 4px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="login-root">
        <div className="login-scene">
          {/* Tất cả nội dung trong login-content để nằm đúng trong scene */}
          <div className="login-content">
            <div className="inner-panel" />
            <span className="page-label">{page === "login" ? "Đăng nhập" : "Quên mật khẩu"}</span>
            <Shapes />

            <div className="login-card">
              {page === "login" ? (
                <div className="card-inner" key="login">
                  <div className="card-title">Login</div>

                  <div className="field-group">
                    <div className="field-label">Tên đăng nhập</div>
                    <div className="input-wrap">
                      <input
                        className={`login-input ${loginError ? 'error' : ''}`}
                        type="text"
                        placeholder="username"
                        value={username}
                        onChange={e => { setUsername(e.target.value); setLoginError(""); }}
                        onKeyPress={handleKeyPress}
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <div className="field-label">Password</div>
                    <div className="input-wrap">
                      <input
                        className={`login-input with-eye ${loginError ? 'error' : ''}`}
                        type={showPass ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setLoginError(""); }}
                        onKeyPress={handleKeyPress}
                      />
                      <button className="eye-btn" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                        {showPass ? "🙈" : "👁"}
                      </button>
                    </div>
                  </div>

                  {loginError && <div className="error-message">{loginError}</div>}

                  <button className="forgot-link" onClick={() => { setPage("forgot"); setLoginError(""); }}>
                    Forgot Password?
                  </button>

                  <button className="main-btn" onClick={handleLogin} disabled={loading}>
                    {loading && <span className="spinner" />}
                    {loading ? "Đang đăng nhập..." : "Sign in"}
                  </button>
                </div>
              ) : (
                <div className="card-inner" key="forgot">
                  <div className="card-title">Quên mật khẩu</div>

                  <div className="field-group">
                    <div className="field-label">Email</div>
                    <div className="input-wrap">
                      <input
                        className={`login-input ${forgotError ? 'error' : ''}`}
                        type="email"
                        placeholder="email@example.com"
                        value={forgotEmail}
                        onChange={e => { setForgotEmail(e.target.value); setForgotError(""); setForgotSuccess(""); }}
                        onKeyPress={handleKeyPress}
                      />
                    </div>
                  </div>

                  {forgotError && <div className="error-message">{forgotError}</div>}
                  {forgotSuccess && <div className="success-message">{forgotSuccess}</div>}

                  <button className="back-link" onClick={() => {
                    setPage("login");
                    setForgotEmail(""); setForgotError(""); setForgotSuccess("");
                  }}>
                    ← Quay lại đăng nhập
                  </button>

                  <button className="main-btn" onClick={handleForgot} disabled={forgotLoading}>
                    {forgotLoading && <span className="spinner" />}
                    {forgotLoading ? "Đang gửi..." : "Gửi email"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}