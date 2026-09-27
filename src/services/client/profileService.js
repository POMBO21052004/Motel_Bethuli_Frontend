import api from '../../api/axios';

const profileService = {
    get: () => api.get('/client/profile'),
};

export default profileService;
