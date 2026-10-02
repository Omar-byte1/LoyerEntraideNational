'use client';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import { delegationsApi, regionsApi } from '@/lib/api';

export default function DelegationsPage() {
  const { t } = useLanguage();
  const [delegations, setDelegations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', code: '', region: null });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [dRes, rRes] = await Promise.all([delegationsApi.getAll(), regionsApi.getAll()]);
      setDelegations(dRes.data || dRes || []);
      setRegions(rRes.data || rRes || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (d) => { setEditing(d); setForm({ name: d.name, code: d.code, region: d.region }); };
  const cancelEdit = () => { setEditing(null); setForm({ name: '', code: '', region: null }); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, region: form.region ? { id: form.region.id } : null };
      if (editing) await delegationsApi.update(editing.id, payload);
      else await delegationsApi.create(payload);
      cancelEdit(); load();
    } catch { alert(t.common.error); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.common.confirmDelete)) return;
    try { await delegationsApi.delete(id); load(); } catch { alert(t.common.error); }
  };

  return (
    <>
      <Navbar title={t.nav.delegations} />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">🏛️ {t.nav.delegations}</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', alignItems: 'start' }}>
          {/* Formulaire */}
          <div className="card">
            <div className="card-header">
              <h3>{editing ? t.common.edit : '+ ' + t.nav.delegations}</h3>
              {editing && <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>✕</button>}
            </div>
            <div className="card-body">
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Code *</label>
                  <input className="form-control" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.contracts.form.region} *</label>
                  <select className="form-control"
                    value={form.region?.id || ''}
                    onChange={e => setForm(f => ({ ...f, region: regions.find(r => r.id === +e.target.value) || null }))}
                    required>
                    <option value="">— {t.contracts.form.region} —</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner spinner-sm" /> {t.contracts.form.saving}</> : t.common.save}
                </button>
              </form>
            </div>
          </div>

          {/* Liste */}
          <div className="card">
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table" id="delegations-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nom</th>
                    <th>Code</th>
                    <th>{t.contracts.col.region}</th>
                    <th>{t.contracts.col.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}><span className="spinner spinner-sm" style={{ margin: '0 auto' }} /></td></tr>}
                  {!loading && delegations.length === 0 && <tr><td colSpan={5}><div className="empty-state"><span className="empty-state-icon">🏛️</span><span>{t.common.noData}</span></div></td></tr>}
                  {!loading && delegations.map((d, i) => (
                    <tr key={d.id} id={`delegation-row-${d.id}`}>
                      <td className="text-muted text-xs">{i + 1}</td>
                      <td className="font-semibold">{d.name}</td>
                      <td><span className="badge badge-info">{d.code}</span></td>
                      <td>{d.region?.name || '—'}</td>
                      <td className="cell-actions">
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => startEdit(d)} id={`edit-delegation-${d.id}`}>✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(d.id)} id={`delete-delegation-${d.id}`}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
