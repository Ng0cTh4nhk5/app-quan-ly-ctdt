// src/pages/ChuongTrinhDaoTao/ChuongTrinhDaoTao.jsx  –  Role: Quản lý
import { useState, useEffect, useCallback } from 'react'
import Toast from '../../components/Toast'
import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from '../../services/programService'

const TRINH_DO_OPTIONS = ['Đại học', 'Thạc sĩ', 'Tiến sĩ']
const HINH_THUC_OPTIONS = ['Chính quy', 'Vừa học vừa làm', 'Từ xa']
const TRANG_THAI_OPTIONS = ['Đang mở', 'Chưa mở', 'Đang tạm dừng']

const NGANH_OPTIONS = [
  { label: 'Khoa học máy tính',    abbr: 'KHMT', code: '7480101' },
  { label: 'Công nghệ thông tin',  abbr: 'CNTT', code: '7480201' },
  { label: 'Hệ thống thông tin',   abbr: 'HTTT', code: '7480104' },
  { label: 'Trí tuệ nhân tạo',     abbr: 'TTNT', code: '7480124' },
  { label: 'Kỹ thuật phần mềm',    abbr: 'KTPM', code: '7480103' },
  { label: 'An toàn thông tin',    abbr: 'ATTT', code: '7480123' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR + i)

const STATUS_STYLE = {
  'Đang mở':        { bg: '#CCFBF1', color: '#0D9488' },
  'Chưa mở':        { bg: '#F1F5F9', color: '#64748B' },
  'Đang tạm dừng':  { bg: '#FFEDD5', color: '#D97706' },
  'Đang soạn':      { bg: '#FEF3C7', color: '#D97706' },
}

const EMPTY_ADD_FORM = {
  nganhDaoTao: '',
  trinhDoDaoTao: 'Đại học',
  hinhThucDaoTao: 'Chính quy',
  namApDung: String(CURRENT_YEAR),
}

const EMPTY_EDIT_FORM = {
  maCTDT: '',
  tenCTDT: '',
  tenCTDTEng: '',
  nganhDaoTao: '',
  trinhDo: 'Đại học',
  hinhThuc: 'Chính quy',
  trangThai: 'Đang mở',
}

const LIMIT = 10

const generateMaChuongTrinh = ({ nganhCode }) => {
  return nganhCode || '7480201'
}

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #D1D5DB',
  borderRadius: 8, fontSize: 14, outline: 'none', color: '#374151',
  background: '#fff', height: 44, boxSizing: 'border-box',
}

