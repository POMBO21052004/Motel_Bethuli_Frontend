import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BedDouble, CalendarDays, Star, User } from 'lucide-react';

const navItems = [
    { path: '/client/dashboard',    icon: Home,        label: 'Accueil' },
    { path: '/client/rooms',        icon: BedDouble,   label: 'Chambres' },
    { path: '/client/reservations', icon: CalendarDays, label: 'Séjours' },
    { path: '/client/ratings',      icon: Star,        label: 'Avis' },
    { path: '/client/profile',      icon: User,        label: 'Profil' },
];

export default function BottomNav() {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-40 transition-colors duration-300"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="flex items-stretch justify-around">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center flex-1 py-2.5 gap-1 relative transition-colors duration-200
                            ${isActive ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-amber-500" />
                                )}
                                <item.icon
                                    className={`w-5 h-5 transition-all duration-200 ${isActive ? 'scale-110' : ''}`}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                />
                                <span className={`text-[9px] tracking-wide ${isActive ? 'font-black' : 'font-medium'}`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
