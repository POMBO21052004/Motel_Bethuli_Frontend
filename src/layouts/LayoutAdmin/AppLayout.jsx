import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import RightSidebar from './RightSidebar';
import GlobalSearch from '../../components/common/GlobalSearch';

export default function DashboardLayout() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const toggleSidebar = () => {
        window.dispatchEvent(new CustomEvent('sidebar-toggle'));
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    // Écoute l'événement custom dispatché par Ctrl+K ou le bouton Header
    useEffect(() => {
        const handleOpenSearch = () => setSearchOpen(true);
        window.addEventListener('open-search', handleOpenSearch);
        return () => window.removeEventListener('open-search', handleOpenSearch);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Fixed Left Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div
                className="flex flex-col transition-all duration-300 min-h-screen"
                style={{
                    paddingLeft: "var(--sidebar-width, 260px)"
                }}
            >
                {/* Responsive override for mobile */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                        @media (max-width: 1279px) {
                            div[style*="padding-left"] {
                                padding-left: 0 !important;
                            }
                        }
                    `
                }} />

                {/* Top Navigation */}
                <Header 
                    onToggleSidebar={toggleSidebar}
                    onToggleNotifications={toggleNotifications}
                    showNotifications={showNotifications}
                    onOpenSearch={() => setSearchOpen(true)}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8 relative bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                    <div className="mx-auto max-w-[1600px] animate-in fade-in duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Sliding Right Sidebar */}
            <div
                className={`fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-700 transition-transform duration-300 ease-in-out z-40 ${showNotifications ? 'translate-x-0' : 'translate-x-full'}`}
                style={{
                    boxShadow: showNotifications ? '-4px 0 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
                }}
            >
                <RightSidebar onClose={toggleNotifications} />
            </div>

            {/* Overlay for notifications (mobile dimming, desktop invisible click-catcher) */}
            {showNotifications && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm xl:bg-transparent xl:backdrop-blur-none z-30"
                    onClick={toggleNotifications}
                />
            )}

            {/* Global Search Modal */}
            <GlobalSearch
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
            />
        </div>
    );
}
