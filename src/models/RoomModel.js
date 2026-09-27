export const RoomStatus = {
    AVAILABLE: 'available',
    MAINTENANCE: 'maintenance'
};

export class RoomModel {
    constructor() {
        this.name = '';
        this.floor = 0;
        this.capacity = 1;
        this.price_per_day = 0;
        this.price_per_hour = '';
        this.description_fr = '';
        this.description_en = '';
        this.status = RoomStatus.AVAILABLE;
        this.images = [];
        this.primary_image = 0;
    }

    static getStatusLabel(status) {
        switch (status) {
            case RoomStatus.AVAILABLE: return 'Disponible';
            case RoomStatus.MAINTENANCE: return 'En maintenance';
            default: return status;
        }
    }

    static getStatusColor(status) {
        switch (status) {
            case RoomStatus.AVAILABLE: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case RoomStatus.MAINTENANCE: return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    }
}
