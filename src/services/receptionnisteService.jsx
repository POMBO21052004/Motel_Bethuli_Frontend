import api from '../api/api';

const BASE = '/admin/receptionnistes';

const receptionnisteService = {
    getAll: (params = {}) =>
        api.get(BASE, { params }),

    getById: (id) =>
        api.get(`${BASE}/${id}`),

    create: (data) =>
        api.post(BASE, data),

    update: (id, data) => {
        if (data instanceof FormData) {
            // data.append('_method', 'PUT');
            return api.post(`${BASE}/${id}`, data);
        }
        return api.post(`${BASE}/${id}`, data);
    },

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
};

export default receptionnisteService;
