import { useCallback, useEffect, useState } from 'react';
import reservationService from '../services/client/reservationService';

export const useClientReservations = (status = 'all') => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReservations = useCallback(async () => {
        setLoading(true); setError(null);
        try { const response = await reservationService.getAll({ status }); setReservations(response.data.pagination?.data || []); }
        catch (requestError) { setError(requestError.response?.data?.message || 'Impossible de charger vos réservations.'); }
        finally { setLoading(false); }
    }, [status]);

    useEffect(() => { fetchReservations(); }, [fetchReservations]);
    return { reservations, loading, error, fetchReservations };
};
