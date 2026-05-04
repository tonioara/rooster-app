export default function Toast({ toast }) {
  if (!toast) return null;

  const colors = {
    success: { bg: '#e8f5e9', border: '#a5d6a7', color: '#2e7d32' },
    error:   { bg: '#fde8e8', border: '#ef9a9a', color: '#c0392b' },
    info:    { bg: '#fff8e1', border: '#ffe082', color: '#b8860b' },
  };

  const style = colors[toast.type] || colors.info;

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      background: style.bg,
      border: `1.5px solid ${style.border}`,
      color: style.color,
      borderRadius: '12px',
      padding: '0.85rem 1.25rem',
      fontWeight: '600',
      fontSize: '0.9rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      maxWidth: '90vw',
      textAlign: 'center',
      animation: 'slideDown 0.3s ease',
      whiteSpace: 'nowrap',
    }}>
      {toast.message}
    </div>
  );
}
