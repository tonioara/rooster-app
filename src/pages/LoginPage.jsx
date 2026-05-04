import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import API from '../api/client';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
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
      const msg = err.response?.data?.message || t('login.error_generic');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleLang = () => {
    const next = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(next);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Selector de idioma */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button onClick={toggleLang} style={{
            background: 'transparent', border: '1.5px solid var(--border)',
            borderRadius: '20px', padding: '0.2rem 0.75rem',
            fontSize: '0.75rem', cursor: 'pointer', color: 'var(--ink-muted)',
            fontFamily: 'inherit',
          }}>
            {i18n.language.startsWith('es') ? '🇬🇧 EN' : '🇦🇷 ES'}
          </button>
        </div>

        <div className="login-brand">
          <span className="brand-icon">◈</span>
          <h1>{t('login.title')}</h1>
          <p>{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field-group">
            <label htmlFor="email">{t('login.email')}</label>
            <input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.placeholder_email')}
              required autoFocus
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">{t('login.password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.placeholder_password')}
                required style={{ paddingRight: '2.5rem' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', fontSize: '1rem',
                  color: 'var(--ink-muted)', padding: '0',
                }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('login.loading') : t('login.button')}
          </button>

          <div style={{
            marginTop: '0.5rem', padding: '0.75rem',
            background: 'var(--cream)', borderRadius: '8px',
            border: '1px solid var(--border)', fontSize: '0.75rem',
            color: 'var(--ink-muted)',
          }}>
            <strong style={{ display: 'block', marginBottom: '0.3rem' }}>
              {t('login.test_credentials')}
            </strong>
            <div>{t('login.test_admin')}</div>
            <div>{t('login.test_employee')}</div>
          </div>
        </form>
      </div>
    </div>
  );
}
