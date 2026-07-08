// src/pages/MonHoc/MonHocBienSoan.jsx  –  Role: Biên soạn
import { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import Toast from "../../components/Toast";
import { getSubjects, updateSubject } from "../../services/subjectService";

const mapSubject = (s, i) => ({
  id: s.maMonHoc ?? i,
  ma: s.maMonHoc ?? "",
  ten: s.tenMonHoc ?? "",
  tinChi: (s.soTinChiLyThuyet ?? 0) + (s.soTinChiThucHanh ?? 0),
  hoanThanh: s.trangThaiHoanThanh ?? "",
});

export default function MonHocBienSoan() {
  const [danhSach, setDanhSach] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tất cả");
  const [editItem, setEditItem] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filter === "Hoàn thành") params.compile_status = "Hoàn thành";
      if (filter === "Chưa hoàn thành")
        params.compile_status = "Chưa hoàn thành";
      const res = await getSubjects(params);
      const arr = Array.isArray(res) ? res : (res.data ?? res.items ?? []);
      setDanhSach(arr.map(mapSubject));
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message ?? "Không thể tải danh sách.",
      });
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // client-side filter fallback
  const filtered = danhSach.filter((m) => {
    const q = search.toLowerCase();
    const matchQ =
      m.ma.toLowerCase().includes(q) || m.ten.toLowerCase().includes(q);
    const matchF =
      filter === "Tất cả" ||
      (filter === "Hoàn thành" && m.hoanThanh === "Hoàn thành") ||
      (filter === "Chưa hoàn thành" && m.hoanThanh !== "Hoàn thành");
    return matchQ && matchF;
  });

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await updateSubject(editItem.id, {
        tenMonHoc: editItem.ten,
        soTinChiLyThuyet: Number(editItem.tinChi), // tạm; BE nên tách lyThuyet/thucHanh
        soTinChiThucHanh: 0,
        trangThaiHoanThanh: editItem.hoanThanh,
      });
      setDanhSach((p) =>
        p.map((m) => (m.id === editItem.id ? { ...m, ...editItem } : m)),
      );
      setToast({
        type: "success",
        message: `Môn học ${editItem.ten} đã được cập nhật!`,
      });
      setEditItem(null);
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message ?? "Không thể cập nhật môn học.",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .bs-page {
          min-height: 100vh; background: #f0f4f8;
          font-family: 'Be Vietnam Pro', sans-serif; color: #1a2340;
        }
        .bs-breadcrumb { padding: 12px 32px; font-size: 13px; color: #64748b; }
        .bs-breadcrumb span { color: #005AE0; font-weight: 500; cursor: pointer; }

        .bs-wrap { padding: 0 32px 32px; }
        .bs-card {
          background: linear-gradient(160deg, #e8f3fd 0%, #cfe5f9 100%);
          border-radius: 14px; padding: 20px 22px;
          box-shadow: 0 2px 16px rgba(0,90,224,0.07);
        }
        .bs-top {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 16px;
          flex-wrap: wrap; gap: 12px;
        }
        .bs-title { font-size: 16px; font-weight: 800; color: #1a2340; }
        .bs-filters { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

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
          outline: none;
        }
        .bs-search {
          border: 1.5px solid #b8d8f0; border-radius: 20px;
          padding: 6px 14px 6px 10px; font-size: 13px;
          font-family: 'Be Vietnam Pro', sans-serif;
          background: #fff; color: #1a2340; outline: none; width: 200px;
          transition: border-color .2s;
        }
        .bs-search:focus { border-color: #005AE0; }

        .bs-loading { padding: 60px 0; text-align: center; color: #005AE0; font-size: 14px; }

        .bs-table { width: 100%; border-collapse: collapse; }
        .bs-table thead th {
          text-align: left; padding: 10px 14px;
          background: #b8d8f0; font-size: 13px; font-weight: 700; color: #1a2340;
          border-bottom: 2px solid #9dc5e4;
        }
        .bs-table thead th:first-child { border-radius: 8px 0 0 0; }
        .bs-table thead th:last-child  { border-radius: 0 8px 0 0; }
        .bs-table tbody tr:nth-child(odd)  { background: #fff; }
        .bs-table tbody tr:nth-child(even) { background: #eaf4fc; }
        .bs-table tbody tr:hover { background: #d6ecf8; }
        .bs-table tbody td {
          padding: 9px 14px; font-size: 13.5px;
          border-bottom: 1px solid #cfe5f9;
        }
        .bs-table-wrap { overflow-x: auto; max-height: 420px; overflow-y: auto; border-radius: 8px; }

        .badge-done   { color: #005AE0; font-weight: 700; }
        .badge-undone { color: #dc2626; font-weight: 500; }

        .tbl-btn {
          background: none; border: none; cursor: pointer;
          font-size: 15px; padding: 3px 5px; border-radius: 6px;
          transition: background .15s; color: #005AE0;
        }
        .tbl-btn:hover { background: rgba(0,90,224,0.1); }

        /* Modal */
        .bs-overlay {
          position: fixed; inset: 0; background: rgba(0,49,122,0.35);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
          backdrop-filter: blur(2px);
        }
        .bs-modal {
          background: #fff; border-radius: 14px; padding: 28px 32px;
          min-width: 360px; max-width: 440px;
          box-shadow: 0 8px 40px rgba(0,49,122,0.2);
          font-family: 'Be Vietnam Pro', sans-serif;
          animation: modalIn .22s cubic-bezier(.22,.68,0,1.2);
        }
        @keyframes modalIn {
          from { transform: scale(.9) translateY(10px); opacity:0; }
          to   { transform: scale(1) translateY(0); opacity:1; }
        }
        .bs-modal-header {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 16px; font-weight: 800; color: #1a2340;
          padding-bottom: 14px; margin-bottom: 18px;
          border-bottom: 1.5px solid #e2e8f0;
        }
        .bs-modal-close {
          background: none; border: none; cursor: pointer;
          font-size: 20px; color: #94a3b8; line-height: 1; padding: 0;
        }
        .bs-modal-close:hover { color: #1a2340; }
        .modal-field { margin-bottom: 16px; }
        .modal-field label {
          display: block; font-size: 13.5px; font-weight: 600;
          color: #1a2340; margin-bottom: 6px;
        }
        .modal-field input, .modal-field select {
          width: 100%; padding: 9px 14px; border-radius: 8px;
          border: 1.5px solid #b8d8f0; font-size: 14px;
          font-family: 'Be Vietnam Pro', sans-serif;
          background: #fff; color: #1a2340; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .modal-field input:focus, .modal-field select:focus {
          border-color: #005AE0; box-shadow: 0 0 0 3px rgba(0,90,224,0.12);
        }
        .bs-modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
        .btn-cancel {
          padding: 9px 26px; border-radius: 8px; border: 1.5px solid #b8d8f0;
          background: #fff; color: #1a2340; font-weight: 600; font-size: 14px;
          font-family: 'Be Vietnam Pro', sans-serif; cursor: pointer;
        }
        .btn-cancel:hover { border-color: #005AE0; }
        .btn-save {
          padding: 9px 26px; border-radius: 8px; border: none;
          background: linear-gradient(135deg, #005AE0, #00317A);
          color: #fff; font-weight: 700; font-size: 14px;
          font-family: 'Be Vietnam Pro', sans-serif; cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,90,224,0.3);
        }
        .btn-save:hover:not(:disabled) { opacity: .9; }
        .btn-save:disabled { opacity: .5; cursor: not-allowed; }
      `}</style>

      <div className="bs-page">
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        <Navbar role="bien-soan" />

        <div className="bs-breadcrumb">
          <span>Trang chủ</span> &rsaquo; Danh sách môn học
        </div>

        <div className="bs-wrap">
          <div className="bs-card">
            <div className="bs-top">
              <span className="bs-title">Danh sách môn học</span>
              <div className="bs-filters">
                <button
                  className={`pill${filter === "Tất cả" ? " active" : ""}`}
                  onClick={() => setFilter("Tất cả")}
                >
                  Tất cả
                </button>
                <select
                  className="filter-select"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="Tất cả">Tình trạng biên soạn</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Chưa hoàn thành">Chưa hoàn thành</option>
                </select>
                <input
                  className="bs-search"
                  placeholder="🔍  Tìm kiếm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="bs-loading">⏳ Đang tải...</div>
            ) : (
              <div className="bs-table-wrap">
                <table className="bs-table">
                  <thead>
                    <tr>
                      {[
                        "STT",
                        "Mã môn học",
                        "Tên môn học",
                        "Tổng số tín chỉ",
                        "Hoàn thành",
                        "Hành động",
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
                        <td>{m.tinChi} tín chỉ</td>
                        <td>
                          {m.hoanThanh === "Hoàn thành" && (
                            <span className="badge-done">Hoàn thành</span>
                          )}
                          {m.hoanThanh === "Chưa hoàn thành" && (
                            <span className="badge-undone">
                              Chưa hoàn thành
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            className="tbl-btn"
                            title="Chỉnh sửa"
                            onClick={() => setEditItem({ ...m })}
                          >
                            ✏️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal chỉnh sửa */}
        {editItem && (
          <div className="bs-overlay">
            <div className="bs-modal">
              <div className="bs-modal-header">
                <span>Chỉnh sửa môn học</span>
                <button
                  className="bs-modal-close"
                  onClick={() => setEditItem(null)}
                >
                  ×
                </button>
              </div>

              <div className="modal-field">
                <label>Tên môn học</label>
                <input
                  value={editItem.ten}
                  onChange={(e) =>
                    setEditItem((p) => ({ ...p, ten: e.target.value }))
                  }
                  disabled={saveLoading}
                />
              </div>
              <div className="modal-field">
                <label>Tổng số tín chỉ</label>
                <input
                  type="number"
                  value={editItem.tinChi}
                  onChange={(e) =>
                    setEditItem((p) => ({ ...p, tinChi: e.target.value }))
                  }
                  disabled={saveLoading}
                />
              </div>
              <div className="modal-field">
                <label>Hoàn thành</label>
                <select
                  value={editItem.hoanThanh}
                  onChange={(e) =>
                    setEditItem((p) => ({ ...p, hoanThanh: e.target.value }))
                  }
                  disabled={saveLoading}
                >
                  <option value="">--</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Chưa hoàn thành">Chưa hoàn thành</option>
                </select>
              </div>

              <div className="bs-modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setEditItem(null)}
                  disabled={saveLoading}
                >
                  Huỷ
                </button>
                <button
                  className="btn-save"
                  onClick={handleSave}
                  disabled={saveLoading}
                >
                  {saveLoading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
