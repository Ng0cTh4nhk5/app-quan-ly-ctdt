// src/pages/ThanhVien/TaoTaiKhoan.jsx
import { useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'
import { memberCreate } from '../../services/memberService'

// ── Cùng EmailJS config với Adminpage ──
const EMAILJS_SERVICE  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC   = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const DEFAULT_PASSWORD = 'Abc@123'

export default function TaoTaiKhoan({ onSave, onCancel, showToast }) {
  const [form, setForm] = useState({
    username:         '',
    fullName:         '',
    email:            '',
    hocHam:           '',
    hocVi:            '',
    trinhDoChuyenMon: '',
  })
  const [saving, setSaving]   = useState(false)
  const [errors, setErrors]   = useState({})

  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC)
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const errs = {}
    if (!form.username.trim()) errs.username = 'Vui lòng nhập tên đăng nhập'
    if (!form.fullName.trim()) errs.fullName = 'Vui lòng nhập họ tên'
    if (!form.email.trim())    errs.email    = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Email không hợp lệ'
    return errs
  }

  // Gửi email thông tin tài khoản qua EmailJS
  const sendWelcomeEmail = async ({ username, email, fullName }) => {
    try {
      await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
        to_email:   email,
        to_name:    fullName,
        username:   username,
        password:   DEFAULT_PASSWORD,
        khoa:       'Chưa cập nhật',
        program:    'Chưa cập nhật',
        login_link: `${window.location.origin}/login`,
        year:       new Date().getFullYear(),
      })
      showToast('success', `Đã gửi thông tin tài khoản tới ${email}`)
    } catch (err) {
      // Không block luồng chính nếu mail lỗi
      showToast('error', `Tạo tài khoản thành công nhưng gửi mail thất bại: ${err?.text ?? err?.message ?? ''}`)
    }
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const { ok, data } = await memberCreate({
        username:         form.username,
        fullName:         form.fullName,
        email:            form.email,
        roleId:           3,
        hocHam:           form.hocHam           || undefined,
        hocVi:            form.hocVi            || undefined,
        trinhDoChuyenMon: form.trinhDoChuyenMon || undefined,
      })

      if (ok) {
        showToast('success', 'Tạo tài khoản thành công! Đang gửi mail...')
        // Gửi mail song song, không chờ xong mới gọi onSave
        sendWelcomeEmail({
          username: form.username,
          email:    form.email,
          fullName: form.fullName,
        })
        onSave(data)
      } else {
        showToast('error', data?.message ?? data?.title ?? 'Tạo tài khoản thất bại')
      }
    } catch {
      showToast('error', 'Lỗi kết nối máy chủ')
    } finally {
      setSaving(false)
    }
  }

  const options = {
    hocHam: ['Giáo sư', 'Phó giáo sư', 'Không có'],
    hocVi:  ['Tiến sĩ', 'Thạc sĩ', 'Cử nhân', 'Kỹ sư'],
  }

  const fields = [
    { label: 'Tên đăng nhập',       name: 'username',         type: 'text'   },
    { label: 'Họ tên người dùng',   name: 'fullName',         type: 'text'   },
    { label: 'Email',               name: 'email',            type: 'email'  },
    { label: 'Học hàm',             name: 'hocHam',           type: 'select', optKey: 'hocHam' },
    { label: 'Học vị',              name: 'hocVi',            type: 'select', optKey: 'hocVi'  },
    { label: 'Trình độ chuyên môn', name: 'trinhDoChuyenMon', type: 'text'   },
  ]

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '8px 0' }}>
      <div className="ttk-card">
        <style>{`
          .ttk-card {
            background: linear-gradient(160deg, #e8f3fd 0%, #cfe5f9 100%);
            border-radius: 14px; padding: 28px 32px;
            box-shadow: 0 2px 16px rgba(0,90,224,0.07);
            font-family: 'Be Vietnam Pro', sans-serif;
            max-width: 680px; width: 100%;
          }
          .ttk-card h2 { font-size: 18px; font-weight: 800; color: #1a2340; margin-bottom: 22px; }
          .ttk-field { margin-bottom: 14px; }
          .ttk-field label { display: block; font-size: 13px; font-weight: 600; color: #1a2340; margin-bottom: 5px; }
          .ttk-field input, .ttk-select {
            width: 100%; padding: 8px 12px; border-radius: 8px;
            border: 1.5px solid #b8d8f0; font-size: 13.5px;
            font-family: 'Be Vietnam Pro', sans-serif; background: #fff;
            color: #1a2340; outline: none; box-sizing: border-box; transition: border-color .2s, box-shadow .2s;
          }
          .ttk-field input:focus, .ttk-select:focus { border-color: #005AE0; box-shadow: 0 0 0 3px rgba(0,90,224,0.1); }
          .ttk-field input.has-error, .ttk-select.has-error { border-color: #EF4444; }
          .ttk-select {
            appearance: none; cursor: pointer;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23005AE0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat; background-position: right 10px center; background-size: 14px; padding-right: 30px;
          }
          .ttk-field .field-error { font-size: 11.5px; color: #EF4444; margin-top: 4px; }
          .ttk-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
          .ttk-btn-cancel {
            padding: 8px 28px; border: 1.5px solid #b8d8f0; background: #fff;
            border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13.5px;
            font-family: 'Be Vietnam Pro', sans-serif; color: #1a2340; transition: border-color .2s;
          }
          .ttk-btn-cancel:hover { border-color: #005AE0; }
          .ttk-btn-save {
            padding: 8px 28px; background: linear-gradient(135deg, #005AE0, #00317A);
            color: #fff; border: none; border-radius: 8px; font-weight: 700;
            font-size: 13.5px; font-family: 'Be Vietnam Pro', sans-serif; cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,90,224,0.25); transition: opacity .2s;
          }
          .ttk-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        `}</style>

        <h2>Tạo tài khoản Biên soạn</h2>

        {fields.map(f => (
          <div className="ttk-field" key={f.name}>
            <label>{f.label}</label>
            {f.type === 'select' ? (
              <select
                name={f.name}
                className={`ttk-select${errors[f.name] ? ' has-error' : ''}`}
                value={form[f.name]}
                onChange={handleChange}
              >
                <option value="">Chọn {f.label.toLowerCase()}</option>
                {options[f.optKey].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                name={f.name}
                type={f.type}
                className={errors[f.name] ? 'has-error' : ''}
                value={form[f.name]}
                onChange={handleChange}
                disabled={saving}
              />
            )}
            {errors[f.name] && <div className="field-error">{errors[f.name]}</div>}
          </div>
        ))}

        <div className="ttk-actions">
          <button className="ttk-btn-cancel" onClick={onCancel} disabled={saving}>Hủy</button>
          <button className="ttk-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang tạo...' : 'Tạo & Gửi mail'}
          </button>
        </div>
      </div>
    </div>
  )
}