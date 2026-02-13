import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    ArrowLeft,
    Camera,
    AlertTriangle,
    Loader2,
    Send,
    CheckCircle2,
    Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const MobileReturnRequest = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Get Data passed from the Manifest (PO ID, Item, and Photo URL)
    const { poId, item, evidenceUrl } = location.state || {};

    const [reason, setReason] = useState('');
    const [conditionNotes, setConditionNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Safety check: Kick user out if they didn't come from a PO
    useEffect(() => {
        if (!poId || !item) {
            toast.error("Invalid Return Session");
            navigate('/mobile/home');
        }
    }, [poId, item, navigate]);

    const getStaffName = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                // Try username first, then First+Last, then email, then fallback
                return user.username ||
                    (user.firstName ? `${user.firstName} ${user.lastName}` : null) ||
                    user.email ||
                    "Unknown Staff";
            }
        } catch (e) {
            console.error("Could not parse user", e);
        }
        return "Mobile Staff";
    };

    const handleSubmit = async () => {
        if (!reason.trim()) {
            toast.error("Please select a reason.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                poId: Number(poId),
                reason: reason,
                requestedBy: getStaffName(),
                items: [
                    {
                        poItemId: item.poItemId,
                        qtyReturnRequested: item.receiveQty,
                        conditionNotes: conditionNotes,
                        evidenceUrl: evidenceUrl || null
                    }
                ]
            };

            await api.post('/api/core/returns', payload);

            toast.success("Return Requested Successfully");
            navigate('/mobile/home', { replace: true });

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Failed to submit return";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!item) return null;

    return (
        <div className="flex flex-col h-full bg-slate-950 text-white">
            {/* Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 mb-4">
                    <ArrowLeft size={18} /> <span>Cancel</span>
                </button>
                <h1 className="text-2xl font-bold text-red-500 flex items-center gap-2">
                    <AlertTriangle className="fill-red-500 text-slate-900" />
                    Request Return
                </h1>
                <p className="text-slate-500 text-sm mt-1">PO #{poId} • {item.productName}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* EVIDENCE CARD */}
                <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800">
                    <div className="flex items-start gap-4">
                        {evidenceUrl ? (
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-700">
                                <img src={evidenceUrl} alt="Evidence" className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 rounded-tl-lg">
                                    <CheckCircle2 size={12} className="text-white" />
                                </div>
                            </div>
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 border-dashed">
                                <Camera className="text-slate-600" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 className="font-bold text-white text-lg">{item.receiveQty} Units</h3>
                            <p className="text-sm text-slate-400">Marked for Return</p>
                            {evidenceUrl ? (
                                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-bold">
                                    <ImageIcon size={12} /> Photo Attached
                                </p>
                            ) : (
                                <p className="text-xs text-amber-500 mt-2 font-bold">No photo evidence</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* REASON SELECTOR */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Reason for Return</label>
                    <div className="grid grid-cols-1 gap-3">
                        {['Damaged in Shipping', 'Wrong Item Sent', 'Defective Product', 'Expired'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setReason(r)}
                                className={`p-4 rounded-2xl border text-left font-bold transition-all ${
                                    reason === r
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 active:bg-slate-800'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* NOTES INPUT */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Additional Notes</label>
                    <textarea
                        value={conditionNotes}
                        onChange={(e) => setConditionNotes(e.target.value)}
                        placeholder="Describe the damage..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 h-32 resize-none"
                    />
                </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
                <button
                    disabled={submitting || !reason}
                    onClick={handleSubmit}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                        submitting || !reason
                            ? 'bg-slate-800 text-slate-500'
                            : 'bg-red-600 text-white active:bg-red-500 shadow-lg shadow-red-900/20'
                    }`}
                >
                    {submitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                    <span>Submit Return Request</span>
                </button>
            </div>
        </div>
    );
};

export default MobileReturnRequest;