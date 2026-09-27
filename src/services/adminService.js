import api from '../api/axios';

const adminService = {
    dashboard: () => api.get('/admin/dashboard'),
    users: (role, params = {}) => api.get(`/admin/users/${role}`, { params }),
    updateUserStatus: (id, actif) => api.patch(`/admin/users/${id}/status`, { actif }),
    reservations: (params = {}) => api.get('/admin/reservations', { params }),
    createReservation: (data) => api.post('/admin/reservations', data),
    checkAvailability: (params) => api.get('/admin/reservations/check-availability', { params }),
    getReservation: (id) => api.get(`/admin/reservations/${id}`),
    updateReservation: (id, data) => api.put(`/admin/reservations/${id}`, data),
    deleteReservation: (id) => api.delete(`/admin/reservations/${id}`),
    updateReservationStatus: (id, status) => api.patch(`/admin/reservations/${id}/status`, { status }),
    clients: (params = {}) => api.get('/admin/users/client', { params }),
    rooms: (params = {}) => api.get('/admin/rooms', { params }),
    ratings: (params = {}) => api.get('/admin/ratings', { params }),
    deleteRating: (id) => api.delete(`/admin/ratings/${id}`),
};

export default adminService;
