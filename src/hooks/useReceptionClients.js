import { useCallback, useEffect, useState } from 'react';
import clientService from '../services/reception/clientService';
export const useReceptionClients = (search = '') => {
    const [clients, setClients] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(null);
    const fetchClients = useCallback(async () => { setLoading(true); setError(null); try { const response = await clientService.getAll({ search, per_page: 100 }); setClients(response.data.pagination?.data || []); } catch (requestError) { setError(requestError.response?.data?.message || 'Impossible de charger les clients.'); } finally { setLoading(false); } }, [search]);
    const createClient = async (data) => { const response = await clientService.create(data); await fetchClients(); return response.data; };
    useEffect(() => { fetchClients(); }, [fetchClients]); return { clients, loading, error, fetchClients, createClient };
};
