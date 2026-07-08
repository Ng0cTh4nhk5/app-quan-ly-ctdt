import { useState } from "react";
import { createSubject } from "../../services/subjectService";

const EMPTY = {
  ten: "",
  ma: "",
  lyThuyet: "",
  thucHanh: "",
};

const DEFAULT_CTDT = import.meta.env.VITE_DEFAULT_CTDT ?? "";

export default function TaoMonHoc({ onSaveSuccess, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const change = ({ target: { name, value } }) => {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.ten.trim()) e.ten = "Vui lòng nhập tên môn học";
    if (!form.ma.trim()) e.ma = "Vui lòng nhập mã môn học";
    if (!form.lyThuyet) e.lyThuyet = "Vui lòng nhập số tín chỉ lý thuyết";
    if (!form.thucHanh) e.thucHanh = "Vui lòng nhập số tín chỉ thực hành";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setLoading(true);
    try {
      await createSubject({
        maMonHoc: form.ma,
        tenMonHoc: form.ten,
        soTinChiLyThuyet: Number(form.lyThuyet),
        soTinChiThucHanh: Number(form.thucHanh),
        chuongTrinhDaoTaoMa: DEFAULT_CTDT,
      });

      setForm(EMPTY);
      onSaveSuccess(form.ten);
    } catch (err) {
      setErrors({
        api: err.response?.data?.message ?? "Không thể tạo môn học.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Tên môn học", name: "ten", type: "text", col: 1 },
    { label: "Mã môn học", name: "ma", type: "text", col: 2 },
    { label: "Số tín chỉ lý thuyết", name: "lyThuyet", type: "number", col: 1 },
    { label: "Số tín chỉ thực hành", name: "thucHanh", type: "number", col: 2 },
  ];

  return (
    <>
      <style>{`
        .form-card {
          background: linear-gradient(160deg, #e8f3fd 0%, #cfe5f9 100%);
          border-radius: 14px; padding: 30px 32px;
          box-shadow: 0 2px 16px rgba(0,90,224,0.07);
          font-family: 'Be Vietnam Pro', sans-serif;
        }
        .form-card h2 { font-size: 20px; font-weight: 800; color: #1a2340; margin-bottom: 26px; }
        .form-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 18px 32px; margin-bottom: 28px;
        }
        .form-field label {
          display: block; font-size: 13.5px; font-weight: 600;
          color: #1a2340; margin-bottom: 6px;
        }
        .form-field input, .form-field select {
          width: 100%; padding: 9px 14px; border-radius: 8px;
          border: 1.5px solid #b8d8f0; font-size: 14px;
          font-family: 'Be Vietnam Pro', sans-serif;
          background: #fff; color: #1a2340; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .form-field input:focus, .form-field select:focus {
          border-color: #005AE0; box-shadow: 0 0 0 3px rgba(0,90,224,0.12);
        }
        .form-field input.err { border-color: #dc2626; }
        .form-field .err-msg { color: #dc2626; font-size: 12px; margin-top: 4px; }
        .api-err {
          color: #dc2626; font-size: 13px; margin-bottom: 16px;
          padding: 8px 14px; background: #fef2f2;
          border-radius: 8px; border: 1px solid #fca5a5;
        }
        .form-actions { display: flex; justify-content: flex-end; gap: 12px; }
        .btn-cancel {
          padding: 9px 26px; border-radius: 8px; border: 1.5px solid #b8d8f0;
          background: #fff; color: #1a2340; font-weight: 600; font-size: 14px;
          font-family: 'Be Vietnam Pro', sans-serif; cursor: pointer;
        }
        .btn-save {
          padding: 9px 26px; border-radius: 8px; border: none;
          background: linear-gradient(135deg, #005AE0, #00317A);
          color: #fff; font-weight: 700; font-size: 14px;
          font-family: 'Be Vietnam Pro', sans-serif; cursor: pointer;
        }
      `}</style>

      <div className="form-card">
        <h2>Tạo môn học</h2>

        {errors.api && <div className="api-err">⚠️ {errors.api}</div>}

        <div className="form-grid">
          {fields.map((f) => (
            <div className="form-field" key={f.name}>
              <label>{f.label}</label>
              <input
                className={errors[f.name] ? "err" : ""}
                type={f.type}
                name={f.name}
                value={form[f.name]}
                onChange={change}
                disabled={loading}
              />
              {errors[f.name] && (
                <div className="err-msg">{errors[f.name]}</div>
              )}
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
