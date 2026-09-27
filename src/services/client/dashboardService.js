import api from '../../api/axios';

const dashboardService = {
    get: () => api.get('/client/dashboard'),
};

export default dashboardService;
