import api from '../api/api';

const roomService = {
    // --- Admin routes ---
    // Lister avec filtres
    index: (params = {}) => api.get('/admin/rooms', { params }),

    // Détail (admin)
    show: (id) => api.get(`/admin/rooms/${id}`),

    // Créer (FormData pour les images)
    store: (formData) => api.post('/admin/rooms', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),

    // Mettre à jour — backend utilise Route::post pour cette route
    update: (id, formData) => {
        return api.post(`/admin/rooms/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // Supprimer
    destroy: (id) => api.delete(`/admin/rooms/${id}`),

    // Changer le statut rapidement
    updateStatus: (id, status) => api.patch(`/admin/rooms/${id}/status`, { status }),

    // Définir image principale
    setPrimaryImage: (roomId, imageId) => api.patch(`/admin/rooms/${roomId}/images/${imageId}/primary`),

    // --- Public routes (sans auth) ---
    // Chambres disponibles pour le site public
    publicIndex: (params = {}) => api.get('/rooms', { params }),

    // Détail public d'une chambre
    publicShow: (id) => api.get(`/rooms/${id}`),
};

export default roomService;
