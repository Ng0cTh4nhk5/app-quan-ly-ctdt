// Adminquanlytaikhoan.jsx
// GET    /api/Accounts/get-list?page=&limit=&search=&status=
// POST   /api/Accounts/create-accounts
// PUT    /api/Accounts/update-account/{id}
// DELETE /api/Accounts/delete-account/{id}
import { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';
import { apiGetAccounts, apiCreateAccount, apiUpdateAccount, apiDeleteAccount, apiGetKhoaList, apiGetProgramsList } from "./services/accountService";

const statusColor = {
  "Hoạt động": { bg: "#D1FAE5", color: "#065F46" },
  "Không có":  { bg: "#E5E7EB", color: "#374151" },
  "Đã thu hồi":{ bg: "#FEF3C7", color: "#92400E" },
};

// emptyForm khớp với AccountDTOs của backend
const emptyForm = {
  username: "", email: "", fullName: "",
  khoa: "", trinhDoChuyenMon: "Đại học",
  programs: "", hocHam: "", hocVi: "", roleId: 2,
};

const inputStyle = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #D1D5DB",
  borderRadius: 8, fontSize: 14, outline: "none", color: "#374151",
  background: "#fff", height: 44,
};

// ── Sub-components ────────────────────────────────────────────────

function ConfirmDeleteModal({ username, onClose, onConfirm }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 420, maxWidth: "92vw", boxShadow: "0 8px 40px rgba(0,0,0,0.22)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(90deg,#005AE0,#00317A)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>Xóa tài khoản</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#fff" }}>×</button>
        </div>
        <div style={{ padding: "28px 24px 24px" }}>
          <p style={{ fontSize: 14, color: "#374151", marginBottom: 28 }}>
            Bạn muốn xóa tài khoản <strong>{username}</strong>?
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button onClick={onClose} style={{ padding: "8px 28px", border: "1.5px solid #D1D5DB", borderRadius: 8, background: "#fff", fontSize: 14, cursor: "pointer", color: "#374151" }}>Hủy</button>
            <button onClick={onConfirm} style={{ padding: "8px 28px", border: "none", borderRadius: 8, background: "linear-gradient(90deg,#005AE0,#00317A)", color: "#fff", fontSize: 14, cursor: "pointer" }}>Đồng ý</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultToast({ type, title, message, errorMessage, onClose, onSendEmail, emailData }) {
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 400, width: 340, borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}>
      <div style={{ background: "linear-gradient(90deg,#005AE0,#00317A)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>×</button>
      </div>
      <div style={{ background: "#fff", padding: "18px 18px 16px" }}>
        {type === "success" ? (
          <>
            <p style={{ fontSize: 14, color: "#374151", marginBottom: 16 }}>{message}</p>
            {onSendEmail && emailData && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => onSendEmail(emailData)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1.5px solid #D1D5DB", borderRadius: 8, padding: "8px 20px", fontSize: 13, cursor: "pointer", color: "#374151" }}>
                  ✉️ Gửi email
                </button>
              </div>
            )}
          </>
        ) : (
          <p style={{ fontSize: 14, color: "#EF4444" }}>Lỗi: {errorMessage}</p>
        )}
      </div>
    </div>
  );
}

