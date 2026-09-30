import api from '../api/api';

const BASE = '/admin/clients';

const clientService = {
    getAll: (params = {}) =>
        api.get(BASE, { params }),

    getById: (id) =>
        api.get(`${BASE}/${id}`),

    create: (data) =>
        api.post(BASE, data),

    update: (id, data) =>
        api.post(`${BASE}/${id}`, data),

    delete: (id, password_confirmation) =>
        api.delete(`${BASE}/${id}`, { data: { password_confirmation } }),

    bulkAction: (ids, action, password_confirmation = null) =>
        api.post(`${BASE}/bulk-action`, { ids, action, password_confirmation }),

    toggleActif: (id, actif) =>
        api.patch(`${BASE}/${id}`, { actif }),

    terminateSessions: (id) =>
        api.post(`${BASE}/${id}/terminate-sessions`),

    forceVerify: (id) =>
        api.post(`${BASE}/${id}/force-verify`),

    toggleCniVerified: (id) =>
        api.post(`${BASE}/${id}/toggle-cni-verified`),
};

export default clientService;
