import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
    Menu, 
    Bell, 
    User,
    LogOut,
    Search,
    Sun,
    Moon,
    HelpCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';

export default function Header({ onToggleSidebar, onToggleNotifications, showNotifications, onOpenSearch }) {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { unreadCount, desktopNotificationsEnabled, toggleDesktopNotifications } = useNotification();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const fullName = user
        ? (`${user.name || ''}`.trim() || user.username || user.email || 'Utilisateur')
        : 'Utilisateur';
    const initials = fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <header 
            className="border-b px-4 md:px-8 py-3 md:py-4 sticky top-0 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700/60 transition-colors duration-300"
            style={{ zIndex: 30, boxShadow: isDark ? '0 1px 3px 0 rgba(0,0,0,0.3)' : '0 1px 3px 0 rgba(0,0,0,0.02)' }}
        >
            <div className="flex items-center justify-between mx-auto max-w-[1600px]">

                {/* ── Left : menu mobile + logo + search ── */}
                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={onToggleSidebar}
                        className="lg:hidden p-2 rounded-xl transition-colors bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                        aria-label="Ouvrir le menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="hidden md:flex items-center gap-6">
                        <span className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <div className="bg-amber-500 rounded p-1">
                                <span className="text-white text-xs">MB</span>
                            </div>
                            Motel Bethuli
                        </span>

                        {/* ── Search button — déclenche la palette ── */}
                        <button
                            onClick={onOpenSearch}
                            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                            aria-label="Ouvrir la recherche"
                        >
                            <Search className="w-4 h-4 group-hover:text-primary transition-colors" />
                            <span className="text-sm font-medium">Rechercher...</span>
                            <div className="flex items-center gap-0.5 ml-4 opacity-50 group-hover:opacity-70 transition-opacity">
                                <kbd className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm leading-none">Ctrl</kbd>
                                <span className="text-[10px] px-0.5">+</span>
                                <kbd className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm leading-none">K</kbd>
                            </div>
                        </button>
                    </div>

                    {/* Search icon mobile */}
                    <button
                        onClick={onOpenSearch}
                        className="md:hidden p-2 rounded-xl transition-colors bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                        aria-label="Rechercher"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Right : theme toggle + notifs + profil ── */}
                <div className="flex items-center gap-1 md:gap-3">

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 md:p-2.5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                        title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
                        aria-label="Changer le thème"
                    >
                        {isDark
                            ? <Sun className="w-5 h-5 text-amber-400" />
                            : <Moon className="w-5 h-5" />
                        }
                    </button>

                    {/* Tutorial Toggle */}
                    <button
                        onClick={() => setIsTutorialOpen(true)}
                        className="p-2 md:p-2.5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                        title="Guide et Tutoriel de l'application"
                        aria-label="Tutoriel"
                    >
                        <HelpCircle className="w-5 h-5 text-indigo-500" />
                    </button>

                    {/* Notifications */}
                    <button
                        onClick={onToggleNotifications}
                        className={`p-2 md:p-2.5 rounded-xl transition-all relative hover:bg-slate-100 dark:hover:bg-slate-800 ${showNotifications ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}
                        title="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 md:top-1.5 md:right-1.5 text-white text-[9px] md:text-[10px] rounded-full h-3.5 w-3.5 md:h-4 md:w-4 flex items-center justify-center font-bold bg-primary border-2 border-white dark:border-slate-900 animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Divider + User info + avatar */}
                    <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 ml-1 md:ml-2 border-l border-slate-100 dark:border-slate-700 relative">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[140px]" title={`${user?.prenom || ''} ${user?.nom || ''}`.trim()}>
                                {`${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Utilisateur'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                                {user?.email || ''}
                            </p>
                        </div>

                        {/* Avatar */}
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="h-9 w-9 md:h-10 md:w-10 rounded-xl md:rounded-2xl flex items-center justify-center transition-all bg-primary/10 border border-primary/20 hover:border-primary/40 text-primary font-bold text-sm shrink-0"
                            title={fullName}
                        >
                            {initials || <User className="w-5 h-5" />}
                        </button>

                        {/* Dropdown */}
                        {dropdownOpen && (
                            <>
                                {/* Overlay pour fermer le dropdown */}
                                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />

                                <div className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-50">
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                            {`${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Utilisateur'}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || ''}</p>
                                    </div>

                                    {/* Thème dans le dropdown */}
                                    <button
                                        onClick={() => { toggleTheme(); setDropdownOpen(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                                        {isDark ? 'Mode Clair' : 'Mode Sombre'}
                                    </button>

                                    <Link 
                                        to="/profil" 
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <User className="w-4 h-4" />
                                        Mon Profil
                                    </Link>

                                    {/* Notifications Bureau */}
                                    <button
                                        onClick={toggleDesktopNotifications}
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
                                    >
                                        <Bell className="w-4 h-4" />
                                        <span>Popups bureau</span>
                                        <div className={`ml-auto w-8 h-4 rounded-full flex items-center px-0.5 transition-colors ${desktopNotificationsEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${desktopNotificationsEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                    </button>

                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Déconnexion
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

        </header>
    );
}
