import api from '../api/api';

const searchService = {
    /**
     * Recherche globale multi-entités
     * @param {string} query - Le terme à rechercher (min 2 caractères)
     * @param {number} limit - Nombre max de résultats par catégorie
     */
    search: (query, limit = 5) => {
        return api.get('/search', { params: { q: query, limit } });
    },
};

export default searchService;
