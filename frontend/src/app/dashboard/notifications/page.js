'use client';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import axiosInstance from '@/lib/axios';

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await axiosInstance.get('/api/notifications');
        setNotifications(res.data?.data || res.data || []);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const typeIcon = (type) => ({
    EXPIRATION: '⏰',
    MAJORATION: '📈',
    AVENANT: '📋',
    ALERTE: '⚠️',
  }[type] || '🔔');

  const typeCls = (type) => ({
    EXPIRATION: 'badge-danger',
    MAJORATION: 'badge-warning',
    AVENANT: 'badge-info',
    ALERTE: 'badge-warning',
  }[type] || 'badge-info');

  return (
    <>
      <Navbar title={t.nav.notifications} />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">🔔 {t.nav.notifications}</h1>
          <span className="badge badge-danger">{notifications.filter(n => !n.read).length}</span>
        </div>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: '200px' }}>
            <div className="spinner" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <span className="empty-state-icon">🔔</span>
              <span className="empty-state-text">{t.common.noData}</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((n, i) => (
              <div key={n.id || i} className="card" style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                borderLeft: n.read ? '3px solid transparent' : '3px solid var(--color-gold)',
                opacity: n.read ? 0.7 : 1,
              }}>
                <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{typeIcon(n.type)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className={`badge ${typeCls(n.type)}`}>{n.type}</span>
                    {!n.read && <span className="badge badge-gold">Nouveau</span>}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                    {n.message || n.content || '—'}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    {n.createdAt || n.date || ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
