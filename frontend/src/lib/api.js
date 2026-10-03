import axiosInstance from '@/lib/axios';

// ─── Authentification ─────────────────────────────────────────────────────────
export const authApi = {
  login: async (email, password) => {
    const res = await axiosInstance.post('/api/auth/login', { email, password });
    return res.data;
  },
  refresh: async (refreshToken) => {
    const res = await axiosInstance.post('/api/auth/refresh', { refreshToken });
    return res.data;
  },
};

// ─── Contrats ─────────────────────────────────────────────────────────────────
export const contractsApi = {
  getAll: async (page = 0, size = 20, sort = 'id,asc') => {
    const res = await axiosInstance.get('/api/contracts', {
      params: { page, size, sort },
    });
    return res.data;
  },
  getById: async (id) => {
    const res = await axiosInstance.get(`/api/contracts/${id}`);
    return res.data;
  },
  create: async (contract) => {
    const res = await axiosInstance.post('/api/contracts', contract);
    return res.data;
  },
  update: async (id, contract) => {
    const res = await axiosInstance.put(`/api/contracts/${id}`, contract);
    return res.data;
  },
  delete: async (id) => {
    const res = await axiosInstance.delete(`/api/contracts/${id}`);
    return res.data;
  },
  search: async (q, page = 0, size = 20) => {
    const res = await axiosInstance.get('/api/contracts/search', {
      params: { q, page, size },
    });
    return res.data;
  },
  getExpiring: async (days = 30) => {
    const res = await axiosInstance.get('/api/contracts/expiring', { params: { days } });
    return res.data;
  },
  getExpired: async () => {
    const res = await axiosInstance.get('/api/contracts/expired');
    return res.data;
  },
  getRecent: async () => {
    const res = await axiosInstance.get('/api/contracts/recent');
    return res.data;
  },
  getByRegion: async (regionId, page = 0, size = 20) => {
    const res = await axiosInstance.get(`/api/contracts/region/${regionId}`, {
      params: { page, size },
    });
    return res.data;
  },
  getByDelegation: async (delegationId, page = 0, size = 20) => {
    const res = await axiosInstance.get(`/api/contracts/delegation/${delegationId}`, {
      params: { page, size },
    });
    return res.data;
  },
  export: async () => {
    const res = await axiosInstance.get('/api/contracts/export');
    return res.data;
  },
};

// ─── Propriétaires ────────────────────────────────────────────────────────────
export const ownersApi = {
  getAll: async (page = 0, size = 20) => {
    const res = await axiosInstance.get('/api/owners', { params: { page, size } });
    return res.data;
  },
  getById: async (id) => {
    const res = await axiosInstance.get(`/api/owners/${id}`);
    return res.data;
  },
  create: async (owner) => {
    const res = await axiosInstance.post('/api/owners', owner);
    return res.data;
  },
  update: async (id, owner) => {
    const res = await axiosInstance.put(`/api/owners/${id}`, owner);
    return res.data;
  },
  delete: async (id) => {
    const res = await axiosInstance.delete(`/api/owners/${id}`);
    return res.data;
  },
};

// ─── Régions ─────────────────────────────────────────────────────────────────
export const regionsApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/api/regions');
    return res.data;
  },
  create: async (region) => {
    const res = await axiosInstance.post('/api/regions', region);
    return res.data;
  },
  update: async (id, region) => {
    const res = await axiosInstance.put(`/api/regions/${id}`, region);
    return res.data;
  },
  delete: async (id) => {
    const res = await axiosInstance.delete(`/api/regions/${id}`);
    return res.data;
  },
};

// ─── Délégations ──────────────────────────────────────────────────────────────
export const delegationsApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/api/delegations');
    return res.data;
  },
  getByRegion: async (regionId) => {
    const res = await axiosInstance.get(`/api/delegations/region/${regionId}`);
    return res.data;
  },
  create: async (delegation) => {
    const res = await axiosInstance.post('/api/delegations', delegation);
    return res.data;
  },
  update: async (id, delegation) => {
    const res = await axiosInstance.put(`/api/delegations/${id}`, delegation);
    return res.data;
  },
  delete: async (id) => {
    const res = await axiosInstance.delete(`/api/delegations/${id}`);
    return res.data;
  },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getSummary: async () => {
    const res = await axiosInstance.get('/api/dashboard/summary');
    return res.data;
  },
};
