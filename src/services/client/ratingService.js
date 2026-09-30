import api from '../../api/api';

const ratingService = {
    getAll: () => api.get('/client/ratings'),
    store: (data) => api.post('/client/ratings', data),
};

export default ratingService;
