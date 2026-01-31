import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ScanLine, Home, Settings } from 'lucide-react';

const MobileLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (

        <div
            className="fixed inset-0 w-full h-[100dvh] flex flex-col bg-slate-950 text-white overflow-hidden"
            style={{
                overscrollBehavior: 'none',
                touchAction: 'manipulation'
            }}
        >

            <header className="shrink-0 p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-20 shadow-md">
                <span className="font-bold text-lg text-blue-400 tracking-tight">SupplyMind</span>
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold border border-slate-700">
                    SM
                </div>
            </header>

            <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth bg-slate-950 relative">
                <Outlet />
            </main>

            <nav className="shrink-0 h-20 bg-slate-900 border-t border-slate-800 flex justify-around items-end pb-4 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">

                <button
                    onClick={() => navigate('/mobile/home')}
                    className={`flex flex-col items-center w-16 transition-colors duration-200 ${location.pathname.includes('home') ? 'text-blue-400' : 'text-slate-500'}`}
                >
                    <Home size={22} strokeWidth={location.pathname.includes('home') ? 2.5 : 2} />
                    <span className="text-[10px] mt-1 font-medium">Home</span>
                </button>

                {/* Floating Action Button Style */}
                <button
                    onClick={() => navigate('/mobile/scanner')}
                    className="relative -top-6"
                >
                    <div className="bg-blue-600 p-4 rounded-full shadow-lg border-[6px] border-slate-950 active:scale-95 transition-transform">
                        <ScanLine size={28} className="text-white" />
                    </div>
                </button>

                <button
                    onClick={() => navigate('/mobile/setup')}
                    className={`flex flex-col items-center w-16 transition-colors duration-200 ${location.pathname.includes('setup') ? 'text-blue-400' : 'text-slate-500'}`}
                >
                    <Settings size={22} strokeWidth={location.pathname.includes('setup') ? 2.5 : 2} />
                    <span className="text-[10px] mt-1 font-medium">Setup</span>
                </button>
            </nav>
        </div>
    );
};

export default MobileLayout;