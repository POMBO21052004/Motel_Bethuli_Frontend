import React from 'react';
import { BedDouble, CalendarDays, Loader2, Users } from 'lucide-react';
import { useReceptionDashboard } from '../../hooks/useReceptionDashboard';

export default function ReceptionDashboard() {
    const { data, loading, error } = useReceptionDashboard();

    if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
    if (error) return <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>;
    const stats = data?.stats || {};
    const cards = [['available_rooms', 'Chambres libres', BedDouble], ['occupied_rooms', 'Chambres occupées', BedDouble], ['pending_reservations', 'En attente', CalendarDays], ['today_reservations', "Aujourd'hui", CalendarDays], ['clients', 'Clients', Users]];

    return <div className="space-y-8"><div><p className="text-sm font-semibold text-amber-600">Espace Réception</p><h1 className="text-3xl font-black text-slate-900 dark:text-white">Tableau de bord</h1><p className="mt-1 text-sm text-slate-500">Les opérations essentielles de l'accueil, en un coup d'oeil.</p></div><div className="grid grid-cols-2 gap-4 lg:grid-cols-5">{cards.map(([key, label, Icon]) => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500"><Icon className="h-5 w-5" /></div><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{stats[key] || 0}</p></div>)}</div><div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-bold text-slate-900 dark:text-white">Activité récente</h2><div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">{(data?.recent_reservations || []).map((item) => <div key={item.id} className="flex items-center justify-between py-3"><div><p className="font-semibold text-slate-800 dark:text-slate-200">{item.client?.prenom} {item.client?.nom}</p><p className="text-xs text-slate-500">{item.room?.name} · {item.reservation_date}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{item.status}</span></div>)}{!data?.recent_reservations?.length && <p className="py-6 text-sm text-slate-500">Aucune activité récente.</p>}</div></div></div>;
}
