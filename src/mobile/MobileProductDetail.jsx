import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    ArrowLeft,
    Box,
    MapPin,
    History,
    Loader2,
    Edit3,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const MobileProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProductDetails();
    }, [productId]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/core/products/${productId}`);
            setProduct(res.data);
        } catch (err) {
            toast.error("Product not found");
            navigate('/mobile/home');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-950">
            <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-slate-950 text-white">
            {/* Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800">
                <button onClick={() => navigate('/mobile/home')} className="flex items-center gap-2 text-slate-400 mb-4">
                    <ArrowLeft size={18} /> <span>Dashboard</span>
                </button>
                <h1 className="text-2xl font-black uppercase tracking-tight leading-tight">
                    {product?.name}
                </h1>
                <p className="text-blue-400 font-mono text-sm mt-1">{product?.sku}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 1. STOCK LEVEL CARD */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[2rem] border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Stock</span>
                        <Box className="text-blue-500" size={20} />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-white">{product?.totalStock || 0}</span>
                        <span className="text-slate-500 font-bold uppercase text-xs">Units Available</span>
                    </div>
                </div>

                {/* 2. QUICK INFO GRID */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800">
                        <MapPin className="text-amber-500 mb-3" size={20} />
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Primary Bin</span>
                        <span className="text-lg font-bold text-slate-200">{product?.binLocation || 'Unassigned'}</span>
                    </div>
                    <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800">
                        <AlertCircle className="text-emerald-500 mb-3" size={20} />
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Category</span>
                        <span className="text-lg font-bold text-slate-200">{product?.category}</span>
                    </div>
                </div>

                {/* 3. LOGS / DESCRIPTION */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Description</h3>
                    <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800 text-slate-400 text-sm leading-relaxed">
                        {product?.description || "No description provided for this item."}
                    </div>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="p-6 bg-slate-900 border-t border-slate-800 grid grid-cols-2 gap-4">
                <button
                    onClick={() => toast("History coming soon")}
                    className="flex items-center justify-center gap-2 p-4 bg-slate-800 rounded-2xl font-bold text-slate-300 active:bg-slate-700 transition-colors"
                >
                    <History size={18} />
                    History
                </button>
                <button
                    onClick={() => toast("Adjustments coming soon")}
                    className="flex items-center justify-center gap-2 p-4 bg-blue-600 rounded-2xl font-bold text-white active:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Edit3 size={18} />
                    Adjust
                </button>
            </div>
        </div>
    );
};

export default MobileProductDetail;