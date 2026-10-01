import api from '../../api/api';
const clientService = { getAll: (params = {}) => api.get('/reception/clients', { params }), create: (data) => api.post('/reception/clients', data) };
export default clientService;
