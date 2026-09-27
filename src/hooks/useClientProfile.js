import { useCallback, useEffect, useState } from 'react';
import profileService from '../services/client/profileService';

export const useClientProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProfile = useCallback(async () => {
        setLoading(true); setError(null);
        try { const response = await profileService.get(); setProfile(response.data.data); }
        catch (requestError) { setError(requestError.response?.data?.message || 'Impossible de charger votre profil.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);
    return { profile, loading, error, fetchProfile };
};
