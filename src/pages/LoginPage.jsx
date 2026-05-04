import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/api/users/login', { email, password });
      login(data.user, data.token);
      navigate(data.redirectUrl);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login error.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-icon">◈</span>
          <h1>RoosterApp</h1>
          <p>Staff & schedule management</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com" required autoFocus />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="password"
                type={showPassword ? 'text' : 'password'}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--ink-muted)', padding: '0' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--cream)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
            <strong style={{ display: 'block', marginBottom: '0.3rem' }}>Test credentials</strong>
            <div>Admin → amber@rooster.com / amber123</div>
            <div>Employee → crystal@rooster.com / crystal123</div>
          </div>
        </form>
      </div>
    </div>
  );
}
