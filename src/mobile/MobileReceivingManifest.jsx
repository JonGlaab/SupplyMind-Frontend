import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import MobileQuantityKeypad from '../components/MobileQuantityKeypad';
import PhotoCapture from '../components/PhotoCapture'; // <--- NEW IMPORT
import {
    ArrowLeft,
    Camera,
    CheckCircle2,
    Loader2,
    Save,
    AlertCircle,
    Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const MobileReceivingManifest = () => {
    const { poId } = useParams();
    const navigate = useNavigate();

    // State
    const [po, setPo] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Overlays
    const [activeItem, setActiveItem] = useState(null); // For Keypad
    const [photoItem, setPhotoItem] = useState(null);   // For Camera

    useEffect(() => {
        if (poId) fetchPoDetails();
    }, [poId]);

    const fetchPoDetails = async () => {
        try {
            setLoading(true);
            const poRes = await api.get(`/api/core/purchase-orders/${poId}`);
            setPo(poRes.data);

            const statusRes = await api.get(`/api/core/purchase-orders/${poId}/receiving-status`);
            const rawItems = statusRes.data.items || [];

            const initialItems = rawItems.map(item => ({
                ...item,
                receiveQty: item.orderedQty || 0,
                confirmed: false,
                evidenceUrl: null
            }));
            setItems(initialItems);
        } catch (err) {
            toast.error("Failed to load PO details");
            navigate('/mobile/home');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = (poItemId, newQty) => {
        setItems(prev => prev.map(item =>
            item.poItemId === poItemId
                ? { ...item, receiveQty: newQty, confirmed: true }
                : item
        ));
        setActiveItem(null);
    };

    const handlePhotoUploaded = (url) => {
        setItems(prev => prev.map(item =>
            item.poItemId === photoItem.poItemId
                ? { ...item, evidenceUrl: url }
                : item
        ));

        // 2. Close Camera
        setPhotoItem(null);

        // 3. Optional: Auto-verify the item if it was pending?
        // For now, we just attach the evidence.
    };

    const handleSubmit = async () => {
        if (!items.every(i => i.confirmed)) {
            toast.error("Please verify all items first.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                lines: items.map(item => ({
                    poItemId: Number(item.poItemId),
                    receiveQty: Number(item.receiveQty),
                    // Pass the evidence URL if your backend supports it now,
                    // or it's already saved in storage tied to the ID.
                    notes: item.evidenceUrl ? `Evidence: ${item.evidenceUrl}` : null
                }))
            };
            await api.post(`/api/core/purchase-orders/${poId}/receive`, payload);
            toast.success("Inventory Updated Successfully!");
            navigate('/mobile/home');
        } catch (err) {
            toast.error("Failed to process receiving");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-950">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <p className="text-slate-400 mt-4">Loading Manifest...</p>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-slate-950 text-white">
            {/* Header */}
            <header className="p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
                <button onClick={() => navigate('/mobile/home')} className="flex items-center gap-2 text-slate-400 mb-2">
                    <ArrowLeft size={18} /> <span>Back</span>
                </button>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-xl font-bold">PO #{poId}</h1>
                        <p className="text-xs text-slate-500">{po?.warehouseName || 'Main Warehouse'}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Verified</span>
                        <p className="text-lg font-black text-blue-400 leading-none">
                            {items.filter(i => i.confirmed).length} / {items.length}
                        </p>
                    </div>
                </div>
            </header>

            {/* Banner */}
            <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-3">
                <AlertCircle size={16} className="text-emerald-500 shrink-0" />
                <p className="text-[10px] text-emerald-200 leading-tight">
                    <b>Protocol:</b> Tap a card to verify count. Use camera for damages.
                </p>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                {items.map((item) => (
                    <div
                        key={item.poItemId}
                        onClick={() => setActiveItem(item)}
                        className={`p-4 rounded-3xl border transition-all active:scale-[0.98] ${
                            item.confirmed
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : 'bg-slate-900 border-slate-800'
                        }`}
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-100 leading-tight mb-1">{item.productName}</h3>
                                <p className="text-[10px] font-mono text-slate-500 uppercase">SKU: {item.sku}</p>
                            </div>
                            {item.confirmed ? (
                                <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                            ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-slate-800 shrink-0" />
                            )}
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                            <div className="flex items-center gap-6">
                                <div>
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Ordered</span>
                                    <span className="text-lg font-bold">{item.orderedQty}</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Verified</span>
                                    <span className={`text-lg font-black ${item.confirmed ? 'text-emerald-400' : 'text-blue-400'}`}>
                                        {item.receiveQty}
                                    </span>
                                </div>
                            </div>

                            {/* CAMERA TRIGGER BUTTON */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.evidenceUrl) {
                                        //  Photo exists -> Go to Return Request
                                        navigate('/mobile/return-request', {
                                            state: {
                                                poId,
                                                item,
                                                evidenceUrl: item.evidenceUrl
                                            }
                                        });
                                    } else {
                                        //  No photo -> Open Camera Overlay
                                        setPhotoItem(item);
                                    }
                                }}
                                className={`p-3 rounded-2xl active:bg-slate-700 transition-colors ${
                                    item.evidenceUrl
                                        ? 'bg-amber-500/20 text-amber-500' 
                                        : 'bg-slate-800 text-slate-400'
                                }`}
                            >
                                {item.evidenceUrl ? <ImageIcon size={20} /> : <Camera size={20} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 w-full p-4 bg-slate-900 border-t border-slate-800">
                <button
                    disabled={submitting || !items.every(i => i.confirmed)}
                    onClick={handleSubmit}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                        items.every(i => i.confirmed)
                            ? 'bg-emerald-600 text-white active:bg-emerald-500 shadow-lg shadow-emerald-900/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    <span>{submitting ? 'Processing...' : 'Complete Receiving'}</span>
                </button>
            </div>

            {/* OVERLAY 1: Keypad */}
            {activeItem && (
                <MobileQuantityKeypad
                    productName={activeItem.productName}
                    sku={activeItem.sku}
                    maxExpected={activeItem.orderedQty}
                    initialValue={activeItem.receiveQty}
                    onConfirm={(qty) => handleUpdateQuantity(activeItem.poItemId, qty)}
                    onCancel={() => setActiveItem(null)}
                />
            )}

            {/* OVERLAY 2: Camera  */}
            {photoItem && (
                <PhotoCapture
                    poId={poId}
                    itemId={photoItem.poItemId}
                    onCapture={handlePhotoUploaded}
                    onCancel={() => setPhotoItem(null)}
                />
            )}
        </div>
    );
};

export default MobileReceivingManifest;