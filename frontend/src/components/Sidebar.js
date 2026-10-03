'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const NAV_ITEMS = [
  { key: 'dashboard',   icon: '📊', href: '/dashboard' },
  { key: 'contracts',   icon: '📄', href: '/dashboard/contracts' },
  { key: 'owners',      icon: '🏠', href: '/dashboard/owners' },
  { key: 'regions',     icon: '🗺️', href: '/dashboard/regions' },
  { key: 'delegations', icon: '🏛️', href: '/dashboard/delegations' },
  { key: 'notifications', icon: '🔔', href: '/dashboard/notifications' },
  { key: 'history',       icon: '🗑️', href: '/dashboard/history' },
];

const ADMIN_ITEMS = [
  { key: 'users', icon: '👥', href: '/dashboard/users' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const { t } = useLanguage();

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar" id="main-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">م</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">
            {t.auth.title}
          </span>
          <span className="sidebar-logo-subtitle">
            {t.auth.subtitle}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Menu</span>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
            id={`nav-${item.key}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {t.nav[item.key]}
          </Link>
        ))}

        {isAdmin && (
          <>
            <span className="sidebar-section-label" style={{ marginTop: '8px' }}>
              Admin
            </span>
            {ADMIN_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                id={`nav-${item.key}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                {t.nav[item.key]}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Footer / User */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={logout} id="logout-btn" title={t.nav.logout}>
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.fullName || user?.email}</div>
            <div className="sidebar-user-role">{user?.role?.replace('ROLE_', '')}</div>
          </div>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>⏻</span>
        </div>
      </div>
    </aside>
  );
}
