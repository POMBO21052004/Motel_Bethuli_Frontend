import api from '../../api/api';

const adminProfileService = {
    get: () => api.get('/admin/profile'),
    update: (data) => api.post('/admin/profile', data),
    updatePassword: (data) => api.post('/admin/profile/password', data),
};

export default adminProfileService;
