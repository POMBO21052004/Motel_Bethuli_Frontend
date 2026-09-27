import api from '../../api/axios';

const reservationService = {
    getAll: (params = {}) => api.get('/client/reservations', { params }),
};

export default reservationService;
