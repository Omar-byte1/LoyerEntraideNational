'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { contractsApi, regionsApi, delegationsApi, ownersApi } from '@/lib/api';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

// ─── Modale de création / édition ─────────────────────────────────────────
function ContractModal({ open, onClose, onSave, contract: initial, regions, owners, t }) {
  const EMPTY = {
    contractNumber: '', startDate: '', endDate: '', durationMonths: '',
    address: '', landReference: '', propertyType: '', contractType: '',
    initialMonthlyRent: '', currentMonthlyRent: '', charges: '', status: 'ACTIF',
    observations: '', evaluationPv: '', definedIncreases: '', activityChange: '',
    // texte affiché dans l'input (pour datalist)
    regionText: '', delegationText: '', ownerText: '',
    // objets résolus
    region: null, delegation: null, owner: null,
  };

  const [form, setForm] = useState(EMPTY);
  const [delegations, setDelegations] = useState([]);
  const [saving, setSaving] = useState(false);

  // Charge les délégations quand on tape une région connue
  const loadDelegations = async (regionId) => {
    try {
      const { delegationsApi } = await import('@/lib/api');
      const res = await delegationsApi.getByRegion(regionId);
      setDelegations(res.data || res || []);
    } catch { setDelegations([]); }
  };

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        contractNumber: initial.contractNumber || '',
        startDate: initial.startDate || '',
        endDate: initial.endDate || '',
        durationMonths: initial.durationMonths || '',
        address: initial.address || '',
        landReference: initial.landReference || '',
        propertyType: initial.propertyType || '',
        contractType: initial.contractType || '',
        initialMonthlyRent: initial.initialMonthlyRent || '',
        currentMonthlyRent: initial.currentMonthlyRent || '',
        charges: initial.charges || '',
        status: initial.status || 'ACTIF',
        observations: initial.observations || '',
        evaluationPv: initial.evaluationPv || '',
        definedIncreases: initial.definedIncreases || '',
        activityChange: initial.activityChange || '',
        regionText: initial.region?.name || '',
        delegationText: initial.delegation?.name || '',
        ownerText: initial.owner?.name || '',
        region: initial.region || null,
        delegation: initial.delegation || null,
        owner: initial.owner || null,
      });
      if (initial.region?.id) loadDelegations(initial.region.id);
    } else {
      setForm(EMPTY);
      setDelegations([]);
    }
  }, [initial, open]);

  // Calcul automatique du loyer actuel
  // Règle : tous les 36 mois (3 ans) de durée, on ajoute 10% du loyer INITIAL
  // Exemple : 200 DA → 36 mois = 220 | 72 mois = 240 | 108 mois = 260
  useEffect(() => {
    const initialRent = parseFloat(form.initialMonthlyRent);
    const months      = parseInt(form.durationMonths);

    if (!isNaN(initialRent) && initialRent > 0) {
      if (!isNaN(months) && months > 0) {
        // Nombre de périodes de 3 ans complètes dans la durée du contrat
        const periods = Math.floor(months / 36);
        // Intérêts simples : chaque période ajoute 10% du loyer INITIAL
        const calculatedRent = initialRent + (initialRent * 0.10 * periods);
        const calculatedVal  = calculatedRent.toFixed(2);
        if (form.currentMonthlyRent !== calculatedVal) {
          setForm(f => ({ ...f, currentMonthlyRent: calculatedVal }));
        }
      } else {
        // Pas de durée renseignée → loyer actuel = loyer initial
        const initStr = String(initialRent);
        if (form.currentMonthlyRent !== initStr) {
          setForm(f => ({ ...f, currentMonthlyRent: initStr }));
        }
      }
    }
  }, [form.initialMonthlyRent, form.durationMonths]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Quand l'utilisateur tape dans le champ Région
  const handleRegionChange = (val) => {
    set('regionText', val);
    const found = regions.find(r => r.name.toLowerCase() === val.toLowerCase() || String(r.id) === val);
    if (found) {
      set('region', found);
      set('delegation', null);
      set('delegationText', '');
      loadDelegations(found.id);
    } else {
      set('region', null);
    }
  };

  // Quand l'utilisateur tape dans le champ Délégation
  const handleDelegationChange = (val) => {
    set('delegationText', val);
    const found = delegations.find(d => d.name.toLowerCase() === val.toLowerCase() || String(d.id) === val);
    set('delegation', found || null);
  };

  // Quand l'utilisateur tape dans le champ Propriétaire
  const handleOwnerChange = (val) => {
    set('ownerText', val);
    const found = owners.find(o => o.name.toLowerCase() === val.toLowerCase() || String(o.id) === val);
    set('owner', found || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Vérification owner obligatoire
    if (!form.owner) {
      alert(`⚠️ Propriétaire introuvable : "${form.ownerText}". Tapez le nom exact d'un propriétaire existant.`);
      return;
    }
    if (!form.region) {
      alert(`⚠️ Région introuvable : "${form.regionText}". Tapez le nom exact d'une région existante.`);
      return;
    }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err) { alert(err.response?.data?.message || err.message || t.common.error); }
    finally { setSaving(false); }
  };

  if (!open) return null;

  // Helper input simple
  const inp = (label, key, type = 'text', required = false, placeholder = '') => {
    // Pour les dates, on utilise un input de type date natif mais on préfixe le label
    // Le navigateur affiche dans le format local, le stockage interne reste YYYY-MM-DD
    return (
      <div className="form-group">
        <label className="form-label">{label}{required && ' *'}</label>
        <input
          type={type} className="form-control"
          value={form[key]}
          onChange={e => set(key, e.target.value)}
          required={required}
          placeholder={type === 'date' ? 'JJ/MM/AAAA' : placeholder}
          lang="fr"
        />
        {type === 'date' && form[key] && (
          <span style={{ fontSize: '0.72rem', color: 'var(--color-gold)', marginTop: 2, display: 'block' }}>
            ℹ️ 
            {(() => {
              const d = new Date(form[key]);
              if (isNaN(d.getTime())) return '';
              return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
            })()}
          </span>
        )}
      </div>
    );
  };

  // Helper input avec datalist (saisie libre + suggestions)
  const datalistInp = (label, key, listId, options, onChange, required = false, placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}{required && ' *'}</label>
      <input
        list={listId}
        className="form-control"
        value={form[key]}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
      />
      <datalist id={listId}>
        {options.map(o => (
          <option key={o.id} value={o.name}>{o.code ? `${o.name} (${o.code})` : o.name}</option>
        ))}
      </datalist>
    </div>
  );

  const STATUS_OPTIONS = ['ACTIF', 'EXPIRE', 'RESILIE', 'SUSPENDU'];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <span>📄</span>
            {initial ? t.contracts.form.edit : t.contracts.form.create}
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {/* ── Identification ── */}
            <p style={{ marginBottom: 12, fontSize: '0.7rem', color: 'var(--color-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
              ◆ {t.contracts.detail.identification}
            </p>
            <div className="form-grid">
              {inp(t.contracts.form.contractNumber, 'contractNumber', 'text', true, 'Ex: C-2025-001')}

              {/* Région — saisie libre + suggestions */}
              {datalistInp(
                `${t.contracts.form.region} *`,
                'regionText', 'dl-regions', regions,
                handleRegionChange, false,
                'Tapez le nom de la région...'
              )}

              {/* Délégation — saisie libre + suggestions filtrées par région */}
              {datalistInp(
                t.contracts.form.delegation,
                'delegationText', 'dl-delegations', delegations,
                handleDelegationChange, false,
                'Tapez la délégation...'
              )}

              {/* Propriétaire — saisie libre + suggestions */}
              {datalistInp(
                `${t.contracts.form.owner} *`,
                'ownerText', 'dl-owners', owners,
                handleOwnerChange, false,
                'Tapez le nom du propriétaire...'
              )}

              {inp(t.contracts.form.propertyType, 'propertyType', 'text', false, 'Bureau, Local commercial...')}
              {inp(t.contracts.form.address, 'address', 'text', false, 'Adresse complète')}
              {inp(t.contracts.col.landReference, 'landReference', 'text', false, 'Référence foncière')}
              {inp(t.contracts.form.contractType, 'contractType', 'text', false, 'Location, Bail...')}
              {inp("PV d'évaluation", 'evaluationPv', 'text', false, 'Date première expertise')}
              {inp("Changement d'activité", 'activityChange', 'text', false, "Description du changement")}
            </div>

            <div className="divider" />

            {/* ── Dates ── */}
            <p style={{ marginBottom: 12, fontSize: '0.7rem', color: 'var(--color-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
              ◆ Dates
            </p>
            <div className="form-grid">
              {inp(t.contracts.form.startDate, 'startDate', 'date', true)}
              {inp(t.contracts.form.endDate, 'endDate', 'date')}
              {inp(t.contracts.form.durationMonths, 'durationMonths', 'number', false, 'Nombre de mois')}
            </div>

            <div className="divider" />

            {/* ── Finances ── */}
            <p style={{ marginBottom: 12, fontSize: '0.7rem', color: 'var(--color-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
              ◆ {t.contracts.detail.finances}
            </p>
            <div className="form-grid">
              {inp(t.contracts.form.initialMonthlyRent, 'initialMonthlyRent', 'number', true, '0.00')}

              {/* Loyer renouvelable — calculé automatiquement */}
              <div className="form-group">
                <label className="form-label">
                  {t.contracts.form.currentMonthlyRent} *
                  <span style={{
                    marginLeft: 6, fontSize: '0.65rem', color: 'var(--color-gold)',
                    background: 'rgba(245,158,11,0.12)', padding: '1px 6px',
                    borderRadius: 4, fontWeight: 600, letterSpacing: 0
                  }}>AUTO</span>
                </label>
                <input
                  type="number" className="form-control"
                  value={form.currentMonthlyRent}
                  onChange={e => set('currentMonthlyRent', e.target.value)}
                  required
                  placeholder="0.00"
                />
                {form.initialMonthlyRent && form.durationMonths && (
                  <span style={{
                    fontSize: '0.7rem', color: 'var(--color-text-muted)',
                    marginTop: 3, display: 'block', lineHeight: 1.4
                  }}>
                    📐 {parseFloat(form.initialMonthlyRent).toFixed(0)} DA
                    {' + '}{Math.floor(parseInt(form.durationMonths) / 36)}
                    {' × 10% = '}
                    <strong style={{ color: 'var(--color-gold)' }}>
                      {(parseFloat(form.initialMonthlyRent) +
                        parseFloat(form.initialMonthlyRent) * 0.10 *
                        Math.floor(parseInt(form.durationMonths) / 36)
                      ).toFixed(2)} DA
                    </strong>
                  </span>
                )}
              </div>
              {/* Charges en pourcentage */}
              <div className="form-group">
                <label className="form-label">{t.contracts.form.charges} (%)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    className="form-control"
                    value={form.charges}
                    onChange={e => set('charges', e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                    style={{ paddingRight: '2.2rem' }}
                  />
                  <span style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--color-gold)',
                    fontWeight: 700, pointerEvents: 'none'
                  }}>%</span>
                </div>
              </div>

              {/* Statut — saisie libre + suggestions */}
              <div className="form-group">
                <label className="form-label">{t.contracts.form.status}</label>
                <input
                  list="dl-status"
                  className="form-control"
                  value={form.status}
                  onChange={e => set('status', e.target.value.toUpperCase())}
                  placeholder="ACTIF, EXPIRE..."
                />
                <datalist id="dl-status">
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{t.contracts.status[s]}</option>
                  ))}
                </datalist>
              </div>
              
              {inp("Augmentations définies", 'definedIncreases', 'text', false, 'Détails des augmentations')}
            </div>

            <div className="divider" />

            {/* ── Observations ── */}
            <div className="form-group">
              <label className="form-label">{t.contracts.form.observations}</label>
              <textarea className="form-control" rows={3}
                value={form.observations}
                onChange={e => set('observations', e.target.value)}
                style={{ resize: 'vertical' }}
                placeholder="Remarques, conditions particulières..."
              />
            </div>

            {/* Indicateur de résolution des FK */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
              {form.region && (
                <span className="badge badge-success">✓ Région: {form.region.name}</span>
              )}
              {form.regionText && !form.region && (
                <span className="badge badge-danger">⚠ Région non reconnue</span>
              )}
              {form.owner && (
                <span className="badge badge-success">✓ Propriétaire: {form.owner.name}</span>
              )}
              {form.ownerText && !form.owner && (
                <span className="badge badge-danger">⚠ Propriétaire non reconnu</span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t.contracts.form.cancel}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <><span className="spinner spinner-sm" /> {t.contracts.form.saving}</>
              ) : (
                t.contracts.form.save
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ─── Page principale ───────────────────────────────────────────────────────
export default function ContractsPage() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const router = useRouter();

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [regions, setRegions] = useState([]);
  const [owners, setOwners] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const PAGE_SIZE = 15;

  // Chargement des données
  const loadContracts = useCallback(async (pageNum = 0, q = '') => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (q.trim()) {
        res = await contractsApi.search(q, pageNum, PAGE_SIZE);
      } else {
        res = await contractsApi.getAll(pageNum, PAGE_SIZE);
      }
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
    loadContracts(page, search);
  }, [page]);

  useEffect(() => {
    regionsApi.getAll().then(res => setRegions(res.data || res || [])).catch(() => {});
    ownersApi.getAll(0, 1000).then(res => setOwners(res.data?.content || res.data || [])).catch(() => {});
  }, []);

  // Recherche avec debounce
  const handleSearch = (val) => {
    setSearch(val);
    if (searchTimeout) clearTimeout(searchTimeout);
    const t2 = setTimeout(() => {
      setPage(0);
      loadContracts(0, val);
    }, 400);
    setSearchTimeout(t2);
  };

  // Créer ou mettre à jour
  const handleSave = async (form) => {
    const payload = {
      ...form,
      region: form.region ? { id: form.region.id } : null,
      delegation: form.delegation ? { id: form.delegation.id } : null,
      owner: form.owner ? { id: form.owner.id } : null,
      initialMonthlyRent: parseFloat(form.initialMonthlyRent) || 0,
      currentMonthlyRent: parseFloat(form.currentMonthlyRent) || 0,
      charges: parseFloat(form.charges) || 0,
      durationMonths: parseInt(form.durationMonths) || null,
    };
    if (editingContract) {
      await contractsApi.update(editingContract.id, payload);
    } else {
      await contractsApi.create(payload);
    }
    loadContracts(page, search);
  };

  // Supprimer
  const handleDelete = async (id) => {
    if (!window.confirm(t.common.confirmDelete)) return;
    try {
      await contractsApi.delete(id);
      loadContracts(page, search);
    } catch { alert(t.common.error); }
  };

  // Exportation Excel
  const handleExportExcel = async () => {
    try {
      const res = await contractsApi.export();
      const data = res.data || res;
      
      const worksheet = XLSX.utils.json_to_sheet(data.map(c => ({
        'N° Contrat': c.contractNumber,
        'Région': c.region?.name || '',
        'Délégation': c.delegation?.name || '',
        'Nom du propriétaire': c.owner?.name || '',
        'Type de contrat': c.contractType || '',
        'Date de début': c.startDate || '',
        'Date de fin': c.endDate || '',
        'Loyer initial': c.initialMonthlyRent || 0,
        'Loyer renouvelable': c.currentMonthlyRent || 0,
        'Loyer annuel': c.annualRent || 0,
        'Statut': c.status || ''
      })));
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contrats");
      XLSX.writeFile(workbook, "Contrats_Location.xlsx");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'exportation Excel");
    }
  };

  // Exportation PDF
  const handleExportPDF = async () => {
    try {
      const res = await contractsApi.export();
      const data = res.data || res;
      
      const doc = new jsPDF('landscape');
      doc.text("Liste des Contrats de Location", 14, 15);
      
      const tableData = data.map(c => [
        c.contractNumber || '',
        c.region?.name || '',
        c.owner?.name || '',
        c.startDate || '',
        c.endDate || '',
        c.initialMonthlyRent ? c.initialMonthlyRent + ' MAD' : '-',
        c.status || ''
      ]);
      
      autoTable(doc, {
        head: [['N°', 'Région', 'Propriétaire', 'Début', 'Fin', 'Loyer Init', 'Statut']],
        body: tableData,
        startY: 20,
      });
      
      doc.save("Contrats_Location.pdf");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'exportation PDF");
    }
  };

  // Formater montant
  const fmt = (val) => {
    if (!val && val !== 0) return '—';
    return new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(val) + ' ' + t.common.currency;
  };

  return (
    <>
      <Navbar title={t.contracts.title} />
      <div className="page-container">

        {/* En-tête de page */}
        <div className="page-header">
          <div>
            <h1 className="page-title">📄 {t.contracts.title}</h1>
            <p className="page-subtitle">
              {totalElements > 0 ? `${totalElements} ${t.common.total}` : ''}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Barre de recherche */}
            <div className="search-bar">
              <span className="search-bar-icon">🔍</span>
              <input
                id="contracts-search"
                type="text"
                className="search-input"
                placeholder={t.contracts.searchPlaceholder}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <button className="btn btn-secondary" onClick={handleExportExcel} title="Exporter en Excel">
              📊 Excel
            </button>
            <button className="btn btn-secondary" onClick={handleExportPDF} title="Exporter en PDF">
              📄 PDF
            </button>

            <button
              className="btn btn-primary"
              onClick={() => { setEditingContract(null); setModalOpen(true); }}
              id="new-contract-btn"
            >
              + {t.contracts.new}
            </button>
          </div>
        </div>

        {/* Titre du tableau (style original arabe) */}
        <div className="table-title-bar" id="table-title">
          {t.contracts.tableTitle}
        </div>

        {/* Erreur */}
        {error && (
          <div className="auth-error mb-4">
            <span>⚠️</span> {error}
            <button className="btn btn-ghost btn-sm" onClick={() => loadContracts(page, search)} style={{ marginLeft: 'auto' }}>
              ↻ Réessayer
            </button>
          </div>
        )}

        {/* Tableau */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table" id="contracts-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t.contracts.col.region}</th>
                  <th>{t.contracts.col.delegation}</th>
                  <th>{t.contracts.col.ownerName}</th>
                  <th>{t.contracts.col.ownerAddress}</th>
                  <th>{t.contracts.col.landReference}</th>
                  <th>{t.contracts.col.address}</th>
                  <th>{t.contracts.col.assessmentReport}</th>
                  <th>{t.contracts.col.propertyType}</th>
                  <th>{t.contracts.col.contractType}</th>
                  <th>{t.contracts.col.startDate}</th>
                  <th>{t.contracts.col.lastAmendment}</th>
                  <th>{t.contracts.col.initialMonthlyRent}</th>
                  <th>{t.contracts.col.currentMonthlyRent}</th>
                  <th>{t.contracts.col.rentIncreases}</th>
                  <th>{t.contracts.col.activityChange}</th>
                  <th>{t.contracts.col.observations}</th>
                  <th>{t.contracts.col.status}</th>
                  <th>{t.contracts.col.actions}</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={19} style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="flex items-center justify-between" style={{ justifyContent: 'center', gap: '10px' }}>
                        <span className="spinner spinner-sm" />
                        <span className="text-muted">{t.contracts.loading}</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && contracts.length === 0 && (
                  <tr>
                    <td colSpan={19}>
                      <div className="empty-state">
                        <span className="empty-state-icon">📭</span>
                        <span className="empty-state-text">{t.contracts.noData}</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && contracts.map((c, i) => (
                  <tr key={c.id} onClick={() => router.push(`/dashboard/contracts/${c.id}`)} id={`contract-row-${c.id}`}>
                    <td className="text-muted text-xs">{page * PAGE_SIZE + i + 1}</td>
                    <td className="text-gold font-semibold">{c.region?.name || '—'}</td>
                    <td>{c.delegation?.name || '—'}</td>
                    <td className="font-semibold">{c.owner?.name || '—'}</td>
                    <td className="text-muted">{c.owner?.address || '—'}</td>
                    <td>{c.landReference || '—'}</td>
                    <td>{c.address || '—'}</td>
                    <td className="text-muted">{c.evaluationPv || '—'}</td>
                    <td>{c.propertyType || '—'}</td>
                    <td>{c.contractType || '—'}</td>
                    <td style={{ color: 'var(--color-info)' }}>
                      {c.startDate
                        ? (() => {
                            const d = new Date(c.startDate);
                            if (isNaN(d.getTime())) return c.startDate;
                            const dd = String(d.getDate()).padStart(2, '0');
                            const mm = String(d.getMonth() + 1).padStart(2, '0');
                            const yyyy = d.getFullYear();
                            return `${dd}/${mm}/${yyyy}`;
                          })()
                        : '—'}
                    </td>
                    <td className="text-muted">
                      {c.amendments?.length > 0
                        ? c.amendments[c.amendments.length - 1].number
                        : '—'}
                    </td>
                    <td style={{ color: 'var(--color-info)', fontWeight: 600 }}>
                      {fmt(c.initialMonthlyRent)}
                    </td>
                    <td style={{ color: 'var(--color-gold)', fontWeight: 700 }}>
                      {fmt(c.currentMonthlyRent)}
                    </td>
                    <td className="text-muted">{c.definedIncreases || '—'}</td>
                    <td className="text-muted">{c.activityChange || '—'}</td>
                    <td className="text-muted text-xs" style={{ maxWidth: '120px' }}>
                      {c.observations ? c.observations.slice(0, 40) + (c.observations.length > 40 ? '…' : '') : '—'}
                    </td>
                    <td><StatusBadge status={c.status} t={t} /></td>
                    <td className="cell-actions" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          title={t.common.edit}
                          onClick={() => { setEditingContract(c); setModalOpen(true); }}
                          id={`edit-contract-${c.id}`}
                        >
                          ✏️
                        </button>
                        {isAdmin && (
                          <button
                            className="btn btn-danger btn-sm btn-icon"
                            title={t.common.delete}
                            onClick={() => handleDelete(c.id)}
                            id={`delete-contract-${c.id}`}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="card-footer">
              <span className="text-muted text-sm">
                {t.common.page} {page + 1} {t.common.of} {totalPages}
                {' '}({totalElements} {t.common.rows})
              </span>
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  id="prev-page-btn"
                >
                  ← {t.common.prev}
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p2 = Math.max(0, page - 3) + i;
                  if (p2 >= totalPages) return null;
                  return (
                    <button key={p2} className={`page-btn ${p2 === page ? 'active' : ''}`}
                      onClick={() => setPage(p2)}>
                      {p2 + 1}
                    </button>
                  );
                })}
                <button
                  className="page-btn"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  id="next-page-btn"
                >
                  {t.common.next} →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modale création / édition */}
      <ContractModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingContract(null); }}
        onSave={handleSave}
        contract={editingContract}
        regions={regions}
        owners={owners}
        t={t}
      />
    </>
  );
}
