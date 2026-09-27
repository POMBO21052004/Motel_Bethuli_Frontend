import { useState, useEffect, useCallback } from 'react';
import clientService from '../services/clientService';

/**
 * Hook pour gérer la liste des clients avec pagination et filtres.
 */
const useClients = (defaultParams = {}) => {
    const [clients, setClients] = useState([]);
    const [meta, setMeta] = useState(null);
    const [stats, setStats] = useState({ total: 0, actifs: 0, inactifs: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [params, setParams] = useState(defaultParams);

    const fetchClients = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await clientService.getAll(params);
            const data = res.data;
            setClients(data.pagination?.data || []);
            setMeta(data.pagination);
            setStats(data.stats || { total: 0, actifs: 0, inactifs: 0 });
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    return {
        clients,
        meta,
        stats,
        loading,
        error,
        refetch: fetchClients,
        params,
        setParams,
    };
};

export default useClients;
