'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { dashboardApi, contractsApi } from '@/lib/api';

const STAT_CARDS = [
  { key: 'totalContracts',   icon: '📄', color: 'var(--color-info)',    bg: 'var(--color-info-muted)' },
  { key: 'activeContracts',  icon: '✅', color: 'var(--color-success)', bg: 'var(--color-success-muted)' },
  { key: 'expiredContracts', icon: '⏰', color: 'var(--color-danger)',  bg: 'var(--color-danger-muted)' },
  { key: 'expiringIn30',     icon: '⚡', color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' },
  { key: 'totalMonthlyRent', icon: '💰', color: 'var(--color-gold)',    bg: 'var(--color-gold-muted)', isMoney: true },
  { key: 'totalAnnualRent',  icon: '📈', color: 'var(--color-gold)',    bg: 'var(--color-gold-muted)', isMoney: true },
];

function formatValue(val, isMoney, currency) {
  if (val === undefined || val === null) return '—';
  if (isMoney) {
    const num = parseFloat(val);
    if (isNaN(num)) return '—';
    return new Intl.NumberFormat('fr-MA', { style: 'decimal', maximumFractionDigits: 0 }).format(num) + ' ' + currency;
  }
  return val.toString();
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [expiring, setExpiring] = useState([]);
  const [expired, setExpired] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, expRes, expiredRes, recentRes] = await Promise.all([
          dashboardApi.getSummary(),
          contractsApi.getExpiring(30),
          contractsApi.getExpired(),
          contractsApi.getRecent(),
        ]);
        setStats(dashRes.data || dashRes);
        setExpiring(expRes.data || []);
        setExpired(expiredRes.data || []);
        setRecent(recentRes.data || []);
      } catch (err) {
        setError(t.common.error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statValues = stats ? {
    totalContracts:   stats.totalContracts,
    activeContracts:  stats.activeContracts,
    expiredContracts: stats.expiredContracts,
    expiringIn30:     stats.expiringIn30Days,
    totalMonthlyRent: stats.totalMonthlyRent,
    totalAnnualRent:  stats.totalAnnualRent,
  } : {};

  return (
    <>
      <Navbar title={t.dashboard.title} />
      <div className="page-container">
        {/* En-tête */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              {t.auth.welcomeBack}, {user?.fullName?.split(' ')[0] || 'Admin'} 👋
            </h1>
            <p className="page-subtitle">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {error && (
          <div className="auth-error mb-4">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Cartes statistiques */}
        <div className="stat-grid">
          {STAT_CARDS.map((card) => (
            <div key={card.key} className="stat-card" id={`stat-${card.key}`}>
              <div className="stat-card-header">
                <div className="stat-card-icon" style={{ background: card.bg, color: card.color }}>
                  {card.icon}
                </div>
              </div>
              {loading ? (
                <div style={{ height: '32px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-sm)', animation: 'pulse 1.5s ease infinite' }} />
              ) : (
                <div className="stat-card-value" style={{ color: card.color }}>
                  {formatValue(statValues[card.key], card.isMoney, t.common.currency)}
                </div>
              )}
              <div className="stat-card-label">{t.dashboard[card.key]}</div>
            </div>
          ))}
        </div>

        {/* Contrats ajoutés récemment */}
        <div className="card mt-4" id="recent-contracts-card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🆕</span>
              Derniers contrats ajoutés
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-success">{recent.length}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => router.push('/dashboard/contracts')}
                style={{ fontSize: '0.72rem', color: 'var(--color-gold)' }}
              >
                Voir tous →
              </button>
            </div>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">✅</span>
              <span className="empty-state-text">
                Aucun contrat
              </span>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t.contracts.col.contractNumber}</th>
                    <th>{t.contracts.col.ownerName}</th>
                    <th>{t.contracts.col.region}</th>
                    <th>Date de début</th>
                    <th>{t.contracts.col.endDate}</th>
                    <th>{t.contracts.col.status}</th>
                    <th>{t.contracts.col.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((c) => (
                    <tr key={c.id}
                      onClick={() => router.push(`/dashboard/contracts/${c.id}`)}
                      style={{ cursor: 'pointer' }}
                      title="Cliquez pour voir le détail"
                    >
                      <td className="text-gold font-semibold">{c.contractNumber}</td>
                      <td>{c.owner?.name || '—'}</td>
                      <td>{c.region?.name || '—'}</td>
                      <td>{c.startDate || '—'}</td>
                      <td className="text-danger">{c.endDate || '—'}</td>
                      <td>
                        <StatusBadge status={c.status} t={t} />
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          title={t.common.view}
                          onClick={() => router.push(`/dashboard/contracts/${c.id}`)}
                          style={{ color: 'var(--color-gold)' }}
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Contrats expirant bientôt */}
        <div className="card" id="expiring-contracts-card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚡</span>
              {t.dashboard.expiringIn30}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-warning">{expiring.length}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => router.push('/dashboard/contracts')}
                style={{ fontSize: '0.72rem', color: 'var(--color-gold)' }}
              >
                Voir tous →
              </button>
            </div>
          </div>
          {expiring.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">✅</span>
              <span className="empty-state-text">
                Aucun contrat n'expire dans les 30 prochains jours
              </span>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t.contracts.col.contractNumber}</th>
                    <th>{t.contracts.col.ownerName}</th>
                    <th>{t.contracts.col.region}</th>
                    <th>{t.contracts.col.endDate}</th>
                    <th>{t.contracts.col.currentMonthlyRent}</th>
                    <th>{t.contracts.col.status}</th>
                    <th>{t.contracts.col.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {expiring.map((c) => (
                    <tr key={c.id}
                      onClick={() => router.push(`/dashboard/contracts/${c.id}`)}
                      style={{ cursor: 'pointer' }}
                      title="Cliquez pour voir le détail"
                    >
                      <td className="text-gold font-semibold">{c.contractNumber}</td>
                      <td>{c.owner?.name || '—'}</td>
                      <td>{c.region?.name || '—'}</td>
                      <td className="text-danger">{c.endDate || '—'}</td>
                      <td>
                        {c.currentMonthlyRent
                          ? new Intl.NumberFormat('fr-MA').format(c.currentMonthlyRent) + ' ' + t.common.currency
                          : '—'}
                      </td>
                      <td>
                        <StatusBadge status={c.status} t={t} />
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          title={t.common.view}
                          onClick={() => router.push(`/dashboard/contracts/${c.id}`)}
                          style={{ color: 'var(--color-gold)' }}
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Contrats déjà expirés */}
        <div className="card mt-4" id="expired-contracts-card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span>
              Contrats déjà expirés
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-danger">{expired.length}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => router.push('/dashboard/contracts')}
                style={{ fontSize: '0.72rem', color: 'var(--color-gold)' }}
              >
                Voir tous →
              </button>
            </div>
          </div>
          {expired.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">✅</span>
              <span className="empty-state-text">
                Aucun contrat expiré
              </span>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t.contracts.col.contractNumber}</th>
                    <th>{t.contracts.col.ownerName}</th>
                    <th>{t.contracts.col.region}</th>
                    <th>{t.contracts.col.endDate}</th>
                    <th>{t.contracts.col.currentMonthlyRent}</th>
                    <th>{t.contracts.col.status}</th>
                    <th>{t.contracts.col.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {expired.map((c) => (
                    <tr key={c.id}
                      onClick={() => router.push(`/dashboard/contracts/${c.id}`)}
                      style={{ cursor: 'pointer' }}
                      title="Cliquez pour voir le détail"
                    >
                      <td className="text-danger font-semibold">{c.contractNumber}</td>
                      <td>{c.owner?.name || '—'}</td>
                      <td>{c.region?.name || '—'}</td>
                      <td className="text-danger">{c.endDate || '—'}</td>
                      <td>
                        {c.currentMonthlyRent
                          ? new Intl.NumberFormat('fr-MA').format(c.currentMonthlyRent) + ' ' + t.common.currency
                          : '—'}
                      </td>
                      <td>
                        <StatusBadge status={c.status} t={t} />
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          title={t.common.view}
                          onClick={() => router.push(`/dashboard/contracts/${c.id}`)}
                          style={{ color: 'var(--color-gold)' }}
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Répartition par statut */}
        {stats?.contractsByStatus && (
          <div className="card mt-4" id="status-distribution-card">
            <div className="card-header">
              <h3>
                <span>📊</span> {t.dashboard.contractsByStatus}
              </h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {Object.entries(stats.contractsByStatus).map(([status, count]) => (
                  <div key={status} style={{
                    flex: '1 1 120px',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                      {count}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      {t.contracts.status[status] || status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function StatusBadge({ status, t }) {
  const map = {
    ACTIF:     'badge-success',
    EXPIRE:    'badge-danger',
    RESILIE:   'badge-warning',
    SUSPENDU:  'badge-info',
  };
  return (
    <span className={`badge ${map[status] || 'badge-info'}`}>
      {t.contracts.status[status] || status}
    </span>
  );
}
