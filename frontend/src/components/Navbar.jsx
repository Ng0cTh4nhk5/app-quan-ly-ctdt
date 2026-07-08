// src/components/Navbar.jsx
// Dùng chung cho cả role "quan-ly" và "bien-soan"
// Props:
//   role      : "quan-ly" | "bien-soan"
//   activeTab : tên tab đang active (optional, default từ location)

import { useState } from 'react';

const NAV_ITEMS = {
  'quan-ly': ['Trang chủ', 'Môn Học', 'Thành viên'],
  'bien-soan': ['Trang chủ', 'Môn Học'],
};

export default function Navbar({ role = 'quan-ly', activeTab: activeProp }) {
  const [active, setActive] = useState(activeProp || 'Trang chủ');
  const [showDropdown, setShowDropdown] = useState(false);

  const items = NAV_ITEMS[role] || NAV_ITEMS['quan-ly'];

  const roleLabel = role === 'bien-soan' ? 'Biên soạn' : 'Quản lý';

  return (
    <>
      <style>{`
        .navbar-header {
          background: #fff;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .navbar-logo { font-weight: 800; font-size: 22px; color: #005AE0; }
        .navbar-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg,#005AE0,#00317A);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 14px;
          cursor: pointer;
        }
        .navbar-tabs {
          background: linear-gradient(90deg,#005AE0,#00317A);
          padding: 0 24px;
          display: flex;
          gap: 4px;
        }
        .navbar-tab {
          padding: 14px 28px;
          border: none;
          background: transparent;
          color: #fff;
          font-size: 15px;
          cursor: pointer;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 400;
          transition: background 0.18s;
        }
        .navbar-tab.active {
          background: rgba(255,255,255,0.18);
          font-weight: 700;
          border-radius: 6px 6px 0 0;
        }
        .navbar-tab:hover:not(.active) { background: rgba(255,255,255,0.08); }
      `}</style>

      <div className="navbar-header">
        <div className="navbar-logo">Logo</div>
        <div style={{ position: 'relative' }}>
          <div className="navbar-avatar" onClick={() => setShowDropdown(!showDropdown)}>
            {roleLabel.charAt(0)}
          </div>
          {showDropdown && (
            <div style={{
              position: 'absolute', right: 0, top: 44,
              background: '#fff', border: '1px solid #E5E7EB',
              borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              zIndex: 200, minWidth: 140,
            }}>
              <div style={{ padding: '10px 16px', fontSize: 13, color: '#374151', fontWeight: 600 }}>
                {roleLabel}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="navbar-tabs">
        {items.map(tab => (
          <button
            key={tab}
            className={`navbar-tab${active === tab ? ' active' : ''}`}
            onClick={() => setActive(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </>
  );
}
