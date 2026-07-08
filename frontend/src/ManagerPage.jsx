// ManagerPage.jsx
// Tự render Header + Navbar. MonHoc/ThanhVien/ChuongTrinhDaoTao đã được bỏ <Navbar> bên trong.

import { useState } from 'react';
import MonHoc from './pages/MonHoc/MonHoc';
import ThanhVien from './pages/ThanhVien/ThanhVien';
import ChuongTrinhDaoTao from './pages/ChuongTrinhDaoTao/ChuongTrinhDaoTao';

export default function ManagerPage({ user, onLogout }) {
  const [tab, setTab] = useState('home');
  const [showDropdown, setShowDropdown] = useState(false);

  const displayName = user?.name || user?.username || 'Quản lý';
  const userInitial = displayName.charAt(0).toUpperCase();

  const NAV_TABS = [
    { key: 'home',      label: 'Trang chủ' },
    { key: 'ctdt',      label: 'Chương trình đào tạo' },
    { key: 'monhoc',    label: 'Môn Học' },
    { key: 'thanhvien', label: 'Thành viên' },
  ];

  return (
    <>
      <style>{`* { margin:0; padding:0; box-sizing:border-box; } body { background:#f0f4f8; overflow-x:hidden; }`}</style>
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#f0f4f8', fontFamily:"'Be Vietnam Pro','Segoe UI',sans-serif" }}>

        {/* Header */}
        <div style={{ flexShrink:0, background:'#fff', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:64, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
            <div style={{ fontWeight:800, fontSize:22, color:'#005AE0' }}>Logo</div>
            <div style={{ position:'relative' }}>
              <svg style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input placeholder="Tìm kiếm" style={{ paddingLeft:32, paddingRight:12, height:36, border:'1.5px solid #E5E7EB', borderRadius:20, fontSize:14, outline:'none', width:220, background:'#F9FAFB', color:'#374151' }} />
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            {/* Chat */}
            <button style={{ background:'none', border:'none', cursor:'pointer', padding:6, color:'#6B7280' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            {/* Bell */}
            <button style={{ background:'none', border:'none', cursor:'pointer', padding:6, color:'#6B7280' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            {/* User */}
            <div style={{ position:'relative' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }} onClick={() => setShowDropdown(p => !p)}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#005AE0,#00317A)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14 }}>
                  {userInitial}
                </div>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, lineHeight:1.2, color:'#111827' }}>{displayName}</div>
                  <div style={{ fontSize:12, color:'#6B7280' }}>Quản lý</div>
                </div>
                <span style={{ fontSize:10, color:'#6B7280' }}>▼</span>
              </div>
              {showDropdown && (
                <div style={{ position:'absolute', right:0, top:48, background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, boxShadow:'0 4px 16px rgba(0,0,0,0.1)', zIndex:200, minWidth:140 }}>
                  <div style={{ padding:'10px 16px', cursor:'pointer', fontSize:14, color:'#374151' }} onClick={() => { setShowDropdown(false); onLogout?.(); }}>
                    → Đăng xuất
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navbar */}
        <div style={{ flexShrink:0, background:'linear-gradient(90deg,#005AE0,#00317A)', display:'flex', alignItems:'stretch', padding:'0 24px', gap:4 }}>
          {NAV_TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding:'14px 28px', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:15,
              background: tab === t.key ? 'rgba(255,255,255,0.18)' : 'transparent',
              color:'#fff', fontWeight: tab === t.key ? 700 : 400,
              borderBottom: tab === t.key ? '3px solid #fff' : '3px solid transparent',
              transition:'all 0.18s',
              whiteSpace: 'nowrap',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex:1 }}>
          {tab === 'ctdt'      && <ChuongTrinhDaoTao />}
          {tab === 'monhoc'    && <MonHoc />}
          {tab === 'thanhvien' && <ThanhVien />}
          {tab === 'home'      && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'calc(100vh - 116px)' }}>
              <div style={{ textAlign:'center', color:'#64748b' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>👋</div>
                <div style={{ fontSize:20, fontWeight:700, color:'#1a2340', marginBottom:8 }}>Chào mừng, {displayName}!</div>
                <div style={{ fontSize:14 }}>Chọn mục trên thanh điều hướng để bắt đầu.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}