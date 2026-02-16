import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Monitor, Scan, LogOut, MapPin, Truck, ArrowLeftRight,
    Keyboard, AlertTriangle, Package, FileText, Settings, RefreshCw, ScanQrCode
} from 'lucide-react';
import QRScanner from '../components/QRScanner';
import api from '../services/api';
import toast from 'react-hot-toast';

const MobileHome = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // --- STATE ---
    const [warehouses, setWarehouses] = useState([]);
    const [currentWarehouse, setCurrentWarehouse] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showScanner, setShowScanner] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ambiguousData, setAmbiguousData] = useState(null);

    // --- INIT ---
    useEffect(() => {
        if (!token) return;

        // 1. Load persisted warehouse
        const savedWh = localStorage.getItem('currentWarehouse');
        if (savedWh) {
            setCurrentWarehouse(JSON.parse(savedWh));
        }

        // 2. Fetch list for selection/switching
        const fetchWarehouses = async () => {
            try {
                const res = await api.get('/api/core/warehouses');
                const data = res.data.content || res.data || [];
                setWarehouses(data);
            } catch (err) {
                console.error("Failed to load warehouses");
            } finally {
                setLoading(false);
            }
        };
        fetchWarehouses();
    }, [token]);

    const handleSelectWarehouse = (wh) => {
        localStorage.setItem('currentWarehouse', JSON.stringify(wh));
        setCurrentWarehouse(wh);
        toast.success(`Checked in to ${wh.locationName}`);
    };

    const handleSwitchLocation = () => {
        if(window.confirm("Switch working location?")) {
            localStorage.removeItem('currentWarehouse');
            setCurrentWarehouse(null);
        }
    };

    // --- SCAN LOGIC ---
    const handleSmartScan = async (code) => {
        setIsProcessing(true);
        try {
            const res = await api.get(`/api/mobile/scan/analyze?code=${code}`);
            const { scanType, poId, productId } = res.data;

            if (scanType === 'PO') {
                // Pass the current warehouse context
                navigate(`/mobile/process/${poId}`, { state: { warehouseId: currentWarehouse.warehouseId } });
            } else if (scanType === 'PRODUCT') {
                navigate(`/mobile/product/${productId}`, { state: { warehouseId: currentWarehouse.warehouseId } });
            } else if (scanType === 'AMBIGUOUS') {
                setAmbiguousData(res.data);
                setShowScanner(false);
            } else {
                toast.error("Unknown barcode");
                setShowScanner(false);
            }
        } catch (err) {
            toast.error("Scan failed");
            setShowScanner(false);
        } finally {
            setIsProcessing(false);
        }
    };

    // --- VIEW: NOT LOGGED IN ---
    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-950 p-6 text-center">
                <Monitor size={48} className="text-slate-600 mb-4" />
                <h2 className="text-white font-bold text-xl">Device Not Linked</h2>
                <button onClick={() => navigate('/mobile/setup')} className="mt-6 w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">
                    Link Device
                </button>
            </div>
        );
    }

    // --- VIEW: SELECT LOCATION (The new "First Step") ---
    if (!currentWarehouse) {
        return (
            <div className="flex flex-col h-full bg-slate-950 p-6">
                <h1 className="text-2xl font-black text-white mb-2">Select Location</h1>
                <p className="text-slate-400 mb-6">Where are you working today?</p>

                <div className="flex-1 overflow-y-auto space-y-3">
                    {loading ? <p className="text-slate-500">Loading locations...</p> :
                        warehouses.map(wh => (
                            <button
                                key={wh.warehouseId}
                                onClick={() => handleSelectWarehouse(wh)}
                                className="w-full p-5 bg-slate-900 border border-slate-800 rounded-2xl text-left flex items-center gap-4 active:bg-blue-600/20 active:border-blue-600 transition-all"
                            >
                                <div className="p-3 bg-slate-800 rounded-xl text-slate-400">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">{wh.locationName}</h3>
                                    <p className="text-slate-500 text-xs uppercase font-bold">{wh.address || 'No Address'}</p>
                                </div>
                            </button>
                        ))}
                </div>
            </div>
        );
    }

    // --- VIEW: MAIN DASHBOARD (Context-Aware) ---
    return (
        <div className="flex flex-col h-full bg-slate-950 p-6 space-y-6 overflow-y-auto pb-32">

            {/* LOCATION HEADER */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Current Location</p>
                    <button
                        onClick={handleSwitchLocation}
                        className="flex items-center gap-2 text-white font-black text-xl active:opacity-70"
                    >
                        {currentWarehouse.locationName} <RefreshCw size={14} className="text-slate-600" />
                    </button>
                </div>
                <button
                    onClick={() => navigate('/mobile/qr-login')}
                    className="p-3 bg-slate-900 text-blue-400 rounded-2xl border border-slate-800"
                >
                    <ScanQrCode size={20} />
                </button>
            </div>

            {/* BIG SCAN BUTTON */}
            <button
                onClick={() => setShowScanner(true)}
                className="w-full aspect-square bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center gap-6 active:scale-95 transition-all border-4 border-slate-900/50"
            >
                <div className="p-6 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                    <Scan size={64} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="text-center">
                    <h2 className="text-3xl font-black text-white">SCAN</h2>
                    <p className="text-blue-100/70 text-sm font-medium">Any item in this warehouse</p>
                </div>
            </button>

            {/* CONTEXT ACTIONS */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => navigate('/mobile/inbound')}
                    className="p-5 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-3 text-white h-32 active:scale-95 transition-transform"
                >
                    <Truck size={28} className="text-emerald-500" />
                    <span className="font-bold text-sm">Inbound</span>
                </button>

                <button
                    onClick={() => navigate('/mobile/transfer')}
                    className="p-5 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-3 text-white h-32 active:scale-95 transition-transform"
                >
                    <ArrowLeftRight size={28} className="text-amber-500" />
                    <span className="font-bold text-sm">Transfer</span>
                </button>
            </div>

            {/* SECONDARY ACTIONS */}
            <div className="space-y-3">
                <button
                    onClick={() => navigate('/mobile/manual-lookup')}
                    className="w-full p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center gap-3 text-slate-400 font-bold"
                >
                    <Keyboard size={18} /> Manual Lookup
                </button>

                <button
                    onClick={() => {
                        if(window.confirm("Unlink device?")) {
                            localStorage.clear();
                            navigate('/login');
                        }
                    }}
                    className="w-full p-4 text-slate-600 text-xs font-bold flex items-center justify-center gap-2"
                >
                    <LogOut size={14} /> Unlink Device
                </button>
            </div>

            {/* --- MODALS (Scanner / Ambiguity) Same as before --- */}
            {ambiguousData && (
                <div className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-6">
                    {/* ... (Keep existing ambiguity modal logic, just navigate with state) ... */}
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[2.5rem] p-8">
                        <h3 className="text-white font-bold text-center mb-4">Select Type</h3>
                        <div className="space-y-3">
                            <button onClick={() => navigate(`/mobile/process/${ambiguousData.poId}`)} className="w-full p-4 bg-blue-600 rounded-xl text-white font-bold">Purchase Order</button>
                            <button onClick={() => navigate(`/mobile/product/${ambiguousData.productId}`)} className="w-full p-4 bg-slate-800 rounded-xl text-white font-bold">Product</button>
                            <button onClick={() => setAmbiguousData(null)} className="w-full p-4 text-slate-500 font-bold">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showScanner && (
                <QRScanner
                    onScan={handleSmartScan}
                    title={`Scan in ${currentWarehouse.locationName}`}
                    instruction="Point at PO or SKU"
                    status={scanStatus}
                    isProcessing={isProcessing}
                    onCancel={() => setShowScanner(false)}
                />
            )}
        </div>
    );
};

export default MobileHome;