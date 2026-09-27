import { useState, useEffect, useCallback } from 'react';
import receptionnisteService from '../services/receptionnisteService';

/**
 * Hook pour gérer la liste des receptionnistes avec pagination et filtres.
 *
 * @param {Object} defaultParams - Paramètres de requête initiaux
 * @returns {{ receptionnistes, meta, stats, loading, error, refetch, params, setParams }}
 */
const useReceptionnistes = (defaultParams = {}) => {
    const [receptionnistes, setReceptionnistes] = useState([]);
    const [meta, setMeta] = useState(null);
    const [stats, setStats] = useState({ total: 0, actifs: 0, inactifs: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [params, setParams] = useState(defaultParams);

    const fetchReceptionnistes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await receptionnisteService.getAll(params);
            
            if (response.data?.pagination) {
                setReceptionnistes(response.data.pagination.data || []);
                setMeta({
                    current_page: response.data.pagination.current_page,
                    last_page: response.data.pagination.last_page,
                    total: response.data.pagination.total,
                    per_page: response.data.pagination.per_page,
                });
                setStats(response.data.stats || { total: 0, actifs: 0, inactifs: 0 });
            } else {
                setReceptionnistes(response.data?.data || response.data || []);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des receptionnistes.');
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchReceptionnistes();
    }, [fetchReceptionnistes]);

    return {
        receptionnistes,
        meta,
        stats,
        loading,
        error,
        refetch: fetchReceptionnistes,
        params,
        setParams,
    };
};

export default useReceptionnistes;
