import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Search, UserCheck, UserX, Users } from 'lucide-react';
import adminService from '../../services/adminService';

const labels = { client: 'Clients', receptionniste: 'Réceptionnistes', admin: 'Administrateurs' };

export default function UsersPage({ role }) {
    const [data, setData] = useState({ pagination: { data: [] }, stats: {} });
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(() => {
        setLoading(true);
        adminService.users(role, { search, status })
            .then((response) => setData(response.data))
            .catch(() => setError(`Impossible de charger les ${labels[role].toLowerCase()}.`))
            .finally(() => setLoading(false));
    }, [role, search, status]);

    useEffect(() => { load(); }, [load]);

    const toggleStatus = async (user) => {
        try { await adminService.updateUserStatus(user.id, !user.actif); load(); }
        catch { setError('La modification du statut a échoué.'); }
    };

    return <div className="space-y-6"><div><p className="text-sm font-semibold text-amber-600">Utilisateurs</p><h1 className="text-3xl font-black text-slate-900 dark:text-white">{labels[role]}</h1><p className="mt-1 text-sm text-slate-500">Consultez les comptes et contrôlez leur accès.</p></div><div className="grid grid-cols-3 gap-4">{[['total','Total'],['active','Actifs'],['inactive','Inactifs']].map(([key,label]) => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{data.stats[key] || 0}</p></div>)}</div><div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:flex-row dark:border-slate-800 dark:bg-slate-900"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher par nom, email ou téléphone" className="w-full rounded-xl bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none dark:bg-slate-800" /></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"><option value="all">Tous les statuts</option><option value="active">Actifs</option><option value="inactive">Inactifs</option></select></div>{error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}{loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div> : <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr><th className="px-5 py-4">Utilisateur</th><th className="px-5 py-4">Téléphone</th><th className="px-5 py-4">Statut</th><th className="px-5 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{data.pagination.data.map((user) => <tr key={user.id}><td className="px-5 py-4"><p className="font-bold text-slate-800 dark:text-white">{user.prenom} {user.nom}</p><p className="text-xs text-slate-500">{user.email}</p></td><td className="px-5 py-4 text-slate-500">{user.phone || 'Non renseigné'}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.actif ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{user.actif ? 'Actif' : 'Inactif'}</span></td><td className="px-5 py-4 text-right"><button onClick={() => toggleStatus(user)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50">{user.actif ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}{user.actif ? 'Désactiver' : 'Activer'}</button></td></tr>)}{!data.pagination.data.length && <tr><td colSpan="4" className="px-5 py-12 text-center text-slate-500"><Users className="mx-auto mb-2 h-8 w-8 opacity-30" />Aucun utilisateur trouvé.</td></tr>}</tbody></table></div>}</div>;
}
