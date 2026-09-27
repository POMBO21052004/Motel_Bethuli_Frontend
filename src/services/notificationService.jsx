import api from '../api/api';

const notificationService = {
    /**
     * Récupère la liste des notifications paginées
     * @param {number} page 
     */
    getNotifications: (page = 1) => {
        return api.get('/notifications', { params: { page } });
    },

    /**
     * Récupère le nombre de notifications non lues
     */
    getUnreadCount: () => {
        return api.get('/notifications/unread');
    },

    /**
     * Marque une notification spécifique comme lue
     * @param {string} id 
     */
    markAsRead: (id) => {
        return api.post(`/notifications/${id}/mark-read`);
    },

    /**
     * Marque toutes les notifications comme lues
     */
    markAllAsRead: () => {
        return api.post('/notifications/mark-all-read');
    },

    /**
     * Supprime toutes les notifications (Admin uniquement)
     */
    deleteAll: () => {
        return api.delete('/notifications/delete-all');
    }
};

export default notificationService;
