import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';
import { useState } from 'react';

export default function RestaurantSelector() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const handleSelect = async (restaurant) => {
    setLoading(restaurant._id);
    try {
      const { data } = await API.post('/api/users/select-restaurant', {
        restaurantId: restaurant._id,
      });
      // Actualizar token y user con el restaurante activo
      login(data.user, data.token);
      navigate('/admin-dashboard');
    } catch (err) {
      alert('Error selecting restaurant.');
    } finally {
      setLoading(null);
    }
  };

  const restaurants = user?.managedRestaurants || [];

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '460px' }}>
        <div className="login-brand">
          <span className="brand-icon">◈</span>
          <h1>RoosterApp</h1>
          <p>Welcome back, <strong>{user?.name}</strong></p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', textAlign: 'center', marginBottom: '1.25rem' }}>
            Which restaurant are you managing today?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {restaurants.map(r => (
              <button
                key={r._id}
                onClick={() => handleSelect(r)}
                disabled={loading === r._id}
                style={{
                  background: loading === r._id ? 'var(--ink-soft)' : 'var(--ink)',
                  color: 'var(--cream)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.18s',
                  opacity: loading && loading !== r._id ? 0.5 : 1,
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.2rem' }}>
                    {r.name}
                  </div>
                  {r.address && (
                    <div style={{ fontSize: '0.78rem', opacity: 0.7 }}>{r.address}</div>
                  )}
                </div>
                <span style={{ fontSize: '1.2rem' }}>
                  {loading === r._id ? '⏳' : '→'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {restaurants.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--ink-muted)', padding: '1rem' }}>
            No restaurants assigned to your account.
          </div>
        )}
      </div>
    </div>
  );
}
