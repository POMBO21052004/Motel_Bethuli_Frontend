import api from '../../api/api';
const dashboardService = { get: () => api.get('/reception/dashboard') };
export default dashboardService;
