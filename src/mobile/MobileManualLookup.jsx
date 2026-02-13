import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    ArrowLeft,
    Search,
    FileText,
    Package,
    ChevronRight,
    Loader2,
    Keyboard
} from 'lucide-react';
import toast from 'react-hot-toast';

const MobileManualLookup = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState(null);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setResult(null);

        try {
            const res = await api.get(`/api/mobile/scan/analyze?code=${query.trim()}`);
            setResult(res.data);

            if (res.data.scanType === 'UNKNOWN') {
                toast.error("Nothing found for that code");
            }
        } catch (err) {
            toast.error("Search failed. Check your connection.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 text-white">
            {/* Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800">
                <button onClick={() => navigate('/mobile/home')} className="flex items-center gap-2 text-slate-400 mb-4">
                    <ArrowLeft size={18} /> <span>Dashboard</span>
                </button>
                <h1 className="text-xl font-bold">Manual Lookup</h1>
                <p className="text-slate-500 text-xs">Enter a PO Number or Product SKU</p>
            </div>

            <div className="p-6 space-y-6">
                {/* Search Input */}
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. PO-102 or SKU-99"
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        autoFocus
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 p-2 rounded-xl active:scale-95 transition-transform"
                    >
                        {isSearching ? <Loader2 className="animate-spin" size={18} /> : <ChevronRight size={18} />}
                    </button>
                </form>

                {/* Results Area */}
                <div className="space-y-4">
                    {result && result.scanType !== 'UNKNOWN' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Matching Result</p>

                            {/* PO RESULT CARD */}
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

                            {/* PRODUCT RESULT CARD */}
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
                    )}

                    {/* Empty State */}
                    {!result && !isSearching && (
                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                            <Keyboard size={48} className="mb-4" />
                            <p className="text-sm">Search results will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileManualLookup;