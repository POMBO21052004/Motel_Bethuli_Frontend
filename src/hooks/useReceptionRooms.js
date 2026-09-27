import { useCallback, useEffect, useState } from 'react';
import roomService from '../services/reception/roomService';
export const useReceptionRooms = ({ status = 'all', per_page: perPage = 50 } = {}) => {
    const [rooms, setRooms] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(null);
    const fetchRooms = useCallback(async () => { setLoading(true); setError(null); try { const response = await roomService.getAll({ status, per_page: perPage }); setRooms(response.data.pagination?.data || []); } catch (requestError) { setError(requestError.response?.data?.message || 'Impossible de charger les chambres.'); } finally { setLoading(false); } }, [status, perPage]);
    useEffect(() => { fetchRooms(); }, [fetchRooms]); return { rooms, loading, error, fetchRooms };
};
