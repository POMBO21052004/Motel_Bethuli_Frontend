import React from 'react';
import { CalendarDays, CheckCircle2, Clock3, Loader2 } from 'lucide-react';
import { useClientDashboard } from '../../hooks/useClientDashboard';

export default function ClientDashboard() {
    const { data, loading, error } = useClientDashboard();
    if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
    if (error) return <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>;
    const stats = data?.stats || {};
    const cards = [['total', 'Réservations', CalendarDays], ['pending', 'En attente', Clock3], ['confirmed', 'Confirmées', CheckCircle2]];
    return <div className="space-y-8"><div><p className="text-sm font-semibold text-amber-600">Mon espace</p><h1 className="text-3xl font-black text-slate-900 dark:text-white">Bonjour {data?.user?.prenom || ''}</h1><p className="mt-1 text-sm text-slate-500">Retrouvez ici vos séjours et vos informations.</p></div><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{cards.map(([key, label, Icon]) => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><Icon className="h-5 w-5 text-amber-500" /><p className="mt-4 text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{stats[key] || 0}</p></div>)}</div><div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-bold text-slate-900 dark:text-white">Mes derniers séjours</h2><div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">{(data?.reservations || []).map((item) => <div key={item.id} className="flex items-center justify-between py-3"><div><p className="font-semibold text-slate-800 dark:text-slate-200">{item.room?.name}</p><p className="text-xs text-slate-500">{item.reservation_date} · {item.start_time} - {item.end_time}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{item.status}</span></div>)}{!data?.reservations?.length && <p className="py-6 text-sm text-slate-500">Vous n'avez pas encore de réservation.</p>}</div></div></div>;
}
