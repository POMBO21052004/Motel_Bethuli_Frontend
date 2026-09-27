import { useState, useEffect, useCallback } from 'react';
import administrateurService from '../services/administrateurService';

/**
 * Hook pour gérer la liste des administrateurs avec pagination et filtres.
 *
 * @param {Object} defaultParams - Paramètres de requête initiaux
 * @returns {{ administrateurs, meta, stats, loading, error, refetch, params, setParams }}
 */
const useAdministrateurs = (defaultParams = {}) => {
    const [administrateurs, setAdministrateurs] = useState([]);
    const [meta, setMeta] = useState(null);
    const [stats, setStats] = useState({ total: 0, actifs: 0, inactifs: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [params, setParams] = useState(defaultParams);

    const fetchAdministrateurs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await administrateurService.getAll(params);
            
            if (response.data?.pagination) {
                setAdministrateurs(response.data.pagination.data || []);
                setMeta({
                    current_page: response.data.pagination.current_page,
                    last_page: response.data.pagination.last_page,
                    total: response.data.pagination.total,
                    per_page: response.data.pagination.per_page,
                });
                setStats(response.data.stats || { total: 0, actifs: 0, inactifs: 0 });
            } else {
                setAdministrateurs(response.data?.data || response.data || []);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des administrateurs.');
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchAdministrateurs();
    }, [fetchAdministrateurs]);

    return {
        administrateurs,
        meta,
        stats,
        loading,
        error,
        refetch: fetchAdministrateurs,
        params,
        setParams,
    };
};

export default useAdministrateurs;
