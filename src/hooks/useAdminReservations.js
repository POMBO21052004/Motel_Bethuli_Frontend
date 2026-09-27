import { useCallback, useEffect, useState } from 'react';
import adminService from '../services/adminService';

export const useAdminReservations = (params = {}) => {
    const [data, setData] = useState({ pagination: { data: [] }, stats: {} });
    const [clients, setClients] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReservations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminService.reservations(params);
            setData(response.data);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Impossible de charger les réservations.');
        } finally {
            setLoading(false);
        }
    }, [params.search, params.status]);

    const fetchFormOptions = useCallback(async () => {
        try {
            const [clientsResponse, roomsResponse] = await Promise.all([
                adminService.clients({ per_page: 100 }),
                adminService.rooms({ per_page: 100 }), // all rooms — Create form will handle status display
            ]);
            setClients(clientsResponse.data.pagination?.data || []);
            setRooms(roomsResponse.data.pagination?.data || []);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Impossible de charger les options de réservation.');
        }
    }, []);

    const createReservation = async (reservationData) => {
        const response = await adminService.createReservation(reservationData);
        await fetchReservations();
        return response.data;
    };

    const updateStatus = async (id, status) => {
        const response = await adminService.updateReservationStatus(id, status);
        await fetchReservations();
        return response.data;
    };

    useEffect(() => { fetchReservations(); }, [fetchReservations]);
    useEffect(() => { fetchFormOptions(); }, [fetchFormOptions]);

    return { data, clients, rooms, loading, error, fetchReservations, createReservation, updateStatus };
};
