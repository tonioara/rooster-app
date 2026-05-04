import { useState, useEffect } from 'react';
import { registerPushNotifications } from '../utils/pushUtils';

export default function NotificationButton() {
  const [status, setStatus] = useState('unknown');

  useEffect(() => {
    if (!('Notification' in window)) {
      setStatus('unsupported');
      return;
    }
    setStatus(Notification.permission);
  }, []);

  const handleEnable = async () => {
    await registerPushNotifications();
    setStatus(Notification.permission);
  };

  if (status === 'granted') {
    return (
      <span style={{
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.6)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem'
      }}>
        🔔 Activas
      </span>
    );
  }

  if (status === 'unsupported') return null;

  return (
    <button
      onClick={handleEnable}
      style={{
        background: 'var(--rose)',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        padding: '0.3rem 0.75rem',
        fontSize: '0.78rem',
        fontWeight: '700',
        cursor: 'pointer',
        animation: 'pulse 2s infinite',
      }}
    >
      🔔 Activar notificaciones
    </button>
  );
}
