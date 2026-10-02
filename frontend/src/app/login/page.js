'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t, lang, switchLanguage } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(t.auth.loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Language switcher */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
        <div className="lang-toggle">
          <button
            className={`lang-btn ${lang === 'fr' ? 'active' : ''}`}
            onClick={() => switchLanguage('fr')}
          >
            FR
          </button>
          <button
            className={`lang-btn ${lang === 'ar' ? 'active' : ''}`}
            onClick={() => switchLanguage('ar')}
          >
            ع
          </button>
        </div>
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">م</div>
          <h1 className="auth-title">{t.auth.title}</h1>
          <p className="auth-subtitle">{t.auth.subtitle}</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="auth-form" id="login-form">
          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              {t.auth.email}
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">✉️</span>
              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              {t.auth.password}
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                id="password"
                type="password"
                className="auth-input"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            id="login-submit"
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="spinner spinner-sm" />
                {t.auth.loggingIn}
              </span>
            ) : (
              t.auth.login
            )}
          </button>
        </form>

        {/* Badge sécurité */}
        <div style={{
          marginTop: '24px',
          padding: '10px',
          background: 'rgba(245,200,66,0.05)',
          border: '1px solid rgba(245,200,66,0.1)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          <span>🔐</span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
