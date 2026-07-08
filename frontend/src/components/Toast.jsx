// src/components/Toast.jsx
export default function Toast({ type, message, onClose }) {
  const colors = {
    success: { bar: 'linear-gradient(90deg,#005AE0,#00317A)', text: '#374151' },
    error:   { bar: 'linear-gradient(90deg,#DC2626,#991B1B)', text: '#EF4444' },
    warning: { bar: 'linear-gradient(90deg,#D97706,#92400E)', text: '#92400E' },
  };
  const c = colors[type] || colors.success;
  const title = type === 'success' ? 'Thành công' : type === 'error' ? 'Thất bại' : 'Cảnh báo';

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      width: 320, borderRadius: 10, overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      fontFamily: "'Be Vietnam Pro', sans-serif",
      animation: 'slideIn 0.3s ease',
    }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }`}</style>
      <div style={{ background: c.bar, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{title}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>
      <div style={{ background: '#fff', padding: '14px 16px' }}>
        <p style={{ fontSize: 13, color: c.text, margin: 0 }}>{message}</p>
      </div>
    </div>
  );
}
