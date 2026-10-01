/* =========================================================
   Loyer1 - Frontend Logic & Single Page Application Engine
   ========================================================= */

const API_BASE = '/api';

// --- State Management ---
const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  currentTab: 'dashboard',
  contracts: [],
  owners: [],
  regions: [],
  dashboardData: null
};

// --- HTTP Fetch Helper with Authorization ---
async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(state.token ? { 'Authorization': `Bearer ${state.token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (res.status === 401) {
      logout();
      throw new Error('Session expirée');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Une erreur est survenue');
    return data;
  } catch (err) {
    showToast(err.message, 'danger');
    throw err;
  }
}

// --- Auth Functions ---
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const loginErr = document.getElementById('loginError');
  loginErr.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await res.json();

    if (result.success && result.data && result.data.token) {
      state.token = result.data.token;
      state.user = {
        email: result.data.email,
        fullName: result.data.fullName,
        role: result.data.role
      };
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));

      document.getElementById('loginOverlay').style.display = 'none';
      document.getElementById('appMain').style.display = 'flex';
      initApp();
    } else {
      loginErr.innerText = result.message || 'Identifiants invalides';
      loginErr.style.display = 'block';
    }
  } catch (err) {
    loginErr.innerText = 'Impossible de se connecter au serveur';
    loginErr.style.display = 'block';
  }
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.getElementById('loginOverlay').style.display = 'flex';
  document.getElementById('appMain').style.display = 'none';
}

// --- Navigation ---
function navigateTo(tabName) {
  state.currentTab = tabName;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeBtn) activeBtn.closest('.nav-item').classList.add('active');

  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  const targetContent = document.getElementById(`tab-${tabName}`);
  if (targetContent) targetContent.style.display = 'block';

  const titles = {
    dashboard: 'Tableau de Bord & KPIs',
    contracts: 'Gestion des Contrats de Location',
    owners: 'Gestion des Propriétaires',
    regions: 'Régions & Délégations',
    audit: 'Journal d\'Audit'
  };
  document.getElementById('pageTitle').innerText = titles[tabName] || 'Loyer1';

  loadTabData(tabName);
}

function loadTabData(tab) {
  if (tab === 'dashboard') fetchDashboard();
  if (tab === 'contracts') fetchContracts();
  if (tab === 'owners') fetchOwners();
  if (tab === 'regions') fetchRegions();
}

// --- Dashboard ---
async function fetchDashboard() {
  try {
    const res = await apiFetch('/dashboard/summary');
    if (res.data) {
      const data = res.data;
      document.getElementById('kpiTotalContracts').innerText = data.totalContracts || 0;
      document.getElementById('kpiActiveContracts').innerText = data.activeContracts || 0;
      document.getElementById('kpiExpiredContracts').innerText = data.expiredContracts || 0;
      document.getElementById('kpiTotalRent').innerText = (data.totalAnnualRent || 0).toLocaleString('fr-FR') + ' TND';

      renderRegionBreakdown(data.rentsByRegion || {});
    }
  } catch (err) {
    console.error(err);
  }
}

function renderRegionBreakdown(regionData) {
  const container = document.getElementById('regionBreakdown');
  if (!container) return;
  container.innerHTML = Object.entries(regionData).map(([region, amount]) => `
    <div style="margin-bottom: 1rem;">
      <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem; font-size:0.9rem;">
        <span>${region}</span>
        <span style="font-weight:bold;">${amount.toLocaleString('fr-FR')} TND</span>
      </div>
      <div style="background:rgba(255,255,255,0.1); height:8px; border-radius:4px; overflow:hidden;">
        <div style="background:var(--primary-500); height:100%; width: ${Math.min(100, (amount / 50000) * 100)}%;"></div>
      </div>
    </div>
  `).join('') || '<p style="color:var(--text-muted)">Aucune donnée disponible</p>';
}

// --- Contracts ---
async function fetchContracts() {
  try {
    const res = await apiFetch('/contracts?page=0&size=50');
    const contracts = res.data ? (res.data.content || res.data) : [];
    state.contracts = contracts;
    renderContractsTable(contracts);
  } catch (err) {
    console.error(err);
  }
}

let editingContractId = null;

function renderContractsTable(contracts) {
  const tbody = document.getElementById('contractsTbody');
  if (!tbody) return;

  if (contracts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">Aucun contrat trouvé</td></tr>`;
    return;
  }

  tbody.innerHTML = contracts.map(c => `
    <tr>
      <td><strong>${c.contractNumber || ('CTR-' + c.id)}</strong></td>
      <td>${c.owner ? (c.owner.name || c.owner.fullName || c.owner.companyName) : 'N/A'}</td>
      <td>${c.delegation ? c.delegation.name : (c.region ? c.region.name : 'N/A')}</td>
      <td>${(c.currentMonthlyRent || c.initialMonthlyRent || 0).toLocaleString()} TND</td>
      <td><strong style="color:var(--primary-500);">${(c.annualRent || 0).toLocaleString()} TND</strong></td>
      <td><span class="badge badge-${(c.status || 'actif').toLowerCase()}">${c.status || 'ACTIF'}</span></td>
      <td>
        <div style="display:flex; gap:0.4rem;">
          <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="editContract(${c.id})">✏️ Modifier</button>
          <button class="btn btn-danger" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="deleteContract(${c.id})">🗑️ Supprimer</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterContracts(query) {
  if (!query) {
    renderContractsTable(state.contracts);
    return;
  }
  const q = query.toLowerCase();
  const filtered = state.contracts.filter(c => 
    (c.contractNumber && c.contractNumber.toLowerCase().includes(q)) ||
    (c.owner && c.owner.name && c.owner.name.toLowerCase().includes(q)) ||
    (c.delegation && c.delegation.name && c.delegation.name.toLowerCase().includes(q))
  );
  renderContractsTable(filtered);
}

function prepareNewContract() {
  editingContractId = null;
  document.getElementById('modalTitle').innerText = 'Nouveau Contrat de Location';
  document.getElementById('modalContractNumber').value = 'CTR-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
  document.getElementById('modalOwnerName').value = 'Société Immobilière Loyer';
  document.getElementById('modalRegionName').value = 'Tunis';
  document.getElementById('modalDelegationName').value = 'Tunis Centre';
  document.getElementById('modalMonthlyRent').value = '';
  document.getElementById('modalAnnualRent').value = '';
  document.getElementById('modalStartDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('modalDurationYears').value = 1;
  updateContractCalculations();
  openModal('contractModal');
}

function editContract(id) {
  const contract = state.contracts.find(c => c.id === id);
  if (!contract) return;

  editingContractId = id;
  document.getElementById('modalTitle').innerText = 'Modifier le Contrat N° ' + (contract.contractNumber || contract.id);
  document.getElementById('modalContractNumber').value = contract.contractNumber || '';
  document.getElementById('modalOwnerName').value = contract.owner ? (contract.owner.name || contract.owner.fullName || '') : 'Société Immobilière Loyer';
  document.getElementById('modalRegionName').value = contract.region ? contract.region.name : 'Tunis';
  document.getElementById('modalDelegationName').value = contract.delegation ? contract.delegation.name : 'Tunis Centre';
  document.getElementById('modalMonthlyRent').value = contract.currentMonthlyRent || contract.initialMonthlyRent || 0;
  document.getElementById('modalStartDate').value = contract.startDate || new Date().toISOString().split('T')[0];
  document.getElementById('modalDurationYears').value = contract.durationMonths ? Math.round(contract.durationMonths / 12) : 1;
  updateContractCalculations();
  openModal('contractModal');
}

async function deleteContract(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) return;

  try {
    await apiFetch(`/contracts/${id}`, { method: 'DELETE' });
    showToast('Contrat supprimé avec succès', 'success');
    fetchContracts();
    fetchDashboard();
  } catch (err) {
    console.error(err);
  }
}

// --- Owners ---
async function fetchOwners() {
  try {
    const res = await apiFetch('/owners?page=0&size=50');
    const owners = res.data ? (res.data.content || res.data) : [];
    state.owners = owners;
    renderOwnersTable(owners);
  } catch (err) {
    console.error(err);
  }
}

function renderOwnersTable(owners) {
  const tbody = document.getElementById('ownersTbody');
  if (!tbody) return;

  if (owners.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Aucun propriétaire trouvé</td></tr>`;
    return;
  }

  tbody.innerHTML = owners.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.fullName || o.companyName || 'N/A'}</td>
      <td><span class="badge badge-en_attente">${o.type || 'PHYSIQUE'}</span></td>
      <td>${o.cin || o.taxId || 'N/A'}</td>
      <td>${o.phone || o.email || 'N/A'}</td>
    </tr>
  `).join('');
}

// --- Regions ---
async function fetchRegions() {
  try {
    const res = await apiFetch('/regions');
    const regions = res.data || [];
    state.regions = regions;
    renderRegionsList(regions);
  } catch (err) {
    console.error(err);
  }
}

function renderRegionsList(regions) {
  const container = document.getElementById('regionsGrid');
  if (!container) return;

  container.innerHTML = regions.map(r => `
    <div class="card" style="margin-bottom:1rem;">
      <h3 style="font-size:1.1rem; margin-bottom:0.5rem; color:var(--primary-500);">${r.name}</h3>
      <p style="font-size:0.85rem; color:var(--text-muted);">Code: ${r.code || 'N/A'}</p>
    </div>
  `).join('') || '<p style="color:var(--text-muted)">Aucune région enregistrée</p>';
}

// --- R01 & R02 Auto Calculation in Contract Modal ---
function updateContractCalculations() {
  const monthly = parseFloat(document.getElementById('modalMonthlyRent').value) || 0;
  const duration = parseInt(document.getElementById('modalDurationYears').value) || 1;
  const startDateStr = document.getElementById('modalStartDate').value;

  // R01: Loyer Annuel = Loyer Mensuel * 12
  document.getElementById('modalAnnualRent').value = (monthly * 12).toFixed(2);

  // R02: Date Fin = Date Début + Durée
  if (startDateStr) {
    const start = new Date(startDateStr);
    start.setFullYear(start.getFullYear() + duration);
    document.getElementById('modalEndDate').value = start.toISOString().split('T')[0];
  }
}

async function populateContractDropdowns() {
  try {
    const [ownersRes, delRes] = await Promise.all([
      apiFetch('/owners?page=0&size=100'),
      apiFetch('/delegations')
    ]);

    const owners = ownersRes.data ? (ownersRes.data.content || ownersRes.data) : [];
    const delegations = delRes.data || [];

    state.owners = owners;
    state.delegations = delegations;

    const ownerSelect = document.getElementById('modalOwnerId');
    if (ownerSelect) {
      ownerSelect.innerHTML = owners.map(o => `<option value="${o.id}">${o.name || o.fullName || o.companyName || ('Propriétaire #' + o.id)}</option>`).join('') || '<option value="">Aucun propriétaire</option>';
    }

    const delSelect = document.getElementById('modalDelegationId');
    if (delSelect) {
      delSelect.innerHTML = delegations.map(d => `<option value="${d.id}" data-region-id="${d.region ? d.region.id : 1}">${d.name} (${d.region ? d.region.name : 'Région'})</option>`).join('') || '<option value="">Aucune délégation</option>';
    }
  } catch (err) {
    console.error('Erreur chargement listes', err);
  }
}

async function handleSaveContract(e) {
  e.preventDefault();
  const monthly = parseFloat(document.getElementById('modalMonthlyRent').value) || 0;
  const annual = parseFloat(document.getElementById('modalAnnualRent').value) || (monthly * 12);
  const durationYears = parseInt(document.getElementById('modalDurationYears').value) || 1;
  
  const ownerName = document.getElementById('modalOwnerName').value.trim() || 'Propriétaire Général';
  const regionName = document.getElementById('modalRegionName').value.trim() || 'Tunis';
  const delegationName = document.getElementById('modalDelegationName').value.trim() || 'Tunis Centre';

  try {
    // 1. Recherche ou Création du Propriétaire
    let ownerId = state.owners && state.owners[0] ? state.owners[0].id : 1;
    try {
      const oRes = await apiFetch('/owners', {
        method: 'POST',
        body: JSON.stringify({ name: ownerName, type: 'PERSONNE_MORALE' })
      });
      if (oRes.data && oRes.data.id) ownerId = oRes.data.id;
    } catch (e) {
      if (state.owners && state.owners[0]) ownerId = state.owners[0].id;
    }

    // 2. Recherche ou Création de la Région
    let regionId = state.regions && state.regions[0] ? state.regions[0].id : 1;
    try {
      const rRes = await apiFetch('/regions', {
        method: 'POST',
        body: JSON.stringify({ name: regionName, code: regionName.substring(0, 3).toUpperCase() })
      });
      if (rRes.data && rRes.data.id) regionId = rRes.data.id;
    } catch (e) {
      if (state.regions && state.regions[0]) regionId = state.regions[0].id;
    }

    // 3. Recherche ou Création de la Délégation
    let delegationId = 1;
    try {
      const dRes = await apiFetch('/delegations', {
        method: 'POST',
        body: JSON.stringify({ name: delegationName, code: delegationName.substring(0, 2).toUpperCase(), region: { id: regionId } })
      });
      if (dRes.data && dRes.data.id) delegationId = dRes.data.id;
    } catch (e) {
      delegationId = 1;
    }

    const payload = {
      contractNumber: document.getElementById('modalContractNumber').value,
      initialMonthlyRent: monthly,
      currentMonthlyRent: monthly,
      annualRent: annual,
      startDate: document.getElementById('modalStartDate').value,
      endDate: document.getElementById('modalEndDate').value,
      durationMonths: durationYears * 12,
      status: 'ACTIF',
      owner: { id: ownerId },
      delegation: { id: delegationId },
      region: { id: regionId }
    };

    if (editingContractId) {
      await apiFetch(`/contracts/${editingContractId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Contrat modifié avec succès !', 'success');
    } else {
      await apiFetch('/contracts', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Contrat créé avec succès !', 'success');
    }

    closeModal('contractModal');
    fetchContracts();
    fetchDashboard();
  } catch (err) {
    console.error(err);
  }
}

// --- Utilities ---
function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function showToast(msg, type = 'info') {
  alert(`[${type.toUpperCase()}] ${msg}`);
}

function initApp() {
  if (state.user) {
    document.getElementById('usernameDisplay').innerText = state.user.fullName || state.user.email;
    document.getElementById('userRoleDisplay').innerText = state.user.role || 'Utilisateur';
  }
  navigateTo('dashboard');
}

// --- Window Init ---
window.addEventListener('DOMContentLoaded', () => {
  if (state.token) {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('appMain').style.display = 'flex';
    initApp();
  } else {
    document.getElementById('loginOverlay').style.display = 'flex';
    document.getElementById('appMain').style.display = 'none';
  }
});
