export const ReservationStatus = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
};

export class ReservationModel {
    static getStatusLabel(status) {
        return {
            [ReservationStatus.PENDING]: 'En attente',
            [ReservationStatus.CONFIRMED]: 'Confirmée',
            [ReservationStatus.CANCELLED]: 'Annulée',
        }[status] || status;
    }

    static getStatusColor(status) {
        return {
            [ReservationStatus.PENDING]: 'bg-amber-100 text-amber-700',
            [ReservationStatus.CONFIRMED]: 'bg-emerald-100 text-emerald-700',
            [ReservationStatus.CANCELLED]: 'bg-rose-100 text-rose-700',
        }[status] || 'bg-slate-100 text-slate-700';
    }
}
