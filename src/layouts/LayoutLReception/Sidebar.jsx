import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    Hotel,
    BedDouble,
    CalendarDays,
    Users,
    Star,
    ChevronDown,
    ArrowLeftRight,
    LogOut,
    Shield,
    Settings,
    UserSearch
} from 'lucide-react';
import logo from '../../assets/logo.png';

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem('mb_sidebar_collapsed') === 'true'; } catch { return false; }
    });
    const [mobileOpen, setMobileOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState(['dashboard', 'hotel', 'utilisateurs', 'administration']);
    
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    useEffect(() => {
        document.documentElement.style.setProperty(
            '--sidebar-width',
            collapsed ? '72px' : '260px'
        );
        try { localStorage.setItem('mb_sidebar_collapsed', String(collapsed)); } catch {}
    }, [collapsed]);

    useEffect(() => {
        const handler = () => setMobileOpen((prev) => !prev);
        window.addEventListener('sidebar-toggle', handler);
        return () => window.removeEventListener('sidebar-toggle', handler);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setMobileOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const toggleSection = (sectionId) => {
        if (collapsed) return;
        setExpandedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const menuSections = [
        {
            id: 'dashboard',
            title: 'Principal',
            icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
            items: [
                { label: 'Tableau de bord', icon: <LayoutDashboard className="w-[18px] h-[18px]" />, path: '/reception/dashboard' },
            ],
            show: true
        },
        {
            id: 'operations',
            title: 'Opérations',
            icon: <CalendarDays className="w-[18px] h-[18px]" />,
            items: [
                { label: 'Réservations', icon: <CalendarDays className="w-[18px] h-[18px]" />, path: '/reception/reservations' },
                { label: 'Chambres', icon: <BedDouble className="w-[18px] h-[18px]" />, path: '/reception/rooms' },
            ],
            show: true
        },
        {
            id: 'clients',
            title: 'Clients',
            icon: <Users className="w-[18px] h-[18px]" />,
            items: [
                { label: 'Liste des clients', icon: <Users className="w-[18px] h-[18px]" />, path: '/reception/clients' },
            ],
            show: true
        },
    ].filter(section => section.show !== false);

    const renderMenuItem = (item) => {
        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

        return (
            <div key={item.path} className="relative group/item mb-1">
                <Link
                    to={item.path}
                    className={`
                        flex items-center rounded-xl text-sm transition-all duration-200
                        ${collapsed ? 'justify-center mx-2 py-2.5 px-0' : 'gap-3 px-3 py-2.5 mx-2'}
                    `}
                    style={{
                        backgroundColor: isActive ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                        color: isActive ? '#f59e0b' : '#A3A3A3',
                        borderLeft: isActive && !collapsed ? '2px solid #f59e0b' : '2px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                        if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                            e.currentTarget.style.color = '#FFFFFF';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#A3A3A3';
                        }
                    }}
                >
                    <span className={`flex-shrink-0 ${isActive ? 'text-amber-500' : ''}`}>
                        {item.icon}
                    </span>
                    {!collapsed && (
                        <span className="flex-1 flex items-center justify-between">
                            <span className="font-medium truncate">{item.label}</span>
                        </span>
                    )}
                </Link>

                {collapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap hidden group-hover/item:block z-50 shadow-lg">
                        {item.label}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                    </div>
                )}
            </div>
        );
    };

    const renderSection = (section) => {
        const isExpanded = expandedSections.includes(section.id) || collapsed;
        const hasActive = section.items.some(
            (item) => location.pathname === item.path || location.pathname.startsWith(item.path + '/')
        );

        return (
            <div key={section.id} className="space-y-0.5 mt-2">
                {!collapsed ? (
                    <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between px-5 py-2 transition-colors duration-200 group/section"
                        style={{ color: hasActive ? '#f59e0b' : '#A3A3A3' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                        onMouseLeave={(e) => e.currentTarget.style.color = hasActive ? '#f59e0b' : '#A3A3A3'}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm">{section.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">{section.title}</span>
                        </div>
                        <ChevronDown
                            className={`w-[14px] h-[14px] transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                        />
                    </button>
                ) : (
                    <div className="relative group/section my-2">
                        <div className="h-px mx-4 bg-white/10" />
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg whitespace-nowrap hidden group-hover/section:block z-50 shadow-lg">
                            {section.title}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                        </div>
                    </div>
                )}

                <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                        maxHeight: isExpanded ? `${section.items.length * 48}px` : '0px',
                        opacity: isExpanded ? 1 : 0,
                    }}
                >
                    <div className={`space-y-0.5 pt-1 ${!collapsed ? 'pl-2' : ''}`}>
                        {section.items.map((item) => renderMenuItem(item))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 z-[45] ${
                    mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                onClick={() => setMobileOpen(false)}
            />

            <aside
                className={`
                    fixed top-0 left-0 bottom-0 flex flex-col bg-[#111827] text-slate-300
                    transition-transform duration-300 ease-in-out z-[50] shadow-xl border-r border-white/5
                    ${collapsed ? 'w-[260px] lg:w-[72px]' : 'w-[260px]'}
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className={`flex items-center py-6 ${collapsed ? 'px-0 justify-center' : 'px-4 justify-between'}`}>
                    <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'w-full justify-center' : ''}`}>
                        <div className="flex-shrink-0 flex items-center justify-center">
                            <BedDouble className={`${collapsed ? 'w-8 h-8' : 'w-10 h-10'} text-amber-500 transition-all duration-300`} />
                        </div>
                        <div className={`min-w-0 overflow-hidden ${collapsed ? 'lg:hidden' : 'block'}`}>
                            <h1 className="text-sm font-black tracking-tight text-white truncate">Motel Bethuli</h1>
                            <p className="text-[9px] font-semibold uppercase tracking-widest text-amber-500 truncate">Réception</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setCollapsed(true)}
                        className={`p-1.5 rounded-lg transition-all hover:bg-white/10 hidden lg:block text-slate-400 hover:text-white ${collapsed ? 'lg:hidden' : ''}`}
                    >
                        <ArrowLeftRight className="w-4 h-4" />
                    </button>
                </div>

                <button
                    onClick={() => setCollapsed(false)}
                    className={`mx-auto mb-2 p-1.5 rounded-lg transition-all hover:bg-white/10 hidden lg:flex items-center justify-center text-slate-400 hover:text-white ${!collapsed ? 'lg:hidden' : ''}`}
                >
                    <ArrowLeftRight className="w-4 h-4" />
                </button>

                <nav className="flex-1 px-2 space-y-1 overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700">
                    {menuSections.map((section) => renderSection(section))}
                </nav>

                <div className="p-3 mt-auto">
                    {!collapsed ? (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg">
                                    {`${user?.prenom || ''}${user?.nom || ''}`.trim().substring(0, 2).toUpperCase() || 'AD'}
                                </div>
                                <div className="min-w-0 overflow-hidden">
                                    <p className="text-sm font-bold text-white truncate">
                                        {`${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Réceptionniste'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate">{user?.email || ''}</p>
                                </div>
                            </div>
                            <div className="h-px w-full bg-white/10" />
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4 shrink-0" />
                                    Déconnexion
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                title="Déconnexion"
                            >
                                <LogOut className="w-5 h-5 shrink-0" />
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