// ── Modal THÊM mới ──
function AddProgramModal({ form, setForm, onClose, onSubmit, isSubmitting }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: 12, width: 560, maxWidth: '92vw', padding: '28px 32px', boxShadow: '0 8px 40px rgba(0,0,0,0.22)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>Thêm Chương trình đào tạo mới</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6B7280' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 26 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Ngành đào tạo</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.nganhDaoTao}
              onChange={(e) => setForm({ ...form, nganhDaoTao: e.target.value })}
            >
              <option value="">-- Chọn ngành --</option>
              {NGANH_OPTIONS.map((n) => <option key={n.label} value={n.label}>{n.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Trình độ đào tạo</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.trinhDoDaoTao}
              onChange={(e) => setForm({ ...form, trinhDoDaoTao: e.target.value })}
            >
              {TRINH_DO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Hình thức đào tạo</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.hinhThucDaoTao}
              onChange={(e) => setForm({ ...form, hinhThucDaoTao: e.target.value })}
            >
              {HINH_THUC_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Dự kiến năm áp dụng</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.namApDung}
              onChange={(e) => setForm({ ...form, namApDung: e.target.value })}
            >
              {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '8px 24px', border: '1.5px solid #D1D5DB', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Hủy</button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            style={{ padding: '8px 24px', border: 'none', borderRadius: 8, background: isSubmitting ? '#9CA3AF' : 'linear-gradient(90deg,#005AE0,#00317A)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Tạo'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal SỬA ──
function EditProgramModal({ form, setForm, onClose, onSubmit, isSubmitting }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: 12, width: 560, maxWidth: '92vw', padding: '28px 32px', boxShadow: '0 8px 40px rgba(0,0,0,0.22)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>Chỉnh sửa chương trình đào tạo</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6B7280' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 26 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Mã chương trình</label>
            <input style={inputStyle} value={form.maCTDT} disabled />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Tên chương trình</label>
            <input
              style={inputStyle}
              value={form.tenCTDT}
              onChange={(e) => setForm({ ...form, tenCTDT: e.target.value })}
              placeholder="VD: Khoa học máy tính"
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Trình độ đào tạo</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.trinhDo}
              onChange={(e) => setForm({ ...form, trinhDo: e.target.value })}
            >
              {TRINH_DO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Hình thức đào tạo</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.hinhThuc}
              onChange={(e) => setForm({ ...form, hinhThuc: e.target.value })}
            >
              {HINH_THUC_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Trạng thái</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.trangThai}
              onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
            >
              {TRANG_THAI_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '8px 24px', border: '1.5px solid #D1D5DB', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Hủy</button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            style={{ padding: '8px 24px', border: 'none', borderRadius: 8, background: isSubmitting ? '#9CA3AF' : 'linear-gradient(90deg,#005AE0,#00317A)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal xác nhận xoá ──
function ConfirmDeleteModal({ name, onClose, onConfirm, deleting }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: 12, width: 420, maxWidth: '92vw', boxShadow: '0 8px 40px rgba(0,0,0,0.22)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(90deg,#005AE0,#00317A)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>Xóa chương trình đào tạo</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#fff' }}>×</button>
        </div>
        <div style={{ padding: '28px 24px 24px' }}>
          <p style={{ fontSize: 14, color: '#374151', marginBottom: 28 }}>
            Bạn muốn xóa chương trình <strong>{name}</strong>?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button onClick={onClose} disabled={deleting} style={{ padding: '8px 28px', border: '1.5px solid #D1D5DB', borderRadius: 8, background: '#fff', fontSize: 14, cursor: 'pointer', color: '#374151' }}>Hủy</button>
            <button onClick={onConfirm} disabled={deleting} style={{ padding: '8px 28px', border: 'none', borderRadius: 8, background: 'linear-gradient(90deg,#005AE0,#00317A)', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
              {deleting ? 'Đang xoá...' : 'Đồng ý'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChuongTrinhDaoTao() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM)
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (type, message) => setToast({ type, message })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { ok, data } = await getPrograms({ search })
      if (ok) {
        setList(Array.isArray(data) ? data : [])
      } else {
        showToast('error', 'Không thể tải danh sách chương trình đào tạo')
      }
    } catch {
      showToast('error', 'Lỗi kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 300)
    return () => clearTimeout(t)
  }, [search])

  const totalPages = Math.max(1, Math.ceil(list.length / LIMIT))
  const paged = list.slice((page - 1) * LIMIT, page * LIMIT)

  // ── Thêm mới ──
  const handleCreate = async () => {
    if (!addForm.nganhDaoTao) {
      showToast('error', 'Vui lòng chọn ngành đào tạo!')
      return
    }
    setIsSubmitting(true)

    const nganhObj = NGANH_OPTIONS.find((n) => n.label === addForm.nganhDaoTao)
    const maCTDT = generateMaChuongTrinh({ nganhCode: nganhObj?.code })

    const namApDungIso = new Date(`${addForm.namApDung}-01-01T00:00:00.000Z`).toISOString()

    const payload = {
      maCTDT,
      tenCTDT: addForm.nganhDaoTao,
      nganhDaoTao: addForm.nganhDaoTao,
      trinhDo: addForm.trinhDoDaoTao,
      hinhThuc: addForm.hinhThucDaoTao,
      namApDung: namApDungIso,
    }

    const { ok, data } = await createProgram(payload)
    setIsSubmitting(false)

    if (!ok) {
      showToast('error', data?.message ?? 'Tạo chương trình thất bại')
      return
    }
    setShowAddModal(false)
    setAddForm(EMPTY_ADD_FORM)
    await fetchData()
    showToast('success', `Chương trình ${addForm.nganhDaoTao} đã được tạo!`)
  }

  // ── Sửa ──
  const handleEditClick = (item) => {
    setEditItem(item)
    setEditForm({
      maCTDT: item.maCTDT || '',
      tenCTDT: item.tenCTDT || '',
      tenCTDTEng: item.tenCTDTEng ?? '',
      nganhDaoTao: item.nganhDaoTao ?? '',
      trinhDo: item.trinhDo || 'Đại học',
      hinhThuc: item.hinhThuc || 'Chính quy',
      trangThai: item.trangThai || 'Đang mở',
    })
  }

  const handleSave = async () => {
    if (!editForm.tenCTDT.trim()) {
      showToast('error', 'Vui lòng nhập tên chương trình!')
      return
    }
    setIsSubmitting(true)
    
    // Đồng bộ truyền chuẩn duy nhất trường maCTDT lên API update
    const targetId = editItem.maCTDT;

    const { ok, data } = await updateProgram(targetId, {
      ...editForm,
      namApDung: editItem.namApDung ?? new Date().toISOString(),
    })
    setIsSubmitting(false)

    if (!ok) {
      showToast('error', data?.message ?? 'Cập nhật thất bại')
      return
    }
    setEditItem(null)
    await fetchData()
    showToast('success', `Chương trình ${editForm.tenCTDT} đã được cập nhật!`)
  }

  // ── Xoá ──
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    
    // Trích xuất chuẩn xác trường duy nhất maCTDT để đưa qua file service xử lý phương thức
    const targetId = deleteConfirm.maCTDT;

    const { ok, data } = await deleteProgram(targetId)
    setDeleting(false)
    setDeleteConfirm(null)

    if (!ok) {
      showToast('error', data?.message ?? 'Xóa thất bại! Vui lòng kiểm tra lại cấu trúc URL tại file programService.js.')
      return
    }
    await fetchData()
    showToast('success', `Chương trình ${deleteConfirm.tenCTDT} đã được xóa!`)
  }

  return (
    <div style={{ padding: 24, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,90,224,0.07)', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>Chương trình đào tạo</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 14 }}>🔍</span>
              <input
                placeholder="Tìm kiếm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 32, paddingRight: 12, height: 36, border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', width: 200 }}
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              style={{ background: 'linear-gradient(90deg,#005AE0,#00317A)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              + Thêm mới
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #005AE0', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spinCTDT 1s linear infinite' }} />
            <style>{`@keyframes spinCTDT { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : paged.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: 14 }}>
            Chưa có chương trình đào tạo
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F3F4F6' }}>
                  {['#', 'Mã chương trình', 'Tên chương trình', 'Trình độ đào tạo', 'Hình thức đào tạo', 'Trạng thái', 'Hành động'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 13, fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((p, idx) => {
                  const safeTrangThai = p.trangThai || 'Đang mở';
                  const st = STATUS_STYLE[safeTrangThai] || { bg: '#E5E7EB', color: '#374151' }
                  return (
                    <tr
                      key={p.maCTDT || idx}
                      style={{ borderBottom: '1px solid #F3F4F6', height: 56 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F0F7FF')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0 12px', fontSize: 13, color: '#9CA3AF' }}>{String((page - 1) * LIMIT + idx + 1).padStart(2, '0')}</td>
                      <td style={{ padding: '0 12px', fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{p.maCTDT}</td>
                      <td style={{ padding: '0 12px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{p.tenCTDT}</td>
                      <td style={{ padding: '0 12px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{p.trinhDo}</td>
                      <td style={{ padding: '0 12px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{p.hinhThuc}</td>
                      <td style={{ padding: '0 12px', whiteSpace: 'nowrap' }}>
                        <span style={{ background: st.bg, color: st.color, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600, display: 'inline-block' }}>{safeTrangThai}</span>
                      </td>
                      <td style={{ padding: '0 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <button title="Sửa" onClick={() => handleEditClick(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button title="Xóa" onClick={() => setDeleteConfirm(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && list.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Hiển thị {paged.length} trên {list.length} kết quả</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                style={{ border: '1px solid #E5E7EB', background: '#fff', borderRadius: 6, width: 30, height: 30, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ border: p === page ? 'none' : '1px solid #E5E7EB', background: p === page ? 'linear-gradient(90deg,#005AE0,#00317A)' : '#fff', color: p === page ? '#fff' : '#374151', borderRadius: 6, width: 30, height: 30, cursor: 'pointer', fontWeight: p === page ? 700 : 400 }}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ border: '1px solid #E5E7EB', background: '#fff', borderRadius: 6, width: 30, height: 30, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>›</button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddProgramModal
          form={addForm}
          setForm={setAddForm}
          onClose={() => { setShowAddModal(false); setAddForm(EMPTY_ADD_FORM) }}
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
        />
      )}

      {editItem && (
        <EditProgramModal
          form={editForm}
          setForm={setEditForm}
          onClose={() => setEditItem(null)}
          onSubmit={handleSave}
          isSubmitting={isSubmitting}
        />
      )}

      {deleteConfirm && (
        <ConfirmDeleteModal
          name={deleteConfirm.tenCTDT}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteConfirm}
          deleting={deleting}
        />
      )}
    </div>
  )
}