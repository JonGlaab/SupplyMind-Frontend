import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Scan, LogOut, ScanQrCode, Keyboard, AlertTriangle, Package, FileText } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import api from '../services/api';
import toast from 'react-hot-toast';

const MobileHome = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [showScanner, setShowScanner] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanStatus, setScanStatus] = useState('');
    const [ambiguousData, setAmbiguousData] = useState(null);

    const handleSmartScan = async (code) => {
        setIsProcessing(true);
        setScanStatus('Analyzing code...');

        try {
            const res = await api.get(`/api/mobile/scan/analyze?code=${code}`);
            const { scanType, poId, productId } = res.data;

            if (scanType === 'PO') {
                navigate(`/mobile/process/${poId}`);
            } else if (scanType === 'PRODUCT') {
                // Navigate to product view (to be built)
                navigate(`/mobile/product/${productId}`);
            } else if (scanType === 'AMBIGUOUS') {
                setAmbiguousData(res.data);
                setShowScanner(false);
            } else {
                toast.error("Unknown barcode. Try manual entry.");
                setShowScanner(false);
            }
        } catch (err) {
            console.error(err);
            toast.error("Analysis failed. Check connection.");
            setShowScanner(false);
        } finally {
            setIsProcessing(false);
            setScanStatus('');
        }
    };

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-slate-950">
                <div className="p-4 bg-slate-900 rounded-full text-slate-500 mb-4">
                    <Monitor size={48} />
                </div>
                <h2 className="text-xl font-bold text-white">Device Not Linked</h2>
                <p className="text-slate-400 mt-2 mb-6">Scan the setup QR code on your desktop to link this device.</p>
                <button
                    onClick={() => navigate('/mobile/setup')}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
                >
                    Link Now
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-950 p-6 space-y-6">

            {/* HEADER */}
            <header className="flex justify-between items-center py-2">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">SupplyMind</h1>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Warehouse Ops</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/mobile/qr-login')}
                    className="p-3 bg-slate-900 text-blue-400 rounded-2xl border border-slate-800 active:bg-slate-800"
                >
                    <ScanQrCode size={20} />
                </button>
            </header>

            {/* MAIN SCAN BUTTON */}
            <div className="flex-1 flex flex-col justify-center">
                <button
                    onClick={() => setShowScanner(true)}
                    className="w-full aspect-square bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] shadow-2xl shadow-blue-900/40 flex flex-col items-center justify-center gap-6 active:scale-95 transition-all relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-active:opacity-100 transition-opacity" />
                    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-inner">
                        <Scan size={64} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="text-center px-6">
                        <h2 className="text-3xl font-black text-white">SMART SCAN</h2>
                        <p className="text-blue-100/70 text-sm mt-1 font-medium italic">PO Manifest or Product SKU</p>
                    </div>
                </button>
            </div>

            {/* SECONDARY ACTIONS */}
            <div className="grid grid-cols-1 gap-4">
                <button
                    onClick={() => navigate('/mobile/manual-lookup')}
                    className="w-full p-5 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center gap-3 text-slate-300 font-bold active:bg-slate-800 transition-colors"
                >
                    <Keyboard size={20} className="text-slate-500" />
                    Manual Entry
                </button>

                <button
                    onClick={() => {
                        localStorage.clear();
                        navigate('/login');
                    }}
                    className="w-full p-4 text-slate-600 text-sm font-bold flex items-center justify-center gap-2"
                >
                    <LogOut size={16} />
                    Unlink Device
                </button>
            </div>

            {/* ---  AMBIGUITY MODAL --- */}
            {ambiguousData && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-slate-900 border border-slate-800 w-full rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white text-center mb-2">Ambiguous Scan</h3>
                        <p className="text-slate-400 text-center text-sm mb-8 leading-relaxed">
                            This code matches both a Purchase Order and a Product. Which one did you scan?
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate(`/mobile/process/${ambiguousData.poId}`)}
                                className="w-full p-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-4 active:bg-blue-500"
                            >
                                <div className="p-2 bg-white/10 rounded-lg"><FileText size={20}/></div>
                                <div className="text-left">
                                    <span className="block text-xs opacity-70 uppercase">Handle as</span>
                                    Purchase Order
                                </div>
                            </button>

                            <button
                                onClick={() => navigate(`/mobile/product/${ambiguousData.productId}`)}
                                className="w-full p-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center gap-4 active:bg-slate-700"
                            >
                                <div className="p-2 bg-white/10 rounded-lg"><Package size={20}/></div>
                                <div className="text-left">
                                    <span className="block text-xs opacity-70 uppercase">Handle as</span>
                                    Product SKU
                                </div>
                            </button>

                            <button
                                onClick={() => setAmbiguousData(null)}
                                className="w-full p-4 text-slate-500 text-sm font-bold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SCANNER OVERLAY */}
            {showScanner && (
                <QRScanner
                    onScan={handleSmartScan}
                    title="Smart Scan"
                    instruction="Point at PO or Product"
                    status={scanStatus}
                    isProcessing={isProcessing}
                    onCancel={() => setShowScanner(false)}
                />
            )}
        </div>
    );
};

export default MobileHome;