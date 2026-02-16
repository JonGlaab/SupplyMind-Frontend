import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    ArrowLeft, Search, FileText, Package, ChevronRight, Loader2, Delete, CornerDownLeft, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

const MobileManualLookup = () => {
    const navigate = useNavigate();

    // GET CONTEXT
    const currentWarehouse = JSON.parse(localStorage.getItem('currentWarehouse'));

    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!currentWarehouse) navigate('/mobile/home');
    }, []);

    // ... (Keep existing search logic executeSearch / handleKeyPress) ...
    const executeSearch = async (searchTerm) => {
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        setResult(null);

        try {
            const res = await api.get(`/api/mobile/scan/analyze?code=${searchTerm.trim()}`);
            setResult(res.data);

            if (res.data.scanType === 'UNKNOWN') {
                toast.error("No match found");
            }
        } catch (err) {
            toast.error("Connection failed");
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyPress = (key) => {
        if (key === 'ENTER') { executeSearch(query); return; }
        if (key === 'BACKSPACE') { setQuery(prev => prev.slice(0, -1)); return; }
        if (key === 'PO-' || key === 'SKU-') {
            if (query.startsWith('PO-') || query.startsWith('SKU-')) {
                const numberPart = query.split('-')[1] || '';
                setQuery(key + numberPart);
            } else {
                setQuery(key + query);
            }
            return;
        }
        setQuery(prev => prev + key);
    };


    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white">
            {/* 1. HEADER WITH CONTEXT */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 shrink-0">
                <button onClick={() => navigate('/mobile/home')} className="flex items-center gap-2 text-slate-400 mb-4">
                    <ArrowLeft size={18} /> <span>Back</span>
                </button>

                {/* Context Indicator */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Searching in</span>
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1 bg-blue-400/10 px-2 py-0.5 rounded">
                        <MapPin size={10} /> {currentWarehouse?.locationName}
                    </span>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        readOnly
                        placeholder="Select Prefix..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-xl font-mono tracking-wider text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
                    {isSearching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="animate-spin text-blue-500" />
                        </div>
                    )}
                </div>
            </div>

            {/* 2. RESULTS AREA (Scrollable Middle) - NO CHANGES NEEDED BELOW THIS */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* ... (Existing Results Logic) ... */}
                {result && result.scanType !== 'UNKNOWN' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Best Match</p>

                        {(result.scanType === 'PO' || result.scanType === 'AMBIGUOUS') && (
                            <button
                                onClick={() => navigate(`/mobile/process/${result.poId}`)}
                                className="w-full mb-3 p-5 bg-slate-900 border border-slate-800 rounded-[2rem] flex items-center gap-4 active:bg-slate-800 text-left"
                            >
                                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                                    <FileText size={24} />
                                </div>
                                <div className="flex-1">
                                    <span className="block text-xs text-slate-500 font-bold uppercase">Purchase Order</span>
                                    <span className="text-lg font-bold">#{result.poId}</span>
                                    <p className="text-xs text-slate-400">{result.supplierName}</p>
                                </div>
                                <ChevronRight className="text-slate-600" />
                            </button>
                        )}

                        {(result.scanType === 'PRODUCT' || result.scanType === 'AMBIGUOUS') && (
                            <button
                                onClick={() => navigate(`/mobile/product/${result.productId}`)}
                                className="w-full p-5 bg-slate-900 border border-slate-800 rounded-[2rem] flex items-center gap-4 active:bg-slate-800 text-left"
                            >
                                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                                    <Package size={24} />
                                </div>
                                <div className="flex-1">
                                    <span className="block text-xs text-slate-500 font-bold uppercase">Product SKU</span>
                                    <span className="text-lg font-bold">{result.productName}</span>
                                    <p className="text-xs text-slate-400 font-mono">{result.productSku}</p>
                                </div>
                                <ChevronRight className="text-slate-600" />
                            </button>
                        )}
                    </div>
                ) : (
                    !isSearching && (
                        <div className="h-full flex items-center justify-center opacity-20">
                            <div className="text-center">
                                <Search size={48} className="mx-auto mb-2" />
                                <p className="text-sm font-bold">Waiting for input...</p>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* 3. CUSTOM KEYPAD (Fixed Bottom)  */}
            <div className="bg-slate-900 p-4 pb-8 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-slate-800 z-10 shrink-0">
                {/* Prefix Row */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                        onClick={() => handleKeyPress('PO-')}
                        className="py-4 rounded-2xl bg-blue-600/10 text-blue-400 font-black text-lg active:bg-blue-600 active:text-white transition-colors border border-blue-600/20"
                    >
                        PO-
                    </button>
                    <button
                        onClick={() => handleKeyPress('SKU-')}
                        className="py-4 rounded-2xl bg-emerald-500/10 text-emerald-400 font-black text-lg active:bg-emerald-500 active:text-white transition-colors border border-emerald-500/20"
                    >
                        SKU-
                    </button>
                </div>

                {/* Numeric Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleKeyPress(num.toString())}
                            className="h-16 rounded-2xl bg-slate-800 text-white text-2xl font-bold active:bg-slate-700 active:scale-95 transition-all shadow-lg"
                        >
                            {num}
                        </button>
                    ))}

                    {/* Bottom Row */}
                    <button
                        onClick={() => handleKeyPress('BACKSPACE')}
                        className="h-16 rounded-2xl bg-slate-800 text-red-400 flex items-center justify-center active:bg-slate-700 active:scale-95 transition-all"
                    >
                        <Delete size={28} />
                    </button>

                    <button
                        onClick={() => handleKeyPress('0')}
                        className="h-16 rounded-2xl bg-slate-800 text-white text-2xl font-bold active:bg-slate-700 active:scale-95 transition-all"
                    >
                        0
                    </button>

                    <button
                        onClick={() => handleKeyPress('ENTER')}
                        className="h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center active:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-900/40"
                    >
                        <CornerDownLeft size={28} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileManualLookup;