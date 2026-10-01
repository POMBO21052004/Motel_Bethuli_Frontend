import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Bell, LogOut, Sun, Moon, ChevronDown, User } from 'lucide-react';
import { getImageUrl } from '../../utils/getImageUrl.jsx';
import logo from '../../assets/logo.png';

export default function Header({ onToggleNotifications, showNotifications }) {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { unreadCount } = useNotification();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = async () => {
        setDropdownOpen(false);
        await logout();
        navigate('/login', { replace: true });
    };

    const fullName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Client';
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const navLinks = [
        { path: '/client/dashboard', label: 'Accueil' },
        { path: '/client/rooms', label: 'Chambres' },
        { path: '/client/reservations', label: 'Mes Réservations' },
        // { path: '/client/ratings', label: 'Mes Avis' },
    ];

    return (
        <header className="w-full bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

                {/* Logo */}
                <Link to="/client/dashboard" className="flex-shrink-0 flex items-center gap-2">
                    <img src={logo} alt="Motel Bethuli" className="h-8 w-auto object-contain" />
                    <span className="font-serif font-bold text-xl text-slate-800 tracking-tight hidden sm:block">
                        Motel <span className="text-amber-500">Bethuli</span>
                    </span>
                </Link>

                {/* Nav links — centered */}
                <nav className="hidden md:flex items-center h-full gap-1">
                    {navLinks.map(({ path, label }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `inline-flex items-center h-full px-4 text-sm font-medium border-b-2 transition-colors duration-150 ` +
                                (isActive
                                    ? 'border-amber-500 text-amber-600'
                                    : 'border-transparent text-slate-600 hover:border-amber-400 hover:text-amber-500')
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-2 flex-shrink-0">

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                        title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* Bell */}
                    <button
                        onClick={onToggleNotifications}
                        className={`relative p-2 rounded-lg transition-colors ${
                            showNotifications
                                ? 'text-amber-500 bg-amber-50'
                                : 'text-slate-500 hover:text-amber-500 hover:bg-amber-50'
                        }`}
                        title="Notifications"
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Profile dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(prev => !prev)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                        >
                            {/* Avatar */}
                            {user?.photo ? (
                                <img
                                    src={getImageUrl(user.photo)}
                                    alt={fullName}
                                    className="h-7 w-7 rounded-lg object-cover"
                                />
                            ) : (
                                <span className="h-7 w-7 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                                    {initials}
                                </span>
                            )}
                            <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
                                {fullName}
                            </span>
                            <ChevronDown
                                size={14}
                                className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                            {/* Dropdown menu */}
                        {dropdownOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setDropdownOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
                                    <div className="px-4 py-2 border-b border-slate-100">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mon compte</p>
                                        <p className="text-sm font-medium text-slate-800 truncate">{fullName}</p>
                                        {user?.email && (
                                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                        )}
                                    </div>
                                    <Link
                                        to="/client/profile"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <User size={15} className="text-slate-400" />
                                        Mon Profil
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={15} />
                                        Se déconnecter
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
