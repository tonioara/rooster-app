import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';

export default function RegisterRestaurant() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    restaurantName: '', restaurantAddress: '',
    openTime: '10:30', closeTime: '22:00',
    adminName: '', adminEmail: '', adminPassword: '',
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/api/restaurants/register', form);
      login(data.user, data.token);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '480px' }}>
        <div className="login-brand">
          <span className="brand-icon">◈</span>
          <h1>RoosterApp</h1>
          <p>Register your restaurant</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Restaurant info */}
          <div style={{ padding: '0.75rem', background: 'var(--cream)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
              🏠 Restaurant info
            </div>
            <div className="field-group" style={{ marginBottom: '0.75rem' }}>
              <label>Restaurant name</label>
              <input type="text" value={form.restaurantName}
                onChange={e => update('restaurantName', e.target.value)}
                placeholder="e.g. Rooster Café" required />
            </div>
            <div className="field-group" style={{ marginBottom: '0.75rem' }}>
              <label>Address (optional)</label>
              <input type="text" value={form.restaurantAddress}
                onChange={e => update('restaurantAddress', e.target.value)}
                placeholder="e.g. Buenos Aires, Argentina" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="field-group" style={{ flex: 1 }}>
                <label>Opens at</label>
                <input type="time" value={form.openTime}
                  onChange={e => update('openTime', e.target.value)} required />
              </div>
              <div className="field-group" style={{ flex: 1 }}>
                <label>Closes at</label>
                <input type="time" value={form.closeTime}
                  onChange={e => update('closeTime', e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Admin info */}
          <div style={{ padding: '0.75rem', background: 'var(--cream)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
              👤 Admin account
            </div>
            <div className="field-group" style={{ marginBottom: '0.75rem' }}>
              <label>Your name</label>
              <input type="text" value={form.adminName}
                onChange={e => update('adminName', e.target.value)}
                placeholder="e.g. Amber" required />
            </div>
            <div className="field-group" style={{ marginBottom: '0.75rem' }}>
              <label>Email</label>
              <input type="email" value={form.adminEmail}
                onChange={e => update('adminEmail', e.target.value)}
                placeholder="you@restaurant.com" required />
            </div>
            <div className="field-group">
              <label>Password</label>
              <input type="password" value={form.adminPassword}
                onChange={e => update('adminPassword', e.target.value)}
                placeholder="Min. 6 characters" required minLength={6} />
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn-accent" disabled={loading} style={{ padding: '0.85rem' }}>
            {loading ? 'Creating...' : '🚀 Create restaurant & account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
            Already have an account?{' '}
            <Link to="/" style={{ color: 'var(--rose-dark)', fontWeight: '600' }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
