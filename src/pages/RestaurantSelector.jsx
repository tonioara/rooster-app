import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';

export default function RestaurantSelector() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const restaurants = user?.managedRestaurants || [];

  const handleSelect = async (restaurant) => {
    setLoading(restaurant._id);
    try {
      const { data } = await API.post('/api/users/select-restaurant', {
        restaurantId: restaurant._id,
      });
      await login(data.user, data.token);
      navigate('/admin-dashboard');
    } catch (err) {
      alert('Error selecting restaurant.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '460px' }}>
        <div className="login-brand">
          <span className="brand-icon">◈</span>
          <h1>RoosterApp</h1>
          <p>Welcome, <strong>{user?.name}</strong></p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--ink-muted)', marginBottom: '1.25rem' }}>
          Which restaurant are you managing today?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {restaurants.map(r => (
            <button key={r._id} onClick={() => handleSelect(r)}
              disabled={!!loading}
              style={{
                background: loading === r._id ? 'var(--ink-soft)' : 'var(--ink)',
                color: 'var(--cream)', border: 'none', borderRadius: '12px',
                padding: '1rem 1.25rem', cursor: 'pointer', fontFamily: 'inherit',
                textAlign: 'left', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', opacity: loading && loading !== r._id ? 0.5 : 1,
                transition: 'all 0.18s',
              }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.2rem' }}>
                  {r.name}
                </div>
                {r.address && (
                  <div style={{ fontSize: '0.78rem', opacity: 0.7 }}>{r.address}</div>
                )}
                <div style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: '2px' }}>
                  🕐 {r.openTime || '10:30'} — {r.closeTime || '22:00'}
                </div>
              </div>
              <span style={{ fontSize: '1.2rem' }}>
                {loading === r._id ? '⏳' : '→'}
              </span>
            </button>
          ))}
        </div>

        {/* ✅ Botón para crear un nuevo restaurante */}
        <button
          onClick={() => navigate('/setup')}
          style={{
            width: '100%', padding: '0.85rem', borderRadius: '12px',
            border: '1.5px dashed var(--border)', background: 'transparent',
            color: 'var(--ink-muted)', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.9rem', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '0.5rem',
            transition: 'all 0.18s',
          }}
          onMouseOver={e => e.currentTarget.style.borderColor = 'var(--rose)'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          ＋ Add another restaurant
        </button>
      </div>
    </div>
  );
}
