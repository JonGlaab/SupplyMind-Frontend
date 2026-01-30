import { useNavigate } from 'react-router-dom';
import { Monitor, Package, UploadCloud, LogOut, CheckCircle } from 'lucide-react';

const MobileHome = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-6">
                <div className="p-4 bg-slate-800 rounded-full text-slate-400">
                    <Monitor size={32} />
                </div>
                <h2 className="text-xl font-bold text-white">Device Not Linked</h2>
                <button
                    onClick={() => navigate('/mobile/setup')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-lg"
                >
                    Go to Setup
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24">


            <header className="flex justify-between items-center py-2">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Mobile Companion</p>
                </div>
                <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>ONLINE</span>
                </div>
            </header>


            <button
                onClick={() => navigate('/mobile/scanner')}
                className="w-full relative overflow-hidden group bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-3xl shadow-xl shadow-blue-900/20 active:scale-95 transition-all duration-200 text-left"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Monitor size={120} />
                </div>

                <div className="relative z-10 flex flex-col items-start gap-4">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                        <Monitor size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Unlock Desktop</h2>
                        <p className="text-blue-100 text-sm font-medium opacity-80 mt-1">Scan QR code to login</p>
                    </div>
                </div>
            </button>


            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800 flex flex-col gap-3 items-start opacity-50 grayscale">
                    <div className="p-2 bg-slate-800 rounded-xl">
                        <Package size={24} className="text-slate-400" />
                    </div>
                    <span className="font-semibold text-slate-300 text-sm">Scan SKU</span>
                </div>

                <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800 flex flex-col gap-3 items-start opacity-50 grayscale">
                    <div className="p-2 bg-slate-800 rounded-xl">
                        <UploadCloud size={24} className="text-slate-400" />
                    </div>
                    <span className="font-semibold text-slate-300 text-sm">Upload PO</span>
                </div>
            </div>

            <button
                onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                }}
                className="w-full p-4 rounded-2xl border border-red-900/30 bg-red-950/10 text-red-400 font-semibold text-sm flex items-center justify-center gap-2 active:bg-red-950/30 transition-colors"
            >
                <LogOut size={16} />
                <span>Unlink Device</span>
            </button>
        </div>
    );
};

export default MobileHome;