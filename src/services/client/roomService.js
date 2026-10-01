import api from '../../api/api.jsx';

const clientRoomService = {
    index: (params) => api.get('/client/rooms', { params }),
};

export default clientRoomService;
