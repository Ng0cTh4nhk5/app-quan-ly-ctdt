// src/pages/ThanhVien/ChinhSuaTaiKhoan.jsx
import { useState, useEffect } from 'react'
import { memberUpdate } from '../../services/memberService'

export default function ChinhSuaTaiKhoan({ member, danhSach = [], onSave, onCancel, showToast }) {
  const [selectedId, setSelectedId] = useState(member?.id ?? null)
  const [form, setForm] = useState({
    username:          '',
    fullName:          '',
    email:             '',
    hocHam:            '',
    hocVi:             '',
    trinhDoChuyenMon:  '',
  })
  const [saving, setSaving] = useState(false)

  // Đổ dữ liệu khi chọn thành viên
  useEffect(() => {
    const found = danhSach.find(m => m.id === selectedId)
    if (found) {
      setForm({
        username:         found.tenDangNhap ?? '',
        fullName:         found.hoTen       ?? '',
        email:            found.email       ?? '',
        hocHam:           found.hocHam      ?? '',
        hocVi:            found.hocVi       ?? '',
        trinhDoChuyenMon: found.chuyenMon   ?? '',
      })
    }
  }, [selectedId, danhSach])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // ── PUT /manager/members/{id} ─────────────────────────────────
  const handleSave = async () => {
    if (!selectedId) { showToast('warning', 'Vui lòng chọn thành viên cần chỉnh sửa'); return }

    setSaving(true)
    try {
      const { ok, data } = await memberUpdate(selectedId, {
        fullName:         form.fullName,
        email:            form.email,
        hocHam:           form.hocHam           || undefined,
        hocVi:            form.hocVi            || undefined,
        trinhDoChuyenMon: form.trinhDoChuyenMon || undefined,
      })
      if (ok) {
        showToast('success', 'Cập nhật tài khoản thành công')
        onSave(data)
      } else {
        showToast('error', data?.message ?? data?.title ?? 'Cập nhật tài khoản thất bại')
      }
    } catch {
      showToast('error', 'Lỗi kết nối máy chủ')
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { label: 'Tên đăng nhập',       name: 'username',         disabled: true  },
    { label: 'Họ tên người dùng',   name: 'fullName'                          },
    { label: 'Email',               name: 'email'                             },
    { label: 'Học hàm',             name: 'hocHam',           type: 'select', optKey: 'hocHam' },
    { label: 'Học vị',              name: 'hocVi',            type: 'select', optKey: 'hocVi'  },
    { label: 'Trình độ chuyên môn', name: 'trinhDoChuyenMon'                  },
  ]

  const options = {
    hocHam: ['Giáo sư', 'Phó giáo sư', 'Không có'],
    hocVi:  ['Tiến sĩ', 'Thạc sĩ', 'Cử nhân', 'Kỹ sư'],
  }

  return (
    <div className="edit-container">
      <style>{`
        .edit-title { font-size: 18px; font-weight: 800; color: #1a2340; margin-bottom: 20px; }
        .edit-card { background: linear-gradient(160deg, #e8f3fd 0%, #cfe5f9 100%); border-radius: 14px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .split-layout { display: flex; gap: 24px; margin-bottom: 20px; }

        .left-panel { flex: 1.2; background: #fff; border-radius: 12px; padding: 16px; }
        .inner-title { font-size: 15px; font-weight: 700; margin-bottom: 12px; }
        .inner-table-wrap { height: 320px; overflow-y: auto; border: 1px solid #eee; border-radius: 8px; }
        .inner-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .inner-table th { position: sticky; top: 0; background: #f8fafc; padding: 10px; }
        .inner-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
        .inner-table tr.selected { background: #e0f2fe; }

        .right-panel { flex: 1; display: flex; flex-direction: column; gap: 12px; }

        .form-group label { font-size: 12.5px; font-weight: 600; margin-bottom: 4px; display: block; }
        .form-group input,
        .form-group select {
          width: 100%; padding: 8px 12px; border-radius: 8px;
          border: 1.5px solid #b8d8f0; outline: none; background: #fff; box-sizing: border-box;
        }
        .form-group input:focus, .form-group select:focus { border-color: #005AE0; box-shadow: 0 0 0 3px rgba(0,90,224,0.1); }
        .form-group input:disabled { background: #f1f5f9; cursor: not-allowed; }

        .btn-group { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
        .btn-huy { padding: 8px 24px; border: 1.5px solid #005AE0; background: #fff; color: #005AE0; border-radius: 8px; cursor: pointer; }
        .btn-luu { padding: 8px 24px; background: linear-gradient(135deg, #005AE0, #00317A); color: #fff; border: none; border-radius: 8px; cursor: pointer; }
        .btn-luu:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="edit-title">Chỉnh sửa tài khoản</div>

      <div className="edit-card">
        <div className="split-layout">

          {/* LEFT – danh sách */}
          <div className="left-panel">
            <div className="inner-title">Danh sách thành viên</div>
            <div className="inner-table-wrap">
              <table className="inner-table">
                <thead>
                  <tr>
                    <th>Chọn</th>
                    <th>Tên đăng nhập</th>
                    <th>Họ tên</th>
                  </tr>
                </thead>
                <tbody>
                  {danhSach.map(m => (
                    <tr key={m.id} className={selectedId === m.id ? 'selected' : ''} onClick={() => setSelectedId(m.id)}>
                      <td style={{ textAlign: 'center' }}>
                        <input type="radio" checked={selectedId === m.id} readOnly />
                      </td>
                      <td>{m.tenDangNhap}</td>
                      <td>{m.hoTen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT – form */}
          <div className="right-panel">
            {fields.map(f => (
              <div className="form-group" key={f.name}>
                <label>{f.label}</label>

                {f.type === 'select' ? (
                  <select name={f.name} value={form[f.name]} onChange={handleChange}>
                    <option value="">Chọn {f.label.toLowerCase()}</option>
                    {options[f.optKey].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input name={f.name} value={form[f.name]} disabled={f.disabled} onChange={handleChange} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="btn-group">
          <button className="btn-huy" onClick={onCancel} disabled={saving}>Hủy</button>
          <button className="btn-luu" onClick={handleSave} disabled={!selectedId || saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}