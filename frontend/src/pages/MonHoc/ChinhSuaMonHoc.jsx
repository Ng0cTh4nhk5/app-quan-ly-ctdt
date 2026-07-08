import { useState, useEffect } from "react";
import { updateSubject } from "../../services/subjectService";

const DEFAULT_CTDT = import.meta.env.VITE_DEFAULT_CTDT ?? "";

export default function ChinhSuaMonHoc({
  danhSach = [],
  onSaveSuccess,
  onCancel,
}) {
  const [selectedMa, setSelectedMa] = useState("");

  const [form, setForm] = useState({
    ma: "",
    ten: "",
    lyThuyet: "",
    thucHanh: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedMa) {
      setForm({ ma: "", ten: "", lyThuyet: "", thucHanh: "" });
      return;
    }

    const found = danhSach.find((m) => m.ma === selectedMa);
    if (found)
      setForm({
        ma: found.ma,
        ten: found.ten,
        lyThuyet: found.lyThuyet ?? "",
        thucHanh: found.thucHanh ?? "",
      });
  }, [selectedMa, danhSach]);

  const change = ({ target: { name, value } }) => {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSave = async () => {
    const e = {};
    if (!selectedMa) e.select = "Vui lòng chọn môn học";
    if (!form.ten.trim()) e.ten = "Vui lòng nhập tên môn học";

    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setLoading(true);
    try {
      await updateSubject(selectedMa, {
        maMonHoc: form.ma,
        tenMonHoc: form.ten,
        soTinChiLyThuyet: Number(form.lyThuyet),
        soTinChiThucHanh: Number(form.thucHanh),
        chuongTrinhDaoTaoMa: DEFAULT_CTDT,
      });

      onSaveSuccess(form.ten);
    } catch (err) {
      setErrors({
        api: err.response?.data?.message ?? "Không thể cập nhật môn học.",
      });
    } finally {
      setLoading(false);
    }
  };

  const editFields = [
    { label: "Mã môn học", name: "ma", type: "text", disabled: true },
    { label: "Tên môn học", name: "ten", type: "text", disabled: false },
    {
      label: "Số tín chỉ lý thuyết",
      name: "lyThuyet",
      type: "number",
      disabled: false,
    },
    {
      label: "Số tín chỉ thực hành",
      name: "thucHanh",
      type: "number",
      disabled: false,
    },
  ];

  return (
    <>
      <style>{`
        .form-card {
          background: linear-gradient(160deg, #e8f3fd 0%, #cfe5f9 100%);
          border-radius: 14px;
          padding: 30px 32px;
          box-shadow: 0 2px 16px rgba(0,90,224,0.07);
          font-family: 'Be Vietnam Pro', sans-serif;
        }

        .form-card h2 {
          font-size: 20px;
          font-weight: 800;
          color: #1a2340;
          margin-bottom: 22px;
        }

        .api-err {
          color: #dc2626; font-size: 13px; margin-bottom: 16px;
          padding: 8px 14px; background: #fef2f2;
          border-radius: 8px; border: 1px solid #fca5a5;
        }

        .select-row {
          margin-bottom: 22px;
        }

        .select-row label {
          display: block;
          font-size: 13.5px;
          font-weight: 600;
          color: #1a2340;
          margin-bottom: 6px;
        }

        .select-row select {
          width: 55%;
          padding: 9px 14px;
          border-radius: 8px;
          border: 1.5px solid #b8d8f0;
          font-size: 14px;
          background: #fff;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px 32px;
          margin-bottom: 28px;
        }

        .form-field label {
          display: block;
          font-size: 13.5px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .form-field input {
          width: 100%;
          padding: 9px 14px;
          border-radius: 8px;
          border: 1.5px solid #b8d8f0;
          font-size: 14px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-cancel {
          padding: 9px 26px;
          border-radius: 8px;
          border: 1.5px solid #b8d8f0;
          background: #fff;
          color: #1a2340;
          font-weight: 600;
          font-size: 14px;
          font-family: 'Be Vietnam Pro', sans-serif;
          cursor: pointer;
          transition: border-color .2s, background .2s;
        }

        .btn-cancel:hover {
          border-color: #005AE0;
          background: #f0f7ff;
        }

        .btn-save {
          padding: 9px 26px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #005AE0, #00317A);
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          font-family: 'Be Vietnam Pro', sans-serif;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,90,224,0.3);
          transition: opacity .2s, transform .1s;
        }

        .btn-save:hover:not(:disabled) {
          opacity: .9;
          transform: translateY(-1px);
        }

        .btn-save:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-save:disabled {
          opacity: .5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="form-card">
        <h2>Chỉnh sửa môn học</h2>

        {errors.api && <div className="api-err">⚠️ {errors.api}</div>}

        <div className="select-row">
          <label>Chọn môn học</label>
          <select
            value={selectedMa}
            onChange={(e) => {
              setSelectedMa(e.target.value);
              setErrors({});
            }}
          >
            <option value="">-- Chọn môn học --</option>
            {danhSach.map((m) => (
              <option key={m.ma} value={m.ma}>
                {m.ten} ({m.ma})
              </option>
            ))}
          </select>
        </div>

        <div className="form-grid">
          {editFields.map((f) => (
            <div className="form-field" key={f.name}>
              <label>{f.label}</label>
              <input
                type={f.type}
                name={f.name}
                value={form[f.name]}
                onChange={change}
                disabled={f.disabled || !selectedMa}
              />
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button className="btn-cancel" onClick={onCancel} disabled={loading}>
            Huỷ
          </button>

          <button className="btn-save" onClick={handleSave} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </>
  );
}
