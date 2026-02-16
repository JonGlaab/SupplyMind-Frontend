import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import MobileQuantityKeypad from '../components/MobileQuantityKeypad.jsx';
import {
    ArrowLeft, Box, MapPin, Loader2, Edit3,
    AlertCircle, Warehouse
} from 'lucide-react';
import toast from 'react-hot-toast';

const MobileProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();

    // 1. GET CONTEXT
    const currentWarehouse = JSON.parse(localStorage.getItem('currentWarehouse'));

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showKeypad, setShowKeypad] = useState(false);

    useEffect(() => {
        // Safety: Redirect if no context
        if (!currentWarehouse) {
            navigate('/mobile/home');
            return;
        }

        if (productId) {
            fetchData();
        }
    }, [productId, navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Optimization: Only fetch product, we already know our warehouse
            const prodRes = await api.get(`/api/core/products/${productId}`);
            setProduct(prodRes.data);
        } catch (err) {
            console.error("Failed to load product", err);
            toast.error("Product not found");
            navigate('/mobile/home');
        } finally {
            setLoading(false);
        }
    };

    const handleStockAdjustment = async (newQty) => {
        if (!currentWarehouse) return;

        try {
            setShowKeypad(false);

            await api.post(`/api/core/inventory/adjust`, {
                productId: product.id,
                warehouseId: currentWarehouse.warehouseId, // Use Context
                newQuantity: newQty,
                reason: "Mobile Cycle Count"
            });

            toast.success("Stock Updated!");
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Update failed");
        }
    };

    // 2. FILTER STOCK BY CONTEXT
    const getCurrentWarehouseStock = () => {
        if (!product || !product.inventory) return 0;

        const entry = product.inventory.find(i =>
            Number(i.warehouseId) === Number(currentWarehouse.warehouseId)
        );
        return entry ? entry.quantity : 0;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-white">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
            <p className="text-sm font-bold text-slate-500">Loading Product...</p>
        </div>
    );

    if (!product) return null;

    return (
        <div className="flex flex-col h-full bg-slate-950 text-white relative z-0">
            {/* Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 mb-4">
                    <ArrowLeft size={18} /> <span>Back</span>
                </button>
                <h1 className="text-2xl font-black uppercase tracking-tight leading-tight">
                    {product.name}
                </h1>
                <p className="text-blue-400 font-mono text-sm mt-1">{product.sku}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">

                {/* 1. STATIC CONTEXT CARD (Replaces Dropdown) */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                            Working Location
                        </label>
                        <div className="flex items-center gap-2 text-white font-bold text-lg">
                            <MapPin size={18} className="text-blue-500" />
                            {currentWarehouse.locationName}
                        </div>
                    </div>
                </div>

                {/* 2. STOCK CARD */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[2rem] border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Current Stock
                        </span>
                        <Box className="text-blue-500" size={20} />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-white">
                            {getCurrentWarehouseStock()}
                        </span>
                        <span className="text-slate-500 font-bold uppercase text-xs">
                            Units
                        </span>
                    </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800">
                        <Warehouse className="text-amber-500 mb-3" size={20} />
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Bin Loc</span>
                        <span className="text-lg font-bold text-slate-200">{product.binLocation || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800">
                        <AlertCircle className="text-emerald-500 mb-3" size={20} />
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Category</span>
                        <span className="text-lg font-bold text-slate-200">{product.category || 'General'}</span>
                    </div>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 sticky bottom-0 z-10">
                <button
                    onClick={() => setShowKeypad(true)}
                    className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg bg-blue-600 text-white active:bg-blue-500 shadow-blue-900/20"
                >
                    <Edit3 size={18} />
                    Adjust Count
                </button>
            </div>

            {/* KEYPAD OVERLAY */}
            {showKeypad && (
                <MobileQuantityKeypad
                    productName={product.name}
                    sku={product.sku}
                    warehouseName={currentWarehouse.locationName}
                    maxExpected={getCurrentWarehouseStock()}
                    initialValue={0}
                    onConfirm={handleStockAdjustment}
                    onCancel={() => setShowKeypad(false)}
                />
            )}
        </div>
    );
};

export default MobileProductDetail;