import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import MobileQuantityKeypad from '../components/MobileQuantityKeypad.jsx'; // Ensure path is correct!
import {
    ArrowLeft, Box, MapPin, Loader2, Edit3,
    AlertCircle, Warehouse, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

const MobileProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
    const [showKeypad, setShowKeypad] = useState(false);

    useEffect(() => {
        if (productId) {
            fetchData();
        }
    }, [productId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Parallel fetch: Product + Warehouses
            const [prodRes, whRes] = await Promise.all([
                api.get(`/api/core/products/${productId}`),
                api.get('/api/core/warehouses')
            ]);

            setProduct(prodRes.data);
            setWarehouses(whRes.data || []);

            // Auto-select first warehouse if available
            if (whRes.data && whRes.data.length > 0) {
                setSelectedWarehouseId(whRes.data[0].warehouseId);
            }
        } catch (err) {
            console.error("Failed to load product", err);
            toast.error("Product not found");
            navigate('/mobile/home');
        } finally {
            setLoading(false);
        }
    };

    const handleStockAdjustment = async (newQty) => {
        if (!selectedWarehouseId) {
            toast.error("Select a warehouse first");
            return;
        }

        try {
            setShowKeypad(false);

            await api.post(`/api/core/inventory/adjust`, {
                productId: product.id,
                warehouseId: selectedWarehouseId,
                newQuantity: newQty,
                reason: "Mobile Cycle Count"
            });

            toast.success("Stock Updated!");
            fetchData(); // Refresh to confirm
        } catch (err) {
            console.error(err);
            toast.error("Update failed");
        }
    };

    // ✅ SAFE CHECK: Prevents crash if inventory is null
    const getCurrentWarehouseStock = () => {
        if (!product || !product.inventory) return 0;

        // Find entry for selected warehouse
        const entry = product.inventory.find(i =>
            // Handle both Number and String mismatch just in case
            Number(i.warehouseId) === Number(selectedWarehouseId)
        );
        return entry ? entry.quantity : 0;
    };

    const getSelectedWarehouseName = () => {
        if (!warehouses.length) return 'No Warehouse';
        const wh = warehouses.find(w => w.warehouseId === Number(selectedWarehouseId));
        return wh ? wh.name : 'Unknown';
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
                <button onClick={() => navigate('/mobile/home')} className="flex items-center gap-2 text-slate-400 mb-4">
                    <ArrowLeft size={18} /> <span>Back</span>
                </button>
                <h1 className="text-2xl font-black uppercase tracking-tight leading-tight">
                    {product.name}
                </h1>
                <p className="text-blue-400 font-mono text-sm mt-1">{product.sku}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">

                {/* 1. WAREHOUSE SELECTOR */}
                {warehouses.length > 0 ? (
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                            Working Location
                        </label>
                        <div className="relative">
                            <Warehouse className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <select
                                value={selectedWarehouseId}
                                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-12 pr-10 text-white appearance-none focus:border-blue-500 outline-none font-bold"
                            >
                                {warehouses.map(wh => (
                                    <option key={wh.warehouseId} value={wh.warehouseId}>
                                        {wh.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-2">
                        <AlertTriangle size={16} /> No Warehouses configured.
                    </div>
                )}

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
                            Units in {getSelectedWarehouseName().split(' ')[0]}
                        </span>
                    </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800">
                        <MapPin className="text-amber-500 mb-3" size={20} />
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
                    disabled={!selectedWarehouseId}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg ${
                        selectedWarehouseId
                            ? 'bg-blue-600 text-white active:bg-blue-500 shadow-blue-900/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
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
                    warehouseName={getSelectedWarehouseName()}
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