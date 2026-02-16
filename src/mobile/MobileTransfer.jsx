import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, ArrowRight, Package, MapPin, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import QRScanner from '../components/QRScanner';
import MobileQuantityKeypad from '../components/MobileQuantityKeypad';

const MobileTransfer = () => {
    const navigate = useNavigate();

    // CONTEXT
    const currentWarehouse = JSON.parse(localStorage.getItem('currentWarehouse'));

    // DATA
    const [warehouses, setWarehouses] = useState([]);
    const [destWh, setDestWh] = useState('');
    const [product, setProduct] = useState(null);

    // UI
    const [showScanner, setShowScanner] = useState(false);
    const [showKeypad, setShowKeypad] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentWarehouse) {
            navigate('/mobile/home');
            return;
        }

        const loadWarehouses = async () => {
            try {
                const res = await api.get('/api/core/warehouses');
                const data = res.data.content || res.data || [];
                // Filter out current warehouse from the destination list
                setWarehouses(data.filter(w => w.warehouseId !== currentWarehouse.warehouseId));
                if (data.length > 1) setDestWh(data.find(w => w.warehouseId !== currentWarehouse.warehouseId)?.warehouseId);
            } catch (err) {
                toast.error("Failed to load warehouses");
            }
        };
        loadWarehouses();
    }, [navigate]);

    const handleScan = async (code) => {
        setShowScanner(false);
        setLoading(true);
        try {
            const res = await api.get(`/api/mobile/scan/analyze?code=${code}`);
            if (res.data.scanType === 'PRODUCT' || res.data.scanType === 'AMBIGUOUS') {
                const prodRes = await api.get(`/api/core/products/${res.data.productId}`);
                setProduct(prodRes.data);
                setShowKeypad(true); // Jump straight to Qty
            } else {
                toast.error("Not a product");
            }
        } catch (err) {
            toast.error("Scan failed");
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async (qty) => {
        if (!destWh || !product) return;

        // Get stock specifically for the CURRENT warehouse
        const sourceStock = product.inventory?.find(i => Number(i.warehouseId) === Number(currentWarehouse.warehouseId))?.quantity || 0;

        if (qty > sourceStock) {
            toast.error(`Only ${sourceStock} units available here.`);
            return;
        }

        setLoading(true);
        setShowKeypad(false);

        try {
            await api.post('/api/core/inventory/transfer', {
                fromWarehouseId: Number(currentWarehouse.warehouseId), // Auto-filled
                toWarehouseId: Number(destWh),
                productId: product.id,
                quantity: qty,
                notes: `Mobile Transfer from ${currentWarehouse.locationName}`
            });
            toast.success("Transfer Sent!");
            navigate('/mobile/home');
        } catch (err) {
            toast.error("Transfer failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 text-white p-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/mobile/home')} className="p-2 bg-slate-900 rounded-full">
                    <ArrowLeft size={20} className="text-slate-400" />
                </button>
                <h1 className="text-xl font-bold">Transfer Stock</h1>
            </div>

            {/* Locked Source Card */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 opacity-60 mb-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2 mb-1">
                    <MapPin size={12} /> From (Current Location)
                </label>
                <p className="text-lg font-bold text-slate-300">{currentWarehouse?.locationName}</p>
            </div>

            <div className="flex justify-center -my-4 relative z-10">
                <div className="bg-slate-800 p-2 rounded-full border border-slate-700">
                    <ArrowRight size={16} className="text-blue-500 rotate-90" />
                </div>
            </div>

            {/* Destination Select */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 mt-2 mb-8">
                <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2 mb-2">
                    <MapPin size={12} /> To (Destination)
                </label>
                <select
                    value={destWh}
                    onChange={(e) => setDestWh(e.target.value)}
                    className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700 font-bold"
                >
                    {warehouses.map(w => <option key={w.warehouseId} value={w.warehouseId}>{w.locationName}</option>)}
                </select>
            </div>

            {/* Product Section */}
            {product ? (
                <div className="bg-blue-600/10 border border-blue-500/50 p-4 rounded-2xl flex items-center gap-4">
                    <Package size={32} className="text-blue-400" />
                    <div>
                        <p className="font-bold text-lg">{product.name}</p>
                        <p className="text-xs text-blue-300 font-mono">{product.sku}</p>
                    </div>
                    <button onClick={() => setProduct(null)} className="ml-auto text-xs font-bold text-slate-400">CHANGE</button>
                </div>
            ) : (
                <button
                    onClick={() => setShowScanner(true)}
                    className="w-full py-6 bg-blue-600 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                >
                    <Search size={24} />
                    Scan Product to Move
                </button>
            )}

            {product && (
                <button
                    onClick={() => setShowKeypad(true)}
                    className="w-full py-4 bg-emerald-600 rounded-2xl font-bold text-lg mt-4 shadow-lg shadow-emerald-900/20"
                >
                    Enter Quantity
                </button>
            )}

            {showScanner && (
                <QRScanner onScan={handleScan} title="Scan Product" instruction="Scan SKU to transfer" onCancel={() => setShowScanner(false)} />
            )}

            {showKeypad && product && (
                <MobileQuantityKeypad
                    productName={product.name}
                    sku={product.sku}
                    maxExpected={product.inventory?.find(i => Number(i.warehouseId) === Number(currentWarehouse.warehouseId))?.quantity || 0}
                    initialValue={0}
                    onConfirm={handleTransfer}
                    onCancel={() => setShowKeypad(false)}
                />
            )}

            {loading && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Loader2 className="animate-spin text-blue-500" size={48} />
                </div>
            )}
        </div>
    );
};

export default MobileTransfer;