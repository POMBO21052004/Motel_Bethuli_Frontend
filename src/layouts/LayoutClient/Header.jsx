import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Bell, User, LogOut, Sun, Moon, CalendarDays, BedDouble, Star, ChevronDown } from 'lucide-react';
import { getImageUrl } from '../../utils/getImageUrl.jsx';
import logo from '../../assets/logo.png';

export default function Header({ onToggleNotifications, showNotifications }) {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { unreadCount } = useNotification();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const fullName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Client';
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const desktopLinks = [
        { path: '/client/dashboard', label: 'Accueil' },
        { path: '/client/rooms', label: 'Chambres' },
        { path: '/client/reservations', label: 'Mes Réservations' },
        { path: '/client/ratings', label: 'Mes Avis' },
    ];

    return (
        <header className="sticky top-0 z-30 transition-colors duration-300"
            style={{
                background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: isDark ? '0 1px 0 0 rgba(255,255,255,0.06)' : '0 1px 0 0 rgba(0,0,0,0.06)',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">

                    {/* Logo */}
                    <Link to="/client/dashboard" className="flex items-center gap-2.5 shrink-0">
                        <img src={logo} alt="Motel Bethuli" className="h-8 w-auto object-contain" />
                        <span className="font-black text-base tracking-tight hidden sm:block dark:text-white text-slate-900">
                            Motel Bethuli
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1 flex-1">
                        {desktopLinks.map(link => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                                        isActive
                                            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Theme */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                        >
                            {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
                        </button>

                        {/* Notifications */}
                        <button
                            onClick={onToggleNotifications}
                            className={`relative p-2 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${showNotifications ? 'bg-slate-100 dark:bg-slate-800 text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            <Bell className="w-4.5 h-4.5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                            )}
                        </button>

                        {/* Profile dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 hidden sm:block max-w-[100px] truncate">
                                    {user?.prenom || 'Client'}
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                                    {initials}
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                                            <p className="text-sm font-black text-slate-900 dark:text-white truncate">{fullName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                                        </div>
                                        <div className="p-2">
                                            <Link to="/client/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" onClick={() => setDropdownOpen(false)}>
                                                <User className="w-4 h-4 text-slate-400" /> Mon Profil
                                            </Link>
                                        </div>
                                        <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-black text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                                <LogOut className="w-4 h-4" /> Déconnexion
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
