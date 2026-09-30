import api from '../../api/api.jsx';

const clientRoomService = {
    index: () => api.get('/client/rooms'),
};

export default clientRoomService;
