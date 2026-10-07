import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Filter, Edit2, Trash2, ShieldAlert, ShieldCheck,
    CheckCircle, Shield, UserX, User, ArrowRight, X, RefreshCw, Eye
} from 'lucide-react';
import useAdministrateurs from '../../../hooks/useAdministrateurs';
import administrateurService from '../../../services/administrateurService';
import { useToast } from '../../../components/common/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';

const T = {
    bg: '#f8fafc', cardBg: '#ffffff', primary: '#f59e0b',
    onSurface: '#0f172a', onSurfaceVariant: '#475569',
    outline: '#94a3b8', outlineVariant: '#cbd5e1',
    surfaceVariant: '#fef3c7', secondary: '#b45309', error: '#ef4444',
};

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');

// ─── Modal ──────────────────────────────────────────────────────────
function PasswordModal({ isOpen, onClose, onConfirm, title, message, type = 'danger', requirePassword = false, loading = false }) {
    const [password, setPassword] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'danger' ? 'bg-red-100 text-red-600' : type === 'success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        {type === 'danger' ? <Trash2 className="w-6 h-6" /> : type === 'success' ? <CheckCircle className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                    </div>
                    <h3 className="text-lg font-bold text-center text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-center text-gray-500 mb-4">{message}</p>
                    {requirePassword && (
                        <div className="mt-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">Votre mot de passe (confirmation)</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-red-500"
                                style={{ borderColor: T.outlineVariant }} autoFocus />
                        </div>
                    )}
                </div>
                <div className="flex border-t border-gray-100">
                    <button onClick={() => { setPassword(''); onClose(); }} className="flex-1 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-100">Annuler</button>
                    <button onClick={() => { onConfirm(requirePassword ? password : null); setPassword(''); }}
                        disabled={loading || (requirePassword && !password)}
                        className={`flex-1 py-3.5 text-sm font-bold transition-colors disabled:opacity-50 ${type === 'danger' ? 'text-red-600 hover:bg-red-50' : type === 'success' ? 'text-green-700 hover:bg-green-50' : 'text-amber-600 hover:bg-amber-50'}`}>
                        {loading ? 'En cours...' : 'Confirmer'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminAdministrateurList() {
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const { administrateurs, meta, stats, loading, refetch, setParams } = useAdministrateurs({ page: 1, search: '', status: 'all' });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);
    const [modalConfig, setModalConfig] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setParams({ page: 1, search: searchTerm, status: statusFilter }), 400);
        return () => clearTimeout(t);
    }, [searchTerm, statusFilter, setParams]);

    const openModal = (config) => setModalConfig(config);
    const closeModal = () => setModalConfig(null);

    const handleSelectAll = (e) => setSelectedIds(e.target.checked ? administrateurs.map(a => a.id) : []);
    const handleSelectOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const handleDelete = (admin) => {
        openModal({
            title: 'Supprimer l\'administrateur',
            message: `Vous êtes sur le point de supprimer ${admin.prenom} ${admin.nom}. Cette action est irréversible.`,
            type: 'danger', requirePassword: true,
            onConfirm: async (password) => {
                setActionLoading(true);
                try {
                    await administrateurService.delete(admin.id, password);
                    toast.success('Administrateur supprimé.');
                    setSelectedIds(p => p.filter(i => i !== admin.id));
                    refetch(); closeModal();
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Erreur lors de la suppression.');
                } finally { setActionLoading(false); }
            }
        });
    };

    const handleToggleStatus = (admin) => {
        const newStatus = !admin.actif;
        openModal({
            title: newStatus ? 'Activer le compte' : 'Désactiver le compte',
            message: `Voulez-vous vraiment ${newStatus ? 'activer' : 'désactiver'} ${admin.prenom} ${admin.nom} ?`,
            type: newStatus ? 'success' : 'warning', requirePassword: false,
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    await administrateurService.toggleActif(admin.id, newStatus);
                    toast.success(`Compte ${newStatus ? 'activé' : 'désactivé'}.`);
                    refetch(); closeModal();
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Erreur.');
                } finally { setActionLoading(false); }
            }
        });
    };

    const handleBulkAction = (action) => {
        if (!selectedIds.length) return;
        const labels = { activate: 'activer', deactivate: 'désactiver', delete: 'supprimer' };
        openModal({
            title: `Action groupée : ${labels[action]}`,
            message: `Vous êtes sur le point de ${labels[action]} ${selectedIds.length} compte(s).`,
            type: action === 'delete' ? 'danger' : action === 'activate' ? 'success' : 'warning',
            requirePassword: action === 'delete',
            onConfirm: async (password) => {
                setActionLoading(true);
                try {
                    await administrateurService.bulkAction(selectedIds, action, password);
                    toast.success(`${selectedIds.length} compte(s) traité(s).`);
                    setSelectedIds([]); refetch(); closeModal();
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Erreur lors de l\'action groupée.');
                } finally { setActionLoading(false); }
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700" style={{ color: T.onSurface }}>
            {/* ── Breadcrumb ─────────────────────────────────── */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: T.outline }}>
                <span className="hover:underline cursor-pointer transition-colors" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
                <ArrowRight className="w-3 h-3" />
                <span style={{ color: T.primary }}>Gestion des Administrateurs</span>
            </div>

            {/* ── Hero Banner ────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl" style={{ background: T.onSurface }}>
                {/* Background decoration */}
                <div className="absolute -right-10 -top-10 opacity-5">
                    <Shield size={240} className="rotate-12" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)` }} />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 rounded-xl border backdrop-blur-md" style={{ background: `${T.primary}30`, borderColor: `${T.primary}50` }}>
                                <Shield className="w-7 h-7" style={{ color: '#4ade80' }} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tight">Administrateurs</h1>
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#4ade80' }}>
                                    Supervision Centrale · Motel Bethuli
                                </p>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                            Gérez les accès à l'interface d'administration.
                            Créez des profils, assignez des rôles et contrôlez les privilèges.
                        </p>
                    </div>

                    {/* Stats panel */}
                    <div className="flex items-center gap-4 p-4 rounded-xl border backdrop-blur-sm flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                        {[
                            { label: 'Total', value: stats?.total ?? administrateurs.length, color: '#f8fafc' },
                            { label: 'Actifs', value: stats?.actifs ?? administrateurs.filter(c => c.actif).length, color: '#4ade80' }
                        ].map((s, i) => (
                            <React.Fragment key={s.label}>
                                {i > 0 && <div className="w-px h-10 opacity-20 bg-white" />}
                                <div className="text-center px-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{s.label}</p>
                                    <p className="text-2xl font-black italic" style={{ color: s.color }}>{s.value}</p>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Search + Actions ──────────────────────────── */}
            <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col lg:flex-row items-center gap-4" style={{ borderColor: `${T.outlineVariant}50` }}>
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: T.outline }} />
                    <input type="text" placeholder="Rechercher par nom, email..."
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                        style={{ background: T.bg, color: T.onSurface }} />
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 lg:flex-none" style={{ background: T.bg }}>
                        <Filter className="w-4 h-4 flex-shrink-0" style={{ color: T.outline }} />
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer outline-none"
                            style={{ color: T.onSurface }}>
                            <option value="all">Tous les statuts</option>
                            <option value="active">Actifs</option>
                            <option value="inactive">Inactifs</option>
                        </select>
                    </div>
                    {(searchTerm || statusFilter !== 'all') && (
                        <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                            className="p-2.5 rounded-xl transition-colors hover:bg-red-50 hover:text-red-500"
                            style={{ color: T.outline }}>
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={() => refetch()} title="Actualiser"
                        className="w-10 h-10 flex items-center justify-center rounded-xl border transition-all hover:shadow-sm"
                        style={{ borderColor: T.outlineVariant, color: T.outline }}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => navigate('/admin/administrateurs/create')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
                        style={{ background: T.primary, boxShadow: `0 4px 14px ${T.primary}40` }}>
                        <Plus className="w-4 h-4" /> Ajouter
                    </button>
                </div>
            </div>

            {/* ── Bulk action bar ───────────────────────────── */}
            {selectedIds.length > 0 && (
                <div className="rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border"
                    style={{ background: T.onSurface, borderColor: '#1e2d40' }}>
                    <div className="flex items-center gap-2 px-2">
                        <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/10 text-white text-xs font-bold">{selectedIds.length}</span>
                        <span className="text-sm font-medium text-slate-300">sélectionné(s)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleBulkAction('activate')} className="px-3 py-1.5 text-xs font-bold bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg border border-green-500/20 transition-colors">Activer</button>
                        <button onClick={() => handleBulkAction('deactivate')} className="px-3 py-1.5 text-xs font-bold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg border border-amber-500/20 transition-colors">Désactiver</button>
                        <div className="w-px h-5 bg-white/10 self-center hidden sm:block" />
                        <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors">Supprimer</button>
                    </div>
                </div>
            )}

            {/* ── Table ─────────────────────────────────────── */}
            {loading && administrateurs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: `${T.primary}30`, borderTopColor: T.primary }} />
                    <span className="text-sm font-medium italic" style={{ color: T.outline }}>Chargement des administrateurs...</span>
                </div>
            ) : administrateurs.length === 0 ? (
                <div className="bg-white rounded-2xl border p-16 text-center shadow-sm" style={{ borderColor: `${T.outlineVariant}50` }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: T.bg }}>
                        <Shield className="w-8 h-8 opacity-20" style={{ color: T.onSurface }} />
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: T.onSurface }}>Aucun administrateur</h3>
                    <p className="text-sm mt-1 mb-6" style={{ color: T.outline }}>Créez le premier compte administrateur.</p>
                    <button onClick={() => navigate('/admin/administrateurs/create')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90"
                        style={{ background: T.primary }}>
                        <Plus className="w-4 h-4" /> Ajouter
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: `${T.outlineVariant}50` }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr style={{ background: `${T.surfaceVariant}40`, borderBottom: `1px solid ${T.outlineVariant}60` }}>
                                    <th className="px-5 py-4 w-12">
                                        <input type="checkbox" className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: T.primary }}
                                            checked={administrateurs.length > 0 && selectedIds.length === administrateurs.length}
                                            onChange={handleSelectAll} />
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: T.outline }}>Admin</th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider hidden md:table-cell" style={{ color: T.outline }}>Rôle</th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider hidden lg:table-cell" style={{ color: T.outline }}>Contact</th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-center hidden lg:table-cell" style={{ color: T.outline }}>Statut</th>
                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-right" style={{ color: T.outline }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: `${T.outlineVariant}20` }}>
                                {administrateurs.map(admin => {
                                    const isSelected = selectedIds.includes(admin.id);
                                    const imgUrl = admin.profil ? `${API_BASE}/storage/${admin.profil}` : null;
                                    const isSelf = user && user.id === admin.id;

                                    return (
                                        <tr key={admin.id}
                                            className="transition-colors group cursor-pointer"
                                            style={{ background: isSelected ? '#f0fdf4' : undefined }}
                                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.bg; }}
                                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = ''; }}
                                            onClick={() => navigate(`/admin/administrateurs/${admin.id}`)}>
                                            <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                                                <input type="checkbox" className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: T.primary }}
                                                    disabled={isSelf}
                                                    checked={isSelected} onChange={() => handleSelectOne(admin.id)} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex-shrink-0">
                                                        {imgUrl ? (
                                                            <img src={imgUrl} alt="Profil" className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform"
                                                                style={{ background: T.surfaceVariant, color: T.primary }}>
                                                                {admin.prenom?.charAt(0)}{admin.nom?.charAt(0)}
                                                            </div>
                                                        )}
                                                        {admin.is_online && (
                                                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white animate-pulse" title="En ligne"></span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold flex items-center gap-2" style={{ color: T.onSurface }}>
                                                            {admin.prenom} {admin.nom}
                                                            {isSelf && <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">Vous</span>}
                                                        </p>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[150px]" style={{ color: T.outline }}>
                                                            {admin.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 hidden md:table-cell">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                                    admin.role === 'SuperAdmin' 
                                                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                                        : 'bg-slate-50 text-slate-700 border-slate-200'
                                                }`}>
                                                    <Shield className="w-3 h-3" />
                                                    {admin.role}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 hidden lg:table-cell">
                                                <div className="text-xs font-medium" style={{ color: T.onSurfaceVariant }}>
                                                    {admin.phone ? `${admin.code_phone || ''} ${admin.phone}` : <span className="italic opacity-50">Non renseigné</span>}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center hidden lg:table-cell">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${admin.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${admin.actif ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                                    {admin.actif ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => handleToggleStatus(admin)} title={admin.actif ? 'Désactiver' : 'Activer'}
                                                        disabled={isSelf}
                                                        className="p-2 rounded-lg transition-all border hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                                        style={{ color: admin.actif ? '#d97706' : '#059669', borderColor: `${T.outlineVariant}60`, background: 'transparent' }}>
                                                        {admin.actif ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => navigate(`/admin/administrateurs/${admin.id}`)}
                                                        className="p-2 rounded-lg transition-all border hover:shadow-sm"
                                                        style={{ color: T.secondary, borderColor: `${T.outlineVariant}60`, background: 'transparent' }}
                                                        title="Voir">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => navigate(`/admin/administrateurs/${admin.id}/edit`)}
                                                        className="p-2 rounded-lg transition-all border hover:shadow-sm"
                                                        style={{ color: T.secondary, borderColor: `${T.outlineVariant}60`, background: 'transparent' }}
                                                        title="Modifier">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(admin)}
                                                        disabled={isSelf}
                                                        className="p-2 rounded-lg transition-all border hover:bg-red-50 hover:border-red-200 text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        style={{ borderColor: `${T.outlineVariant}60`, background: 'transparent' }}
                                                        title="Supprimer">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-5 py-3.5 border-t flex items-center justify-between"
                        style={{ background: `${T.surfaceVariant}30`, borderColor: `${T.outlineVariant}40` }}>
                        <p className="text-xs font-medium" style={{ color: T.onSurfaceVariant }}>
                            {meta?.total ?? administrateurs.length} administrateur(s) au total
                        </p>
                    </div>
                </div>
            )}

            <PasswordModal
                isOpen={!!modalConfig} onClose={closeModal}
                onConfirm={modalConfig?.onConfirm} title={modalConfig?.title}
                message={modalConfig?.message} type={modalConfig?.type}
                requirePassword={modalConfig?.requirePassword} loading={actionLoading}
            />
        </div>
    );
}
