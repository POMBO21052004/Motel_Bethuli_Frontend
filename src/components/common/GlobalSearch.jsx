import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, BedDouble, CalendarDays, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const quickLinks = [
    { label: 'Réservations', icon: <CalendarDays className="w-4 h-4" />, path: '/admin/reservations', section: 'Admin' },
    { label: 'Chambres', icon: <BedDouble className="w-4 h-4" />, path: '/admin/rooms', section: 'Admin' },
    { label: 'Clients', icon: <Users className="w-4 h-4" />, path: '/admin/clients', section: 'Admin' },
];

export default function GlobalSearch({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
        }
    }, [isOpen]);

    // Ctrl+K shortcut
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('open-search'));
            }
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    const filtered = quickLinks.filter(link =>
        query === '' || link.label.toLowerCase().includes(query.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
                    {loading
                        ? <Loader2 className="w-5 h-5 text-slate-400 shrink-0 animate-spin" />
                        : <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    }
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Rechercher..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium outline-none"
                    />
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Results */}
                <div className="p-2 max-h-80 overflow-y-auto">
                    {filtered.length > 0 ? (
                        <>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2">
                                Navigation rapide
                            </p>
                            {filtered.map((link) => (
                                <button
                                    key={link.path}
                                    onClick={() => handleNavigate(link.path)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/10 group transition-colors"
                                >
                                    <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-amber-500">
                                        {link.icon}
                                    </span>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{link.label}</p>
                                        <p className="text-[10px] text-slate-400">{link.section}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                                </button>
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-10 text-slate-400">
                            <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">Aucun résultat pour « {query} »</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-mono">↵</kbd>
                        Naviguer
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-mono">Esc</kbd>
                        Fermer
                    </span>
                </div>
            </div>
        </div>
    );
}
