import api from '../../api/axios';
const reservationService = { getAll: (params = {}) => api.get('/reception/reservations', { params }), create: (data) => api.post('/reception/reservations', data), updateStatus: (id, status) => api.patch(`/reception/reservations/${id}/status`, { status }) };
export default reservationService;
