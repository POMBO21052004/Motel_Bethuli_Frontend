import { useCallback, useEffect, useState } from 'react';
import dashboardService from '../services/client/dashboardService';

export const useClientDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = useCallback(async () => {
        setLoading(true); setError(null);
        try { const response = await dashboardService.get(); setData(response.data); }
        catch (requestError) { setError(requestError.response?.data?.message || 'Impossible de charger votre espace.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
    return { data, loading, error, fetchDashboard };
};
