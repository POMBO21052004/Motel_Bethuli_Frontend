import api from '../../api/api';

const reservationService = {
    getAll: (params = {}) => api.get('/client/reservations', { params }),
    show: (id) => api.get(`/client/reservations/${id}`),
    store: (data) => api.post('/client/reservations', data),
    checkAvailability: (params) => api.get('/client/reservations/check-availability', { params }),
};

export default reservationService;
