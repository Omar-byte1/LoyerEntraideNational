'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { contractsApi } from '@/lib/api';

// ─── Badge statut ──────────────────────────────────────────────────────────
function StatusBadge({ status, t }) {
  const styles = {
    ACTIF:    { cls: 'badge-success', dot: 'var(--color-success)' },
    EXPIRE:   { cls: 'badge-danger',  dot: 'var(--color-danger)'  },
    RESILIE:  { cls: 'badge-warning', dot: 'var(--color-warning)' },
    SUSPENDU: { cls: 'badge-info',    dot: 'var(--color-info)'    },
  };
  const s = styles[status] || { cls: 'badge-info', dot: 'var(--color-info)' };
  return (
    <span className={`badge ${s.cls}`}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {t.contracts.status[status] || status}
    </span>
  );
}

// ─── Page Historique ───────────────────────────────────────────────────────
export default function HistoryPage() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const router = useRouter();

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const PAGE_SIZE = 15;

  const loadHistory = useCallback(async (pageNum = 0) => {
    setLoading(true);
    setError('');
    try {
      const res = await contractsApi.getHistory(pageNum, PAGE_SIZE);
      const pageData = res.data || res;
      const actualData = pageData.data || pageData;
      setContracts(actualData.content || []);
      setTotalPages(actualData.totalPages || 0);
      setTotalElements(actualData.totalElements || 0);
    } catch (e) {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadHistory(page);
  }, [page, loadHistory]);

  const handleRecover = async (id) => {
    if (!window.confirm("Voulez-vous vraiment restaurer ce contrat ?")) return;
    try {
      await contractsApi.recover(id);
      loadHistory(page);
      alert("Contrat restauré avec succès !");
    } catch (e) {
      const msg = e.response?.data?.message || t.common.error;
      alert("Erreur: " + msg);
    }
  };

  const fmt = (val) => {
    if (!val && val !== 0) return '—';
    return new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(val) + ' ' + t.common.currency;
  };

  return (
    <>
      <Navbar title="Historique (Corbeille)" />
      <div className="page-container">

        <div className="page-header">
          <div>
            <h1 className="page-title">🗑️ Historique des contrats supprimés</h1>
            <p className="page-subtitle">
              {totalElements > 0 ? `${totalElements} ${t.common.total}` : ''}
            </p>
          </div>
        </div>

        {error && (
          <div className="auth-error mb-4">
            <span>⚠️</span> {error}
            <button className="btn btn-ghost btn-sm" onClick={() => loadHistory(page)} style={{ marginLeft: 'auto' }}>
              ↻ Réessayer
            </button>
          </div>
        )}

        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table" id="contracts-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t.contracts.col.region}</th>
                  <th>{t.contracts.col.delegation}</th>
                  <th>{t.contracts.col.ownerName}</th>
                  <th>{t.contracts.col.startDate}</th>
                  <th>{t.contracts.col.initialMonthlyRent}</th>
                  <th>{t.contracts.col.status}</th>
                  <th>{t.contracts.col.actions}</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="flex items-center justify-between" style={{ justifyContent: 'center', gap: '10px' }}>
                        <span className="spinner spinner-sm" />
                        <span className="text-muted">{t.contracts.loading}</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && contracts.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                      <span className="text-muted">Aucun contrat dans l'historique</span>
                    </td>
                  </tr>
                )}
                {!loading && contracts.map(c => (
                  <tr key={c.id} style={{ opacity: 0.8 }}>
                    <td>{c.contractNumber}</td>
                    <td>{c.region?.name}</td>
                    <td>{c.delegation?.name || '—'}</td>
                    <td>{c.owner?.name}</td>
                    <td>{c.startDate}</td>
                    <td>{fmt(c.initialMonthlyRent)}</td>
                    <td><StatusBadge status={c.status} t={t} /></td>
                    <td>
                      <div className="flex gap-2">
                        {isAdmin && (
                          <button
                            className="btn btn-success btn-sm"
                            title="Restaurer"
                            onClick={() => handleRecover(c.id)}
                          >
                            ♻️ Restaurer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              ← {t.common.previous}
            </button>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>
              {t.common.page} {page + 1} / {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              {t.common.next} →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
