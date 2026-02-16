import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Settings, Scan } from 'lucide-react';

const MobileLayout = () => {
    const location = useLocation();

    const isFullScreenPage = location.pathname.includes('/manual-lookup');

    const isDetailPage = location.pathname.includes('/product/') || location.pathname.includes('/process/');

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white">
            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 overflow-hidden relative">
                {/* <Outlet> renders the child route (Home, Product, etc.) */}
                <Outlet />
            </div>

            {/* NAVIGATION BAR - Only show if NOT a full screen page */}
            {!isFullScreenPage && (
                <nav className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-6 relative z-50 shrink-0">
                    {/* Home Link */}
                    <NavLink
                        to="/mobile/home"
                        className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-500' : 'text-slate-500'}`}
                    >
                        <Home size={24} />
                        <span className="text-[10px] font-bold">Home</span>
                    </NavLink>

                    {/* FLOATING SCAN BUTTON (Visual Only - Actions handled by pages) */}
                    {!isDetailPage && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-900/50 border-4 border-slate-950">
                                <Scan size={32} />
                            </div>
                        </div>
                    )}

                    {/* Setup Link */}
                    <NavLink
                        to="/mobile/setup"
                        className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-500' : 'text-slate-500'}`}
                    >
                        <Settings size={24} />
                        <span className="text-[10px] font-bold">Setup</span>
                    </NavLink>
                </nav>
            )}
        </div>
    );
};

export default MobileLayout;