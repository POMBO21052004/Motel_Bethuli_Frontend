import api from '../../api/api';

const ratingService = {
    getAll: () => api.get('/client/ratings'),
    upsert: (data) => api.post('/client/ratings', data),
};

export default ratingService;
