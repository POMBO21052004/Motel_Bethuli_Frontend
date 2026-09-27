import api from '../api/api';

const entrepriseService = {
    getAll: (params = {}) => api.get('/entreprises', { params }),
    
    getById: (id) => api.get(`/entreprises/${id}`),
    
    create: (data) => api.post('/entreprises', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    update: (id, data) => {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return api.post(`/entreprises/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.put(`/entreprises/${id}`, data);
    },
    
    delete: (id) => api.delete(`/entreprises/${id}`),
};

export default entrepriseService;
