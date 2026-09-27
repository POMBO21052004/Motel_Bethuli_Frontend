import api from '../../api/axios';
const dashboardService = { get: () => api.get('/reception/dashboard') };
export default dashboardService;
