// src/pages/ThanhVien/PhanCongSoanDeCuong.jsx
import { useState, useEffect } from 'react'
import { getUnassignedSubjects, createAssignment } from '../../services/subjectService'
import { memberGetList } from '../../services/memberService'

export default function PhanCongSoanDeCuong({ onSave, onCancel, showToast }) {
  const [monHocList, setMonHocList]       = useState([])
  const [memberList, setMemberList]       = useState([])
  const [selectedMons, setSelectedMons]   = useState([])
  const [selectedCompiler, setSelectedCompiler] = useState('')
  const [search, setSearch]               = useState('')
  const [loadingMon, setLoadingMon]       = useState(false)
  const [loadingMem, setLoadingMem]       = useState(false)
  const [saving, setSaving]               = useState(false)

  // ── Fetch môn học chưa phân công ──────────────────────────────
  useEffect(() => {
    const fetchMonHoc = async () => {
      setLoadingMon(true)
      try {
        const json = await getUnassignedSubjects({ search })
        const arr  = Array.isArray(json) ? json : (json.data ?? json.items ?? [])
        setMonHocList(arr.map(s => ({
          ma:  s.maMonHoc  ?? s.ma  ?? '',
          ten: s.tenMonHoc ?? s.ten ?? '',
        })))
      } catch {
        showToast?.('error', 'Không thể tải danh sách môn học')
      } finally {
        setLoadingMon(false)
      }
    }
    fetchMonHoc()
  }, [search])

  // ── Fetch thành viên biên soạn (roleId = 3) ───────────────────
  useEffect(() => {
    const fetchMembers = async () => {
      setLoadingMem(true)
      try {
        const { ok, data: json } = await memberGetList({ roleId: 3 })
        if (!ok) throw new Error('request failed')
        const arr = Array.isArray(json) ? json : (json.data ?? json.items ?? [])
        setMemberList(arr.map(m => ({
          id:   m.id,
          name: m.fullName ?? m.hoTenNguoiDung ?? m.username ?? `#${m.id}`,
        })))
      } catch {
        showToast?.('error', 'Không thể tải danh sách thành viên')
      } finally {
        setLoadingMem(false)
      }
    }
    fetchMembers()
  }, [])

  const toggleMon = (ma) =>
    setSelectedMons(prev =>
      prev.includes(ma) ? prev.filter(i => i !== ma) : [...prev, ma]
    )

  // ── POST /manager/assignments ──────────────────────────────────
  const handleCreate = async () => {
    if (!selectedCompiler) {
      showToast?.('error', 'Vui lòng chọn thành viên biên soạn')
      return
    }
    if (selectedMons.length === 0) {
      showToast?.('error', 'Vui lòng chọn ít nhất một môn học')
      return
    }

    setSaving(true)
    try {
      await createAssignment({
        compilerId: Number(selectedCompiler),
        subjectIds: selectedMons,
      })
      showToast?.('success', `Phân công thành công ${selectedMons.length} môn học`)
      onSave?.()
    } catch (err) {
      const data = err?.response?.data
      showToast?.('error', data?.message ?? data?.title ?? 'Phân công thất bại')
    } finally {
      setSaving(false)
    }
  }

  const filteredMon = monHocList.filter(m =>
    m.ten.toLowerCase().includes(search.toLowerCase()) ||
    m.ma.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="pc-container">
      <style>{`
        .pc-title { font-size: 18px; font-weight: 800; color: #1a2340; margin-bottom: 20px; }

        .pc-member-select { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
        .pc-member-select label { font-size: 14px; font-weight: 600; color: #475569; }
        .pc-select-input {
          padding: 8px 12px; border: 1.5px solid #b8d8f0; border-radius: 8px;
          width: 280px; outline: none; background: #fff; cursor: pointer; color: #1a2340;
          font-size: 13.5px;
        }
        .pc-select-input:focus { border-color: #005AE0; box-shadow: 0 0 0 3px rgba(0,90,224,0.1); }

        .form-card {
          background: linear-gradient(160deg, #e8f3fd 0%, #cfe5f9 100%);
          border-radius: 14px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .split-layout { display: flex; gap: 24px; margin-bottom: 20px; align-items: stretch; }

        .panel-white { flex: 1.3; background: #fff; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; }
        .panel-title { font-size: 15px; font-weight: 700; margin-bottom: 15px; color: #1a2340; }

        .search-box { position: relative; margin-bottom: 15px; }
        .search-box input {
          width: 100%; padding: 8px 12px 8px 35px; border: 1px solid #e2e8f0;
          border-radius: 20px; font-size: 13px; outline: none; box-sizing: border-box;
        }
        .search-box input:focus { border-color: #005AE0; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #94a3b8; }

        .table-scroll { flex: 1; height: 280px; overflow-y: auto; border: 1px solid #f1f5f9; border-radius: 4px; }
        .inner-table { width: 100%; border-collapse: collapse; }
        .inner-table th { position: sticky; top: 0; background: #f8fafc; text-align: left; padding: 10px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0; z-index: 1; }
        .inner-table td { padding: 12px 10px; font-size: 13px; border-bottom: 1px solid #f8fafc; cursor: pointer; }
        .inner-table tr:hover td { background: #f0f9ff; }
        .inner-table tr.row-active td { background: #e0f2fe; }

        .panel-outline { flex: 0.7; background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #b8d8f0; }
        .selected-list { list-style: none; padding: 0; margin-top: 15px; }
        .selected-item {
          font-size: 13.5px; padding: 7px 0; color: #1e293b;
          display: flex; align-items: flex-start; gap: 8px;
          border-bottom: 1px solid #f1f5f9;
        }
        .selected-item::before { content: "•"; color: #005AE0; font-weight: bold; flex-shrink: 0; margin-top: 1px; }
        .empty-note { color: #94a3b8; font-style: italic; font-size: 13px; margin-top: 12px; }

        .loading-row { text-align: center; padding: 30px; color: #64748b; font-size: 13px; }

        .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; }
        .btn-cancel {
          padding: 8px 30px; border: 1.5px solid #005AE0; background: #fff;
          color: #005AE0; border-radius: 8px; font-weight: 600; cursor: pointer;
          font-family: 'Be Vietnam Pro', sans-serif;
        }
        .btn-cancel:hover { background: #f0f7ff; }
        .btn-save {
          padding: 8px 30px; background: linear-gradient(135deg, #005AE0, #00317A);
          color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;
          font-family: 'Be Vietnam Pro', sans-serif;
        }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .count-badge {
          display: inline-flex; align-items: center; justify-content: center;
          background: #005AE0; color: #fff; border-radius: 50%;
          width: 20px; height: 20px; font-size: 11px; font-weight: 700;
          margin-left: 6px;
        }
      `}</style>

      <div className="pc-title">Phân công soạn đề cương</div>

      {/* Chọn thành viên biên soạn */}
      <div className="pc-member-select">
        <label>Thành viên biên soạn</label>
        <select
          className="pc-select-input"
          value={selectedCompiler}
          onChange={e => setSelectedCompiler(e.target.value)}
          disabled={loadingMem}
        >
          <option value="">
            {loadingMem ? 'Đang tải...' : 'Tìm thành viên'}
          </option>
          {memberList.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="form-card">
        <div className="split-layout">

          {/* Panel Trái: Danh sách môn học chưa phân công */}
          <div className="panel-white">
            <div className="panel-title">
              Danh sách môn học chưa phân công
            </div>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                placeholder="Tìm kiếm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="table-scroll">
              {loadingMon ? (
                <div className="loading-row">⏳ Đang tải...</div>
              ) : filteredMon.length === 0 ? (
                <div className="loading-row">Không có môn học nào</div>
              ) : (
                <table className="inner-table">
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>Chọn</th>
                      <th style={{ width: 110 }}>Mã môn học</th>
                      <th>Tên môn học</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMon.map(m => {
                      const checked = selectedMons.includes(m.ma)
                      return (
                        <tr
                          key={m.ma}
                          className={checked ? 'row-active' : ''}
                          onClick={() => toggleMon(m.ma)}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={checked} readOnly />
                          </td>
                          <td style={{ color: '#94a3b8' }}>{m.ma}</td>
                          <td style={{ fontWeight: 500 }}>{m.ten}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Panel Phải: Các môn đã chọn */}
          <div className="panel-outline">
            <div className="panel-title">
              Các môn học đã chọn
              {selectedMons.length > 0 && (
                <span className="count-badge">{selectedMons.length}</span>
              )}
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0' }} />
            <ul className="selected-list">
              {selectedMons.length === 0 ? (
                <p className="empty-note">Chưa chọn môn nào</p>
              ) : (
                selectedMons.map(ma => {
                  const found = monHocList.find(m => m.ma === ma)
                  return (
                    <li className="selected-item" key={ma}>
                      {found?.ten ?? ma}
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-cancel" onClick={onCancel} disabled={saving}>Hủy</button>
          <button
            className="btn-save"
            onClick={handleCreate}
            disabled={saving || selectedMons.length === 0 || !selectedCompiler}
          >
            {saving ? 'Đang lưu...' : 'Tạo'}
          </button>
        </div>
      </div>
    </div>
  )
}