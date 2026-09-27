import React from 'react';
import { X, Bell, Info, CheckCircle, AlertTriangle, ExternalLink, Trash2 } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function RightSidebar({ onClose }) {
    const { notifications, markAsRead, markAllAsRead, deleteAllNotifications, isLoading, desktopNotificationsEnabled, toggleDesktopNotifications } = useNotification();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (diffMins < 1) return "À l'instant";
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays === 1) return "Hier";
        return date.toLocaleDateString();
    };

    const handleNotificationClick = (notif) => {
        if (!notif.read_at) {
            markAsRead(notif.id);
        }
        if (notif.data.action_url) {
            navigate(notif.data.action_url);
            onClose();
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-4 h-4" />;
            case 'warning': return <AlertTriangle className="w-4 h-4" />;
            case 'danger': return <AlertTriangle className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    const getColorClass = (type, isRead) => {
        if (isRead) return 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800';
        
        switch (type) {
            case 'success': return 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30';
            case 'warning': return 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30';
            case 'danger': return 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30';
            default: return 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30';
        }
    };

    const getIconColorClass = (type) => {
        switch (type) {
            case 'success': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
            case 'warning': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
            case 'danger': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
            default: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
        }
    };

    return (
        <div className="h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    <h2 className="font-bold text-slate-900 dark:text-white">Notifications</h2>
                </div>
                <button 
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            {/* Desktop Notifications Toggle */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Popups bureau</span>
                <button
                    onClick={toggleDesktopNotifications}
                    className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-colors ${desktopNotificationsEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${desktopNotificationsEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {isLoading && notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <span className="animate-pulse">Chargement...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center gap-2">
                        <Bell className="w-8 h-8 opacity-20" />
                        <p className="text-sm">Aucune notification</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div 
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3 border rounded-xl flex gap-3 items-start transition-colors cursor-pointer ${getColorClass(notif.data.type, notif.read_at)}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getIconColorClass(notif.data.type)}`}>
                                {getIcon(notif.data.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${notif.read_at ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                    {notif.data.title}
                                </p>
                                <p className={`text-xs mt-0.5 line-clamp-2 ${notif.read_at ? 'text-slate-500 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {notif.data.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                        {formatRelativeTime(notif.created_at)}
                                    </p>
                                    {!notif.read_at && (
                                        <span className="w-2 h-2 rounded-full bg-primary" title="Non lu"></span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {notifications.length > 0 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                    <button 
                        onClick={markAllAsRead}
                        className="w-full py-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                        Tout marquer comme lu
                    </button>
                    {user?.role === 'admin' && (
                        <button 
                            onClick={() => setShowDeleteModal(true)}
                            className="w-full py-2 flex items-center justify-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-red-200 dark:border-red-900/30 rounded-xl bg-white dark:bg-slate-800"
                        >
                            <Trash2 className="w-4 h-4" />
                            Vider toutes les notifications
                        </button>
                    )}
                </div>
            )}

            {/* Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Purger les notifications ?</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                Êtes-vous sûr de vouloir supprimer définitivement TOUTES les notifications de l'application ? Cette action est irréversible.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={async () => {
                                        await deleteAllNotifications();
                                        setShowDeleteModal(false);
                                    }}
                                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                                >
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

