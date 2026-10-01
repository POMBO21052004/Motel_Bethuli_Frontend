import api from '../../api/api';
const roomService = { getAll: (params = {}) => api.get('/reception/rooms', { params }) };
export default roomService;
