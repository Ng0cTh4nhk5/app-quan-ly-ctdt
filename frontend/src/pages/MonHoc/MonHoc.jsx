// src/pages/MonHoc/MonHoc.jsx  –  Role: Quản lý
import { useState, useEffect, useCallback } from "react";
import Toast from "../../components/Toast";
import TaoMonHoc from "./TaoMonHoc";
import ChinhSuaMonHoc from "./ChinhSuaMonHoc";
import { getSubjects, deleteSubject } from "../../services/subjectService";
import axiosInstance from "../../services/axiosInstance";

// Normalize trạng thái phân công về 2 giá trị chuẩn
const normalizePhanCong = (raw) => {
  if (!raw) return "Chưa phân công";
  const s = String(raw).toLowerCase().trim();
  if (s === "đã phân công" || s === "da phan cong" || s === "assigned" || s === "true" || s === "1")
    return "Đã phân công";
  return "Chưa phân công";
};

// helper: map API response → shape UI dùng
const mapSubject = (s) => ({
  id: s.maMonHoc, // dùng maMonHoc làm id (string)
  ma: s.maMonHoc ?? "",
  ten: s.tenMonHoc ?? "",
  lyThuyet: s.soTinChiLyThuyet ?? 0,
  thucHanh: s.soTinChiThucHanh ?? 0,
  tinChi: (s.soTinChiLyThuyet ?? 0) + (s.soTinChiThucHanh ?? 0),
  batDau: s.batDau ?? "",
  ketThuc: s.ketThuc ?? "",
  tinhTrangBienSoan: s.compile_status ?? s.trangThaiBienSoan ?? "",
  tinhTrangPhanCong: normalizePhanCong(s.assign_status ?? s.trangThaiPhanCong),
  hoanThanh: s.trangThaiHoanThanh ?? "",
});

