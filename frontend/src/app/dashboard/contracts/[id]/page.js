'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import { contractsApi } from '@/lib/api';

function InfoRow({ label, value, highlight }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '10px 0', borderBottom: '1px solid var(--color-border)',
      gap: '16px',
    }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, flexShrink: 0, minWidth: '160px' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.875rem', color: highlight ? 'var(--color-gold)' : 'var(--color-text-primary)', fontWeight: highlight ? 700 : 400, textAlign: 'right' }}>
        {value || '—'}
      </span>
    </div>
  );
}

export default function ContractDetailPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const router = useRouter();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await contractsApi.getById(id);
        setContract(res.data || res);
      } catch {
        setError(t.common.error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar title={t.contracts.detail.title} />
        <div className="page-container loading-screen" style={{ margin: 0 }}>
          <div className="spinner" />
        </div>
      </>
    );
  }

  if (error || !contract) {
    return (
      <>
        <Navbar title={t.contracts.detail.title} />
        <div className="page-container">
          <div className="auth-error">
            <span>⚠️</span> {error || t.common.error}
          </div>
          <button className="btn btn-secondary mt-4" onClick={() => router.back()}>
            ← {t.common.back}
          </button>
        </div>
      </>
    );
  }

  const fmt = (val) =>
    val ? new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 2 }).format(val) + ' ' + t.common.currency : '—';

  const statusColors = {
    ACTIF: 'badge-success', EXPIRE: 'badge-danger',
    RESILIE: 'badge-warning', SUSPENDU: 'badge-info',
  };

  return (
    <>
      <Navbar title={`${t.contracts.detail.title} — ${contract.contractNumber}`} />
      <div className="page-container">
        {/* En-tête */}
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <h1 className="page-title" style={{ fontSize: '1.2rem' }}>
                📄 {contract.contractNumber}
              </h1>
              <span className={`badge ${statusColors[contract.status] || 'badge-info'}`}>
                {t.contracts.status[contract.status] || contract.status}
              </span>
            </div>
            <p className="page-subtitle">{contract.owner?.name} — {contract.region?.name}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => router.back()}>
            ← {t.common.back}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {/* Identification */}
          <div className="card">
            <div className="card-header">
              <h3>🏷️ {t.contracts.detail.identification}</h3>
            </div>
            <div className="card-body">
              <InfoRow label={t.contracts.col.contractNumber} value={contract.contractNumber} highlight />
              <InfoRow label={t.contracts.col.region} value={contract.region?.name} />
              <InfoRow label={t.contracts.col.delegation} value={contract.delegation?.name} />
              <InfoRow label={t.contracts.col.ownerName} value={contract.owner?.name} />
              <InfoRow label={t.contracts.col.ownerAddress} value={contract.owner?.address} />
              <InfoRow label={t.contracts.col.landReference} value={contract.landReference} />
              <InfoRow label={t.contracts.col.address} value={contract.address} />
              <InfoRow label={t.contracts.col.propertyType} value={contract.propertyType} />
              <InfoRow label={t.contracts.col.contractType} value={contract.contractType} />
            </div>
          </div>

          {/* Finances */}
          <div className="card">
            <div className="card-header">
              <h3>💰 {t.contracts.detail.finances}</h3>
            </div>
            <div className="card-body">
              <InfoRow label={t.contracts.form.startDate} value={contract.startDate} />
              <InfoRow label={t.contracts.form.endDate} value={contract.endDate} />
              <InfoRow label={t.contracts.form.durationMonths} value={contract.durationMonths ? `${contract.durationMonths} mois` : null} />
              <InfoRow label={t.contracts.form.initialMonthlyRent} value={fmt(contract.initialMonthlyRent)} />
              <InfoRow label={t.contracts.form.currentMonthlyRent} value={fmt(contract.currentMonthlyRent)} highlight />
              <InfoRow label="Loyer annuel" value={fmt(contract.annualRent)} />
              <InfoRow label={t.contracts.form.charges} value={fmt(contract.charges)} />
              <InfoRow label="Autres charges" value={fmt(contract.otherCharges)} />
            </div>
          </div>

          {/* Majorations */}
          <div className="card">
            <div className="card-header">
              <h3>📈 {t.contracts.detail.increases}</h3>
              <span className="badge badge-gold">{contract.rentIncreases?.length || 0}</span>
            </div>
            {contract.rentIncreases?.length > 0 ? (
              <div className="table-container" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>%</th>
                      <th>Montant</th>
                      <th>Nouveau loyer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.rentIncreases.map(ri => (
                      <tr key={ri.id}>
                        <td>{ri.effectiveDate}</td>
                        <td><span className="badge badge-gold">{ri.percentage}%</span></td>
                        <td>{fmt(ri.increaseAmount)}</td>
                        <td className="text-gold font-semibold">{fmt(ri.newAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-state-icon">📊</span>
                <span className="empty-state-text">{t.common.noData}</span>
              </div>
            )}
          </div>

          {/* Avenants */}
          <div className="card">
            <div className="card-header">
              <h3>📋 {t.contracts.detail.amendments}</h3>
              <span className="badge badge-info">{contract.amendments?.length || 0}</span>
            </div>
            {contract.amendments?.length > 0 ? (
              <div className="table-container" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.amendments.map(a => (
                      <tr key={a.id}>
                        <td className="font-semibold">{a.number}</td>
                        <td>{a.type}</td>
                        <td>{a.date}</td>
                        <td>
                          <span className={`badge ${a.status === 'VALIDE' ? 'badge-success' : 'badge-warning'}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-state-icon">📋</span>
                <span className="empty-state-text">{t.common.noData}</span>
              </div>
            )}
          </div>
        </div>

        {/* Observations */}
        {contract.observations && (
          <div className="card mt-4">
            <div className="card-header">
              <h3>💬 {t.contracts.col.observations}</h3>
            </div>
            <div className="card-body">
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '0.875rem' }}>
                {contract.observations}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
