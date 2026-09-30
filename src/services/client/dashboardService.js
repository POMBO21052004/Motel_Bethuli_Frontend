import api from '../../api/api.jsx';

const dashboardService = {
    get: () => api.get('/client/dashboard'),
};

export default dashboardService;
