import api from '../../api/axios';
const roomService = { getAll: (params = {}) => api.get('/reception/rooms', { params }) };
export default roomService;
