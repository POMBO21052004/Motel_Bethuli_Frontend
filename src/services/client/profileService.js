import api from '../../api/api';

const profileService = {
    get: () => api.get('/client/profile'),
    update: (data) => api.post('/client/profile', data),
    updatePassword: (data) => api.post('/client/profile/password', data),
    updateCni: (data) => api.post('/client/profile/cni', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default profileService;