export default function MonHoc() {
  const [tab, setTab] = useState("danh-sach");
  const [danhSach, setDanhSach] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterBS, setFilterBS] = useState("Tất cả");
  const [filterPC, setFilterPC] = useState("Tất cả");
  const [xoaId, setXoaId] = useState(null);
  const [xoaLoading, setXoaLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => setToast({ type, message: msg });

  // ── Fetch danh sách ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterBS !== "Tất cả") params.compile_status = filterBS;
      if (search) params.search = search;

      // Gọi song song: tất cả môn + danh sách chưa phân công
      const [resAll, resUnassigned] = await Promise.all([
        getSubjects(params),
        axiosInstance
          .get("/manager/subjects/unassigned")
          .then((r) => r.data)
          .catch(() => []),
      ]);

      const arr = Array.isArray(resAll) ? resAll : (resAll.data ?? resAll.items ?? []);
      const unassignedArr = Array.isArray(resUnassigned)
        ? resUnassigned
        : (resUnassigned.data ?? resUnassigned.items ?? []);

      // Tập hợp mã môn học chưa phân công
      const unassignedSet = new Set(
        unassignedArr.map((s) => s.maMonHoc ?? s.ma ?? "")
      );

      const mapped = arr.map((s) => ({
        ...mapSubject(s),
        // Nếu maMonHoc có trong unassignedSet → chưa phân công, ngược lại → đã phân công
        tinhTrangPhanCong: unassignedSet.has(s.maMonHoc)
          ? "Chưa phân công"
          : "Đã phân công",
      }));

      // Lọc theo filter phân công phía client
      const result = filterPC === "Tất cả"
        ? mapped
        : mapped.filter((m) => m.tinhTrangPhanCong === filterPC);

      setDanhSach(result);
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message ?? "Không thể tải danh sách môn học.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, filterBS, filterPC]);

  useEffect(() => {
    if (tab === "danh-sach") fetchData();
  }, [tab, fetchData]);

  // ── Xoá ──
  const confirmXoa = async () => {
    const ten = danhSach.find((m) => m.id === xoaId)?.ten ?? "";
    setXoaLoading(true);
    try {
      await deleteSubject(xoaId);
      setDanhSach((p) => p.filter((m) => m.id !== xoaId));
      showToast("success", `Môn ${ten} đã được xoá!`);
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message ?? "Không thể xoá môn học.",
      );
    } finally {
      setXoaLoading(false);
      setXoaId(null);
    }
  };

  // ── Sau khi tạo / sửa thành công → refresh list ──
  const handleTaoSuccess = (ten) => {
    showToast("success", `Môn học ${ten} đã được tạo!`);
    setTab("danh-sach");
  };

  const handleSuaSuccess = (ten) => {
    showToast("success", `Môn học ${ten} đã được cập nhật!`);
    setTab("danh-sach");
  };

  // filter client-side (backup nếu API chưa hỗ trợ filter)
  const filtered = danhSach.filter((m) => {
    const q = search.toLowerCase();
    return (
      (m.ma.toLowerCase().includes(q) || m.ten.toLowerCase().includes(q)) &&
      (filterBS === "Tất cả" || m.tinhTrangBienSoan === filterBS) &&
      (filterPC === "Tất cả" || m.tinhTrangPhanCong === filterPC)
    );
  });

  return (
    <>
      <style>{`
        .mh-page {
          min-height: auto; background: #f0f4f8;
          font-family: 'Be Vietnam Pro', sans-serif; color: #1a2340;
        }
        .mh-breadcrumb {
          padding: 12px 32px; font-size: 13px; color: #64748b;
        }
        .mh-breadcrumb span { color: #005AE0; font-weight: 500; cursor: pointer; }
        .mh-breadcrumb span:hover { text-decoration: underline; }

        .mh-layout { display: flex; gap: 20px; padding: 0 32px 32px; }

        .mh-sidebar {
          width: 170px; flex-shrink: 0;
          background: linear-gradient(180deg, #daeef9 0%, #cfe5f9 100%);
          border-radius: 12px; padding: 16px 12px;
          box-shadow: 0 2px 10px rgba(0,90,224,0.07);
          align-self: flex-start;
          min-height: 240px;
        }
        .mh-sidebar-title {
          font-size: 14px; font-weight: 800; color: #1a2340;
          margin-bottom: 14px; padding-bottom: 10px;
          border-bottom: 1.5px solid rgba(0,90,224,0.15);
        }
        .mh-sidebar-item {
          padding: 8px 12px; border-radius: 8px; cursor: pointer;
          font-size: 13.5px; font-weight: 500; color: #005AE0;
          margin-bottom: 4px; transition: all .18s;
        }
        .mh-sidebar-item:hover { background: rgba(0,90,224,0.1); }
        .mh-sidebar-item.active {
          background: linear-gradient(135deg, #005AE0, #00317A);
          color: #fff; font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,90,224,0.25);
        }

        .mh-content { flex: 1; min-width: 0; }

        .mh-table-card {
          background: linear-gradient(160deg, #e8f3fd 0%, #cfe5f9 100%);
          border-radius: 14px; padding: 20px 22px;
          box-shadow: 0 2px 16px rgba(0,90,224,0.07);
        }
        .mh-table-top {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 16px;
          flex-wrap: wrap; gap: 12px;
        }
        .mh-table-title { font-size: 16px; font-weight: 800; color: #1a2340; }
        .mh-filters { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

        .pill {
          border-radius: 20px; padding: 5px 14px;
          font-size: 12.5px; font-weight: 600; cursor: pointer;
          transition: all .18s; font-family: 'Be Vietnam Pro', sans-serif;
          border: 1.5px solid #b8d8f0; background: #fff; color: #1a2340;
        }
        .pill:hover { border-color: #005AE0; color: #005AE0; }
        .pill.active {
          background: linear-gradient(135deg, #005AE0, #00317A);
          border-color: transparent; color: #fff;
          box-shadow: 0 2px 6px rgba(0,90,224,0.25);
        }

        .filter-select {
          border: 1.5px solid #b8d8f0; border-radius: 20px;
          padding: 5px 14px; font-size: 12.5px; font-weight: 500;
          font-family: 'Be Vietnam Pro', sans-serif;
          background: #fff; color: #1a2340; cursor: pointer;
          outline: none; transition: border-color .2s;
        }
        .filter-select:focus { border-color: #005AE0; }

        .mh-table-search {
          border: 1.5px solid #b8d8f0; border-radius: 20px;
          padding: 6px 14px 6px 10px; font-size: 13px;
          font-family: 'Be Vietnam Pro', sans-serif;
          background: #fff; color: #1a2340; outline: none;
          width: 200px; transition: border-color .2s, box-shadow .2s;
        }
        .mh-table-search:focus { border-color: #005AE0; box-shadow: 0 0 0 3px rgba(0,90,224,0.1); }

        .mh-table { width: 100%; border-collapse: collapse; }
        .mh-table thead th {
          text-align: left; padding: 10px 14px;
          background: #b8d8f0; font-size: 13px; font-weight: 700;
          color: #1a2340; border-bottom: 2px solid #9dc5e4;
        }
        .mh-table thead th:first-child { border-radius: 8px 0 0 0; }
        .mh-table thead th:last-child  { border-radius: 0 8px 0 0; }
        .mh-table tbody tr { transition: background .15s; }
        .mh-table tbody tr:nth-child(odd)  { background: #fff; }
        .mh-table tbody tr:nth-child(even) { background: #eaf4fc; }
        .mh-table tbody tr:hover { background: #d6ecf8; }
        .mh-table tbody td {
          padding: 9px 14px; font-size: 13.5px;
          border-bottom: 1px solid #cfe5f9; color: #1a2340;
        }

        .tbl-btn {
          background: none; border: none; cursor: pointer;
          font-size: 15px; padding: 3px 5px; border-radius: 6px;
          transition: background .15s;
        }
        .tbl-btn:hover { background: rgba(0,90,224,0.1); }
        .tbl-btn:disabled { opacity: .4; cursor: not-allowed; }

        .badge-done    { color: #005AE0; font-weight: 700; }
        .badge-undone  { color: #dc2626; }
        .badge-pending { color: #64748b; }

        .badge-pc {
          display: inline-block; padding: 3px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 600; white-space: nowrap;
        }
        .badge-pc-assigned   { background: #D1FAE5; color: #065F46; }
        .badge-pc-unassigned { background: #FEF3C7; color: #92400E; }

        .mh-empty {
          padding: 80px 0; text-align: center;
          color: #94a3b8; font-size: 15px;
        }
        .mh-empty-icon { font-size: 48px; margin-bottom: 12px; opacity: .4; }

        .mh-loading {
          padding: 60px 0; text-align: center;
          color: #005AE0; font-size: 14px;
        }

        .mh-table-wrap { overflow-x: auto; max-height: 380px; overflow-y: auto; border-radius: 8px; }

        .mh-overlay {
          position: fixed; inset: 0;
          background: rgba(0,49,122,0.35);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
          backdrop-filter: blur(2px);
        }
        .mh-modal {
          background: #fff; border-radius: 14px; padding: 28px 32px;
          min-width: 340px; max-width: 420px;
          box-shadow: 0 8px 40px rgba(0,49,122,0.2);
          font-family: 'Be Vietnam Pro', sans-serif;
          animation: modalIn .22s cubic-bezier(.22,.68,0,1.2);
        }
        @keyframes modalIn {
          from { transform: scale(.9) translateY(10px); opacity: 0; }
          to   { transform: scale(1) translateY(0);      opacity: 1; }
        }
        .mh-modal-header {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 16px; font-weight: 800; color: #1a2340;
          padding-bottom: 14px; margin-bottom: 14px;
          border-bottom: 1.5px solid #e2e8f0;
        }
        .mh-modal-close {
          background: none; border: none; cursor: pointer;
          font-size: 20px; color: #94a3b8; line-height: 1; padding: 0;
          transition: color .15s;
        }
        .mh-modal-close:hover { color: #1a2340; }
        .mh-modal p { color: #1a2340; font-size: 14.5px; line-height: 1.5; }
        .mh-modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 22px; }
        .btn-cancel {
          padding: 9px 26px; border-radius: 8px; border: 1.5px solid #b8d8f0;
          background: #fff; color: #1a2340; font-weight: 600; font-size: 14px;
          font-family: 'Be Vietnam Pro', sans-serif; cursor: pointer;
          transition: border-color .2s;
        }
        .btn-cancel:hover { border-color: #005AE0; }
        .btn-confirm {
          padding: 9px 26px; border-radius: 8px; border: none;
          background: linear-gradient(135deg, #005AE0, #00317A);
          color: #fff; font-weight: 700; font-size: 14px;
          font-family: 'Be Vietnam Pro', sans-serif; cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,90,224,0.3);
          transition: opacity .2s;
        }
        .btn-confirm:hover { opacity: .88; }
        .btn-confirm:disabled { opacity: .5; cursor: not-allowed; }
      `}</style>

      <div className="mh-page">
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}


        <div className="mh-breadcrumb">
          <span onClick={() => setTab("danh-sach")}>Trang chủ</span> &rsaquo;
          Danh sách môn học
        </div>

        <div className="mh-layout">
          {/* ── Sidebar ── */}
          <div className="mh-sidebar">
            <div className="mh-sidebar-title">Nội dung</div>
            {[
              { key: "tao", label: "Tạo môn học" },
              { key: "chinh-sua", label: "Chỉnh sửa môn học" },
            ].map((item) => (
              <div
                key={item.key}
                className={`mh-sidebar-item${tab === item.key ? " active" : ""}`}
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* ── Content ── */}
          <div className="mh-content">
            {tab === "tao" && (
              <TaoMonHoc
                onSaveSuccess={handleTaoSuccess}
                onCancel={() => setTab("danh-sach")}
              />
            )}

            {tab === "chinh-sua" && (
              <ChinhSuaMonHoc
                danhSach={danhSach}
                onSaveSuccess={handleSuaSuccess}
                onCancel={() => setTab("danh-sach")}
              />
            )}

            {tab === "danh-sach" && (
              <div className="mh-table-card">
                <div className="mh-table-top">
                  <span className="mh-table-title">Danh sách môn học</span>
                  <div className="mh-filters">
                    <button
                      className={`pill${filterBS === "Tất cả" && filterPC === "Tất cả" ? " active" : ""}`}
                      onClick={() => {
                        setFilterBS("Tất cả");
                        setFilterPC("Tất cả");
                      }}
                    >
                      Tất cả
                    </button>

                    <select
                      className="filter-select"
                      value={filterPC}
                      onChange={(e) => setFilterPC(e.target.value)}
                    >
                      <option value="Tất cả">Tình trạng phân công</option>
                      <option value="Đã phân công">Đã phân công</option>
                      <option value="Chưa phân công">Chưa phân công</option>
                    </select>

                    <select
                      className="filter-select"
                      value={filterBS}
                      onChange={(e) => setFilterBS(e.target.value)}
                    >
                      <option value="Tất cả">Tình trạng biên soạn</option>
                      <option value="Đang biên soạn">Đang biên soạn</option>
                      <option value="Chưa biên soạn">Chưa biên soạn</option>
                    </select>

                    <input
                      className="mh-table-search"
                      placeholder="🔍  Tìm kiếm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="mh-loading">⏳ Đang tải...</div>
                ) : filtered.length === 0 ? (
                  <div className="mh-empty">
                    <div className="mh-empty-icon">📋</div>
                    Chưa có môn học
                  </div>
                ) : (
                  <div className="mh-table-wrap">
                    <table className="mh-table">
                      <thead>
                        <tr>
                          {[
                            "STT",
                            "Mã môn học",
                            "Tên môn học",
                            "Hành động",
                            "Tổng số tín chỉ",
                            "Phân công",
                            "Hoàn thành",
                          ].map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((m, i) => (
                          <tr key={m.id}>
                            <td>{String(i + 1).padStart(2, "0")}</td>
                            <td>{m.ma}</td>
                            <td>{m.ten}</td>
                            <td>
                              <button
                                className="tbl-btn"
                                title="Chỉnh sửa"
                                onClick={() => setTab("chinh-sua")}
                              >
                                ✏️
                              </button>
                              <button
                                className="tbl-btn"
                                title="Xoá"
                                onClick={() => setXoaId(m.id)}
                              >
                                🗑️
                              </button>
                            </td>
                            <td>{m.tinChi} tín chỉ</td>
                            <td>
                              <span className={`badge-pc ${
                                m.tinhTrangPhanCong === "Đã phân công"
                                  ? "badge-pc-assigned"
                                  : "badge-pc-unassigned"
                              }`}>
                                {m.tinhTrangPhanCong}
                              </span>
                            </td>
                            <td>
                              {m.hoanThanh && (
                                <span className="badge-done">
                                  {m.hoanThanh}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Modal xác nhận xoá ── */}
        {xoaId && (
          <div className="mh-overlay">
            <div className="mh-modal">
              <div className="mh-modal-header">
                <span>Xoá môn học</span>
                <button
                  className="mh-modal-close"
                  onClick={() => setXoaId(null)}
                >
                  ×
                </button>
              </div>
              <p>
                Bạn muốn xoá môn{" "}
                <strong>{danhSach.find((m) => m.id === xoaId)?.ten}</strong>?
              </p>
              <div className="mh-modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setXoaId(null)}
                  disabled={xoaLoading}
                >
                  Huỷ
                </button>
                <button
                  className="btn-confirm"
                  onClick={confirmXoa}
                  disabled={xoaLoading}
                >
                  {xoaLoading ? "Đang xoá..." : "Đồng ý"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}