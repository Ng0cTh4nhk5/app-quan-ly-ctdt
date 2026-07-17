// ChangePasswordFirstLogin.jsx
// Swagger: POST /auth/change-password-first → { newPassword, confirmPassword }
// Cần Bearer token trong header
import { useState } from "react";
import { apiChangePasswordFirst } from "./services/authService";

const inputStyle = {
  width: "100%", padding: "10px 42px 10px 14px", border: "1.5px solid #D1D5DB",
  borderRadius: 8, fontSize: 14, outline: "none", color: "#374151",
  background: "#fff", height: 44, fontFamily: "inherit",
};

function EyeIcon({ visible }) {
  return visible ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#005AE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function ToastMessage({ type, message, onClose }) {
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 400, width: 300, borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}>
      <div style={{ background: "linear-gradient(90deg,#005AE0,#00317A)", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
          {type === "success" ? "Thành công" : "Thất bại"}
        </span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" }}>×</button>
      </div>
      <div style={{ background: "#fff", padding: "14px 16px" }}>
        <p style={{ fontSize: 13, color: type === "success" ? "#374151" : "#EF4444" }}>{message}</p>
      </div>
    </div>
  );
}

export default function ChangePasswordFirstLogin({ user, onDone, onCancel }) {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("Tài Khoản");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const showToastMsg = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    // Validate phía client trước
    if (!newPass || !confirmPass) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (newPass !== confirmPass) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (newPass.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setError("");
    setIsLoading(true);

    // Gọi POST /auth/change-password-first
    const { ok, data } = await apiChangePasswordFirst(newPass, confirmPass);

    setIsLoading(false);

    if (!ok) {
      const msg = data?.message || data?.title || "Đổi mật khẩu thất bại, thử lại!";
      setError(msg);
      showToastMsg("error", msg);
      return;
    }

    showToastMsg("success", "Đổi mật khẩu thành công! Đang chuyển hướng...");
    setTimeout(() => {
      if (onDone) onDone();
    }, 1500);
  };

  const handleCancelAction = () => {
    setNewPass(""); setConfirmPass(""); setError("");
    if (onCancel) onCancel();
  };

  const displayName = user?.name || user?.username || "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } body { background: #CFE5F9; overflow: hidden; }`}</style>
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#CFE5F9", fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ flexShrink: 0, background: "#fff", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 22, color: "#005AE0" }}>Logo</div>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input placeholder="Tìm kiếm" style={{ paddingLeft: 32, paddingRight: 12, height: 34, border: "1.5px solid #D1D5DB", borderRadius: 20, fontSize: 14, outline: "none", width: 210, background: "#fff", color: "#374151" }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setShowDropdown(!showDropdown)}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#005AE0,#00317A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15 }}>{userInitial}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2, color: "#111827" }}>{displayName}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>Admin</div>
                </div>
                <span style={{ fontSize: 10, color: "#6B7280" }}>▼</span>
              </div>
              {showDropdown && (
                <div style={{ position: "absolute", right: 0, top: 48, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 140 }}>
                  <div style={{ padding: "10px 16px", cursor: "pointer", fontSize: 14, color: "#374151" }}
                    onClick={() => { setShowDropdown(false); handleCancelAction(); }}>→ Đăng xuất</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navbar */}
        <div style={{ flexShrink: 0, background: "linear-gradient(90deg, #005AE0 0%, #00317A 100%)", display: "flex", alignItems: "stretch", padding: "0 24px", gap: 4 }}>
          {["Trang chủ", "Môn Học", "Tài Khoản"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "14px 24px", border: "none", background: activeTab === tab ? "rgba(255,255,255,0.15)" : "transparent", color: "#fff", fontWeight: activeTab === tab ? 700 : 400, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
          <div style={{ position: "absolute", top: 16, left: 24, fontSize: 12, color: "#6B7280" }}>Đổi mật khẩu lần đầu</div>

          <div style={{ background: "#fff", borderRadius: 16, padding: "40px 44px 36px", boxShadow: "0 4px 24px rgba(0,90,224,0.10)", width: "100%", maxWidth: 500 }}>
            <div style={{ fontWeight: 700, fontSize: 22, color: "#111827", marginBottom: 8 }}>
              Đổi mật khẩu khi đăng nhập lần đầu
            </div>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 8 }}>
              Xin chào <strong>{displayName}</strong>, bạn cần thay đổi mật khẩu trước khi tiếp tục sử dụng hệ thống!
            </div>
            <div style={{ fontSize: 12, color: "#005AE0", marginBottom: 20, background: "#EFF6FF", padding: "8px 12px", borderRadius: 6, border: "1px solid #BFDBFE" }}>
              💡 Mật khẩu mặc định của bạn là: <strong>Abc@123</strong>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Mật khẩu mới</label>
              <div style={{ position: "relative" }}>
                <input type={showNew ? "text" : "password"} value={newPass} placeholder="Nhập mật khẩu mới"
                  onChange={e => { setNewPass(e.target.value); setError(""); }}
                  style={{ ...inputStyle, borderColor: error ? "#EF4444" : "#D1D5DB" }} />
                <button onClick={() => setShowNew(!showNew)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                  <EyeIcon visible={showNew} />
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Xác nhận mật khẩu</label>
              <div style={{ position: "relative" }}>
                <input type={showConfirm ? "text" : "password"} value={confirmPass} placeholder="Nhập lại mật khẩu"
                  onChange={e => { setConfirmPass(e.target.value); setError(""); }}
                  style={{ ...inputStyle, borderColor: error ? "#EF4444" : "#D1D5DB" }} />
                <button onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                  <EyeIcon visible={showConfirm} />
                </button>
              </div>
            </div>

            {error && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 8 }}>{error}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28 }}>
              <button onClick={handleCancelAction} style={{ padding: "9px 28px", border: "1.5px solid #D1D5DB", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151", fontFamily: "inherit" }}>
                Hủy
              </button>
              <button onClick={handleSave} disabled={isLoading} style={{ padding: "9px 28px", border: "none", borderRadius: 8, background: isLoading ? "#9CA3AF" : "linear-gradient(90deg,#005AE0,#00317A)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? "Đang xử lý..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>

        {toast && <ToastMessage type={toast.type} message={toast.msg} onClose={() => setToast(null)} />}
      </div>
    </>
  );
}