import { useCallback, useEffect, useState } from 'react';
import ratingService from '../services/client/ratingService';

export const useClientRatings = () => {
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRatings = useCallback(async () => {
        setLoading(true); setError(null);
        try { const response = await ratingService.getAll(); setRatings(response.data.data || []); }
        catch (requestError) { setError(requestError.response?.data?.message || 'Impossible de charger vos avis.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchRatings(); }, [fetchRatings]);
    return { ratings, loading, error, fetchRatings };
};
