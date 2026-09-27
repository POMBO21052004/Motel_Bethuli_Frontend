import { useState, useCallback } from 'react';
import roomService from '../services/roomService';
import { useToast } from '../components/common/ToastContext';

export const useRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const fetchRooms = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await roomService.index(params);
            setRooms(response.data.pagination.data);
            setStats(response.data.stats);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la récupération des chambres');
            showToast('Erreur lors de la récupération des chambres', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const createRoom = async (formData) => {
        setLoading(true);
        try {
            const response = await roomService.store(formData);
            showToast(response.data.message || 'Chambre créée avec succès', 'success');
            return response.data;
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur lors de la création de la chambre', 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateRoom = async (id, formData) => {
        setLoading(true);
        try {
            const response = await roomService.update(id, formData);
            showToast(response.data.message || 'Chambre mise à jour', 'success');
            return response.data;
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteRoom = async (id) => {
        setLoading(true);
        try {
            await roomService.destroy(id);
            showToast('Chambre supprimée avec succès', 'success');
            fetchRooms(); // Refresh
        } catch (err) {
            showToast(err.response?.data?.message || 'Erreur lors de la suppression', 'error');
        } finally {
            setLoading(false);
        }
    };

    const changeStatus = async (id, status) => {
        try {
            await roomService.updateStatus(id, status);
            showToast('Statut mis à jour', 'success');
            fetchRooms(); // Refresh to get accurate stats
        } catch (err) {
            showToast('Erreur lors de la mise à jour du statut', 'error');
        }
    }

    return {
        rooms,
        stats,
        loading,
        error,
        fetchRooms,
        createRoom,
        updateRoom,
        deleteRoom,
        changeStatus
    };
};
