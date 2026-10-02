'use client';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { ownersApi } from '@/lib/api';

function OwnerModal({ open, onClose, onSave, owner: initial, t }) {
  const [form, setForm] = useState({
    name: '', type: 'PERSONNE_PHYSIQUE', phone: '', email: '', address: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) setForm({ name: initial.name || '', type: initial.type || 'PERSONNE_PHYSIQUE', phone: initial.phone || '', email: initial.email || '', address: initial.address || '', notes: initial.notes || '' });
    else setForm({ name: '', type: 'PERSONNE_PHYSIQUE', phone: '', email: '', address: '', notes: '' });
  }, [initial, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await onSave(form); onClose(); }
    catch { alert(t.common.error); }
    finally { setSaving(false); }
  };

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">🏠 {initial ? t.owners.title : t.owners.new}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{t.owners.col.name} *</label>
                <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t.owners.col.type}</label>
                <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="PERSONNE_PHYSIQUE">{t.owners.type.PERSONNE_PHYSIQUE}</option>
                  <option value="PERSONNE_MORALE">{t.owners.type.PERSONNE_MORALE}</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t.owners.col.phone}</label>
                <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.owners.col.email}</label>
                <input type="email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
            </div>
            <div className="form-group mt-2">
              <label className="form-label">{t.owners.col.address}</label>
              <input className="form-control" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="form-group mt-2">
              <label className="form-label">Notes</label>
              <textarea className="form-control" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{t.common.cancel}</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner spinner-sm" /> {t.contracts.form.saving}</> : t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OwnersPage() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ownersApi.getAll();
      const data = res.data || res;
      setOwners(data.content || data || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (editing) await ownersApi.update(editing.id, form);
    else await ownersApi.create(form);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.common.confirmDelete)) return;
    try { await ownersApi.delete(id); load(); } catch { alert(t.common.error); }
  };

  const typeBadge = (type) => ({
    PERSONNE_PHYSIQUE: 'badge-info',
    PERSONNE_MORALE: 'badge-gold',
  }[type] || 'badge-info');

  return (
    <>
      <Navbar title={t.owners.title} />
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">🏠 {t.owners.title}</h1>
            <p className="page-subtitle">{owners.length} {t.common.total}</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }} id="new-owner-btn">
            + {t.owners.new}
          </button>
        </div>

        <div className="card">
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table" id="owners-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t.owners.col.name}</th>
                  <th>{t.owners.col.type}</th>
                  <th>{t.owners.col.phone}</th>
                  <th>{t.owners.col.email}</th>
                  <th>{t.owners.col.address}</th>
                  <th>{t.contracts.col.actions}</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                    <span className="spinner spinner-sm" style={{ margin: '0 auto' }} />
                  </td></tr>
                )}
                {!loading && owners.length === 0 && (
                  <tr><td colSpan={7}>
                    <div className="empty-state">
                      <span className="empty-state-icon">🏠</span>
                      <span className="empty-state-text">{t.common.noData}</span>
                    </div>
                  </td></tr>
                )}
                {!loading && owners.map((o, i) => (
                  <tr key={o.id} id={`owner-row-${o.id}`}>
                    <td className="text-muted text-xs">{i + 1}</td>
                    <td className="font-semibold">{o.name}</td>
                    <td><span className={`badge ${typeBadge(o.type)}`}>{t.owners.type[o.type] || o.type}</span></td>
                    <td>{o.phone || '—'}</td>
                    <td className="text-muted">{o.email || '—'}</td>
                    <td className="text-muted">{o.address || '—'}</td>
                    <td className="cell-actions">
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setEditing(o); setModalOpen(true); }} id={`edit-owner-${o.id}`}>✏️</button>
                        {isAdmin && (
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(o.id)} id={`delete-owner-${o.id}`}>🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <OwnerModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} owner={editing} t={t} />
    </>
  );
}
