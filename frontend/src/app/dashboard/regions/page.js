'use client';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import { regionsApi } from '@/lib/api';

export default function RegionsPage() {
  const { t } = useLanguage();
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', code: '' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await regionsApi.getAll();
      setRegions(res.data || res || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (r) => { setEditing(r); setForm({ name: r.name, code: r.code }); };
  const cancelEdit = () => { setEditing(null); setForm({ name: '', code: '' }); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await regionsApi.update(editing.id, form);
      else await regionsApi.create(form);
      cancelEdit(); load();
    } catch { alert(t.common.error); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.common.confirmDelete)) return;
    try { await regionsApi.delete(id); load(); } catch { alert(t.common.error); }
  };

  return (
    <>
      <Navbar title={t.nav.regions} />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">🗺️ {t.nav.regions}</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', alignItems: 'start' }}>
          {/* Formulaire */}
          <div className="card">
            <div className="card-header">
              <h3>{editing ? t.common.edit : '+ ' + t.nav.regions}</h3>
              {editing && <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>✕</button>}
            </div>
            <div className="card-body">
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">{t.common.all === 'Tous' ? 'Nom' : 'الاسم'} *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Code *</label>
                  <input className="form-control" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required maxLength={10} />
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
              <table className="data-table" id="regions-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nom</th>
                    <th>Code</th>
                    <th>{t.contracts.col.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}><span className="spinner spinner-sm" style={{ margin: '0 auto' }} /></td></tr>}
                  {!loading && regions.length === 0 && <tr><td colSpan={4}><div className="empty-state"><span className="empty-state-icon">🗺️</span><span>{t.common.noData}</span></div></td></tr>}
                  {!loading && regions.map((r, i) => (
                    <tr key={r.id} id={`region-row-${r.id}`}>
                      <td className="text-muted text-xs">{i + 1}</td>
                      <td className="font-semibold">{r.name}</td>
                      <td><span className="badge badge-gold">{r.code}</span></td>
                      <td className="cell-actions">
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => startEdit(r)} id={`edit-region-${r.id}`}>✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(r.id)} id={`delete-region-${r.id}`}>🗑️</button>
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
