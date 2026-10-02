'use client';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Navbar({ title }) {
  const { t, lang, switchLanguage } = useLanguage();

  return (
    <header className="navbar" id="main-navbar">
      <div className="navbar-title">
        <span style={{ color: 'var(--color-gold)' }}>◆</span>
        {title}
      </div>

      <div className="navbar-actions">
        {/* Sélecteur de langue */}
        <div className="lang-toggle" id="lang-toggle">
          <button
            className={`lang-btn ${lang === 'fr' ? 'active' : ''}`}
            onClick={() => switchLanguage('fr')}
            id="lang-fr"
            aria-label="Français"
          >
            FR
          </button>
          <button
            className={`lang-btn ${lang === 'ar' ? 'active' : ''}`}
            onClick={() => switchLanguage('ar')}
            id="lang-ar"
            aria-label="العربية"
          >
            ع
          </button>
        </div>

        {/* Indicateur connexion */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 10px',
          background: 'var(--color-success-muted)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.7rem',
          color: 'var(--color-success)',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
          En ligne
        </div>
      </div>
    </header>
  );
}
