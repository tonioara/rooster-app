import { useEffect, useState } from 'react';
import API from '../api/client';

export default function RequestsBell({ onClick }) {
  const [count, setCount] = useState(0);

  const fetchPending = async () => {
    try {
      const { data } = await API.get('/api/requests/pending');
      setCount(Array.isArray(data) ? data.length : 0);
    } catch {
      setCount(0);
    }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button onClick={onClick} title="Solicitudes pendientes" style={{
      position: 'relative', background: 'transparent',
      border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: '8px',
      color: 'rgba(255,255,255,0.85)', padding: '0.3rem 0.7rem',
      cursor: 'pointer', fontSize: '1rem', display: 'flex',
      alignItems: 'center', gap: '0.3rem',
    }}>
      🔔
      {count > 0 && (
        <span style={{
          position: 'absolute', top: '-6px', right: '-6px',
          background: 'var(--rose)', color: '#fff', borderRadius: '50%',
          width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: '700',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {count}
        </span>
      )}
    </button>
  );
}
