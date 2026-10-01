import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import RightSidebar from './RightSidebar';

export default function LayoutClient() {
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 transition-colors duration-300 flex flex-col">
            <Header
                onToggleNotifications={() => setShowNotifications(v => !v)}
                showNotifications={showNotifications}
            />

            {/* Content: pad-bottom only on mobile for BottomNav */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-24 md:pb-8 transition-all duration-300">
                <div className="animate-in fade-in duration-300">
                    <Outlet />
                </div>
            </main>

            {/* Mobile bottom navigation */}
            <BottomNav />

            {/* Notification panel */}
            <div className={`fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white border-l border-slate-100 transition-transform duration-300 ease-in-out z-50 ${showNotifications ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ boxShadow: showNotifications ? '-8px 0 30px -8px rgba(0,0,0,0.12)' : 'none' }}
            >
                <RightSidebar onClose={() => setShowNotifications(false)} />
            </div>

            {showNotifications && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => setShowNotifications(false)} />
            )}
        </div>
    );
}
