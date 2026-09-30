import api from '../../api/api';

const reservationService = {
    getAll: (params = {}) => api.get('/client/reservations', { params }),
    store: (data) => api.post('/client/reservations', data),
};

export default reservationService;
