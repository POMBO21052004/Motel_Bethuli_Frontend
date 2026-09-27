import api from '../../api/axios';

const ratingService = {
    getAll: () => api.get('/client/ratings'),
};

export default ratingService;