// Modal thêm / sửa tài khoản
function Modal({ title, form, setForm, onClose, onSubmit, submitLabel, isSubmitting, khoaList = [], programsList = [] }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 640, maxWidth: "92vw", padding: "28px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.22)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: "#111827" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6B7280" }}>×</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", marginBottom: 26 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Tên đăng nhập</label>
            <input style={inputStyle} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="VD: ql.nguyenvana" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Khoa</label>
            <div style={{ position: "relative" }}>
              <select style={{ ...inputStyle, appearance: "none", paddingRight: 28 }}
                value={form.khoa}
                onChange={e => setForm({ ...form, khoa: e.target.value })}>
                <option value="">-- Chọn khoa --</option>
                {khoaList.map(k => (
                  <option key={k.maKhoa} value={k.maKhoa}>{k.maKhoa} – {k.tenKhoa}</option>
                ))}
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 11, color: "#9CA3AF" }}>▼</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Email</label>
            <input style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="VD: nguyenvana@uni.edu.vn" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Họ tên người dùng</label>
            <input style={inputStyle} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="VD: Nguyễn Văn A" />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "8px 24px", border: "1.5px solid #D1D5DB", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>Hủy</button>
          <button onClick={onSubmit} disabled={isSubmitting} style={{ padding: "8px 24px", border: "none", borderRadius: 8, background: isSubmitting ? "#9CA3AF" : "linear-gradient(90deg,#005AE0,#00317A)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer" }}>
            {isSubmitting ? "Đang xử lý..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

export default function Adminquanlytaikhoan({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Trạng thái");
  const [tableLoading, setTableLoading] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("Tài khoản");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [addForm, setAddForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [khoaList, setKhoaList] = useState([]);
  const [programsList, setProgramsList] = useState([]);

  useEffect(() => {
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
    // Load khoa và chương trình đào tạo cho combo box
    apiGetKhoaList().then(({ ok, data }) => {
      if (ok) {
        const list = Array.isArray(data) ? data : (data?.data || []);
        setKhoaList(list);
      }
    });
    apiGetProgramsList().then(({ ok, data }) => {
      if (ok) {
        const list = Array.isArray(data) ? data : (data?.data || []);
        setProgramsList(list);
      }
    });
  }, []);

  // Load danh sách tài khoản từ API
  const loadUsers = async () => {
    setTableLoading(true);
    const status = statusFilter === "Trạng thái" ? "" : statusFilter;
    const { ok, data } = await apiGetAccounts({ page, limit, search, status });
    setTableLoading(false);

    if (!ok) {
      showToast("error", "Lỗi", null, data?.message || "Không tải được danh sách!");
      return;
    }

    // Backend có thể trả: { data: [...], total: N } hoặc [...] thẳng
    const list = Array.isArray(data) ? data : (data?.data || data?.items || []);
    const total = data?.total || data?.totalCount || list.length;

    // Map field backend → field UI
    // FIX: lưu thêm programId (ID thực) để dùng khi gửi PUT update
    setUsers(list.map(u => ({
      id: u.id,
      username: u.tenDangNhap || u.username || "",
      email: u.email || "",
      name: u.hoTenNguoiDung || u.fullName || "",
      status: u.status || u.trangThai || "Không có",
      khoa: u.maKhoa || u.khoa || "",
      program: u.chuongTrinhDaoTao?.tenCTDT || u.programs || "---",
      programId: u.chuongTrinhDaoTao?.id || u.programsId || u.programs || "", // ← FIX: lưu ID
      hocHam: u.hocHam || "",
      hocVi: u.hocVi || "",
      trinhDoChuyenMon: u.trinhDoChuyenMon || "",
    })));
    setTotalCount(total);
  };

  // Load lại khi page, statusFilter thay đổi
  useEffect(() => {
    loadUsers();
  }, [page, statusFilter]);

  // Debounce search 500ms
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); loadUsers(); }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const showToast = (type, title, emailData = null, errorMessage = "", message = "") => {
    setToast({ type, title, emailData, errorMessage, message });
    setTimeout(() => setToast(null), type === "success" && emailData ? 8000 : 4000);
  };

  // ── CRUD ──

  const handleCreate = async () => {
    if (!addForm.username || !addForm.email || !addForm.fullName) {
      showToast("error", "Thất bại", null, "Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setIsSubmitting(true);

    const payload = {
      username: addForm.username,
      email: addForm.email,
      fullName: addForm.fullName,
      roleId: addForm.roleId || 2,
      khoa: addForm.khoa,
      programs: addForm.programs,
      hocHam: addForm.hocHam,
      hocVi: addForm.hocVi,
      trinhDoChuyenMon: addForm.trinhDoChuyenMon,
    };

    const { ok, data } = await apiCreateAccount(payload);
    setIsSubmitting(false);

    if (!ok) {
      showToast("error", "Thất bại", null, data?.message || "Tạo tài khoản thất bại!");
      return;
    }

    setShowAddModal(false);
    setAddForm(emptyForm);
    await loadUsers();

    showToast(
      "success", "Thành công",
      { username: addForm.username, email: addForm.email, name: addForm.fullName, password: "123456", khoa: addForm.khoa, program: addForm.programs },
      "",
      `Tài khoản ${addForm.username} đã được tạo thành công!`
    );
  };

  // FIX: dùng u.programId (ID thực) thay vì u.program (tên hiển thị)
  const handleEdit = (u) => {
    setEditUser(u);
    setEditForm({
      username: u.username,
      email: u.email,
      fullName: u.name,
      khoa: u.khoa || "",
      trinhDoChuyenMon: u.trinhDoChuyenMon || "Đại học",
      programs: u.programId || "",   // ← FIX: dùng programId thay vì program
      hocHam: u.hocHam || "",
      hocVi: u.hocVi || "",
      roleId: 2,
    });
  };

  const handleSave = async () => {
    if (!editForm.username || !editForm.email || !editForm.fullName) {
      showToast("error", "Thất bại", null, "Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setIsSubmitting(true);

    // FIX: programsId nhận đúng ID (editForm.programs đã là ID sau fix handleEdit)
    const payload = {
      username: editForm.username,
      email: editForm.email,
      fullName: editForm.fullName,
      khoa: editForm.khoa,
      programsId: editForm.programs,   // ← đúng: gửi ID lên backend
      hocHam: editForm.hocHam,
      hocVi: editForm.hocVi,
      trinhDoChuyenMon: editForm.trinhDoChuyenMon,
    };

    const { ok, data } = await apiUpdateAccount(editUser.id, payload);
    setIsSubmitting(false);

    if (!ok) {
      showToast("error", "Thất bại", null, data?.message || "Cập nhật thất bại!");
      return;
    }

    setEditUser(null);
    await loadUsers();
    showToast("success", "Thành công", null, "", `Tài khoản ${editForm.username} đã được cập nhật!`);
  };

  const handleDeleteClick = (u) => setDeleteConfirm(u);

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const { ok, data } = await apiDeleteAccount(deleteConfirm.id);
    setDeleteConfirm(null);

    if (!ok) {
      showToast("error", "Thất bại", null, data?.message || "Xóa thất bại!");
      return;
    }

    await loadUsers();
    showToast("success", "Thành công", null, "", `Tài khoản ${deleteConfirm.username} đã được xóa!`);
  };

  // ── Email ──

  const sendEmailToUser = async (userData) => {
    setEmailSending(true);
    try {
      await emailjs.send(import.meta.env.VITE_EMAILJS_SERVICE_ID, import.meta.env.VITE_EMAILJS_TEMPLATE_ID, {
        to_email: userData.email,
        to_name: userData.name,
        username: userData.username,
        password: userData.password || "abc123",
        khoa: userData.khoa || "Chưa cập nhật",
        program: userData.program || "Chưa cập nhật",
        login_link: `${window.location.origin}/login`,
        year: new Date().getFullYear(),
      });
      alert("✅ Gửi email thành công!");
    } catch (err) {
      alert(`❌ Gửi email thất bại!\n${err.text || err.message}`);
    }
    setEmailSending(false);
  };

  const handleSendEmailOnCreate = async (emailData) => {
    if (emailData) await sendEmailToUser(emailData);
    setToast(null);
  };

  const handleSendSingleEmail = async (u) => {
    await sendEmailToUser({ email: u.email, name: u.name, username: u.username, password: "abc123", khoa: u.khoa, program: u.program });
  };

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const displayName = user?.name || user?.username || "Admin";
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
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: 14 }}>🔍</span>
              <input placeholder="Tìm kiếm" style={{ paddingLeft: 36, paddingRight: 12, height: 36, border: "1.5px solid #E5E7EB", borderRadius: 20, fontSize: 14, outline: "none", width: 220, background: "#F9FAFB" }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setShowDropdown(!showDropdown)}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#005AE0,#00317A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>{userInitial}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{displayName}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>Admin</div>
                </div>
                <span style={{ fontSize: 11, color: "#6B7280" }}>▼</span>
              </div>
              {showDropdown && (
                <div style={{ position: "absolute", right: 0, top: 48, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: 140 }}>
                  <div style={{ padding: "10px 16px", cursor: "pointer", fontSize: 14, color: "#374151" }} onClick={() => { setShowDropdown(false); onLogout && onLogout(); }}>→ Đăng xuất</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navbar */}
        <div style={{ flexShrink: 0, background: "linear-gradient(90deg,#005AE0,#00317A)", padding: "0 24px", display: "flex", justifyContent: "center", gap: 4 }}>
          {["Trang chủ", "Tài khoản"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "14px 32px", border: "none", background: activeTab === tab ? "linear-gradient(90deg,#005AE0,#00317A)" : "transparent", color: "#fff", fontWeight: activeTab === tab ? 700 : 400, fontSize: 15, cursor: "pointer", borderRadius: activeTab === tab ? "6px 6px 0 0" : 0, boxShadow: activeTab === tab ? "inset 0 0 0 1.5px rgba(255,255,255,0.25)" : "none", transition: "all 0.2s", fontFamily: "inherit" }}>{tab}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
            <span style={{ cursor: "pointer", color: "#005AE0" }}>Trang chủ</span> › Danh sách tài khoản quản lý
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,90,224,0.07)", maxWidth: 1200, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 64px - 52px - 48px - 48px)" }}>
            {/* Toolbar */}
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 18 }}>Tài khoản quản lý</span>
                <span style={{ background: "#EFF6FF", color: "#005AE0", borderRadius: 20, padding: "2px 12px", fontSize: 12, fontWeight: 600 }}>{totalCount} tài khoản</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ position: "relative" }}>
                  <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    style={{ appearance: "none", padding: "8px 32px 8px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, background: "#fff", cursor: "pointer" }}>
                    <option value="Trạng thái">Trạng thái</option>
                    <option>Hoạt động</option>
                    <option>Không có</option>
                    <option>Đã thu hồi</option>
                  </select>
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 11 }}>▼</span>
                </div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: 14 }}>🔍</span>
                  <input placeholder="Tìm kiếm" value={search} onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: 32, paddingRight: 12, height: 36, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", width: 180 }} />
                </div>
                <button onClick={() => setShowAddModal(true)} style={{ background: "linear-gradient(90deg,#005AE0,#00317A)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>+ Thêm tài khoản</button>
              </div>
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
              {tableLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                  <div style={{ width: 36, height: 36, border: "3px solid #005AE0", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                  <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                    <tr style={{ borderBottom: "2px solid #F3F4F6" }}>
                      {["#", "Tên đăng nhập", "Email", "Họ tên", "Trạng thái", "Khoa", "Chương trình", "Hành động"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#6B7280", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 14 }}>Không có dữ liệu</td></tr>
                    ) : users.map((u, idx) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid #F3F4F6", height: 62 }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F0F7FF"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "0 12px", fontSize: 13, color: "#9CA3AF" }}>{(page - 1) * limit + idx + 1}</td>
                        <td style={{ padding: "0 12px", fontSize: 14, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>{u.username}</td>
                        <td style={{ padding: "0 12px", fontSize: 13, color: "#6B7280", whiteSpace: "nowrap" }}>{u.email}</td>
                        <td style={{ padding: "0 12px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{u.name}</td>
                        <td style={{ padding: "0 12px", whiteSpace: "nowrap" }}>
                          <span style={{ background: statusColor[u.status]?.bg || "#E5E7EB", color: statusColor[u.status]?.color || "#374151", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600, display: "inline-block" }}>{u.status}</span>
                        </td>
                        <td style={{ padding: "0 12px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{u.khoa || "---"}</td>
                        <td style={{ padding: "0 12px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{u.program}</td>
                        <td style={{ padding: "0 12px", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            {/* Sửa */}
                            <button title="Sửa" onClick={() => handleEdit(u)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            {/* Xóa */}
                            <button title="Xóa" onClick={() => handleDeleteClick(u)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                              </svg>
                            </button>
                            {/* Gửi email */}
                            <button title="Gửi email" onClick={() => handleSendSingleEmail(u)} disabled={emailSending} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: emailSending ? 0.5 : 1 }}>
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                <polyline points="2,4 12,13 22,4"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>Hiển thị {users.length} trên {totalCount} kết quả</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ border: "1px solid #E5E7EB", background: "#fff", borderRadius: 6, width: 30, height: 30, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ border: p === page ? "none" : "1px solid #E5E7EB", background: p === page ? "linear-gradient(90deg,#005AE0,#00317A)" : "#fff", color: p === page ? "#fff" : "#374151", borderRadius: 6, width: 30, height: 30, cursor: "pointer", fontWeight: p === page ? 700 : 400 }}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ border: "1px solid #E5E7EB", background: "#fff", borderRadius: 6, width: 30, height: 30, cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1 }}>›</button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showAddModal && (
          <Modal title="Thêm tài khoản Quản lý" form={addForm} setForm={setAddForm}
            onClose={() => { setShowAddModal(false); setAddForm(emptyForm); }}
            onSubmit={handleCreate} submitLabel="Tạo" isSubmitting={isSubmitting}
            khoaList={khoaList} programsList={programsList} />
        )}
        {editUser && (
          <Modal title="Chỉnh sửa tài khoản Quản lý" form={editForm} setForm={setEditForm}
            onClose={() => setEditUser(null)}
            onSubmit={handleSave} submitLabel="Lưu" isSubmitting={isSubmitting}
            khoaList={khoaList} programsList={programsList} />
        )}
        {deleteConfirm && (
          <ConfirmDeleteModal username={deleteConfirm.username} onClose={() => setDeleteConfirm(null)} onConfirm={handleDeleteConfirm} />
        )}
        {toast && (
          <ResultToast type={toast.type} title={toast.title} message={toast.message}
            errorMessage={toast.errorMessage} onClose={() => setToast(null)}
            onSendEmail={toast.emailData ? handleSendEmailOnCreate : null}
            emailData={toast.emailData} />
        )}
      </div>
    </>
  );
}