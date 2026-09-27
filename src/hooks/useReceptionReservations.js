import { useCallback, useEffect, useState } from 'react';
import reservationService from '../services/reception/reservationService';
export const useReceptionReservations = (status = 'all') => {
    const [reservations, setReservations] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(null);
    const fetchReservations = useCallback(async () => { setLoading(true); setError(null); try { const response = await reservationService.getAll({ status }); setReservations(response.data.pagination?.data || []); } catch (requestError) { setError(requestError.response?.data?.message || 'Impossible de charger les réservations.'); } finally { setLoading(false); } }, [status]);
    const createReservation = async (data) => { const response = await reservationService.create(data); await fetchReservations(); return response.data; };
    const updateStatus = async (id, value) => { const response = await reservationService.updateStatus(id, value); await fetchReservations(); return response.data; };
    useEffect(() => { fetchReservations(); }, [fetchReservations]); return { reservations, loading, error, fetchReservations, createReservation, updateStatus };
};
