import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { ArrowLeft, Save, Package, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ProcessOrder = () => {
    const { poId } = useParams();
    const navigate = useNavigate();
    const [po, setPo] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const handleCancel = () => {
        const hasChanges = items.some(i => i.confirmed);

        if (hasChanges) {
            if (window.confirm("You have unverified changes. Are you sure you want to leave?")) {
                navigate('/receiving');
            }
        } else {
            navigate('/receiving');
        }
    };

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const poRes = await api.get(`/api/core/purchase-orders/${poId}`);
            setPo(poRes.data);

            const statusRes = await api.get(`/api/core/purchase-orders/${poId}/receiving-status`);

            const rawItems = statusRes.data.items || [];

            const initialItems = rawItems.map(item => ({
                ...item,
                receiveQty: item.remainingQty || 0,
                confirmed: false
            }));
            setItems(initialItems);
        } catch (err) {
            console.error("Failed to load PO data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (poId) {
            fetchAllData();
        }
    }, [poId]);

    const isReadOnly = po?.status === 'COMPLETED';

    const handleQtyChange = (itemId, val) => {
        const numVal = Math.max(0, parseInt(val) || 0);
        setItems(prev => prev.map(item =>
            item.poItemId === itemId ? { ...item, receiveQty: numVal } : item
        ));
    };

    const toggleConfirm = (itemId) => {
        setItems(prev => prev.map(item =>
            item.poItemId === itemId ? { ...item, confirmed: !item.confirmed } : item
        ));
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
                    receiveQty: Number(item.receiveQty)
                }))
            };

            await api.post(`/api/core/purchase-orders/${poId}/receive`, payload);
            toast.success('Inventory Updated Successfully!');
            navigate('/receiving');
        } catch (err) {
            toast.error('Failed to update inventory');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !po) {
        return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /> Loading...</div>;
    }

    if (!po) {
        return (
            <div className="p-10 text-center border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-bold text-slate-700">Order Not Found</h2>
                <p className="text-slate-500 mb-4">This PO may have already been completed or doesn't exist.</p>
                <Button onClick={() => navigate('/receiving')}>Back to Receiving</Button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={handleCancel} className="text-slate-600">
                    <ArrowLeft size={18} className="mr-2" /> Back to Receiving
                </Button>
                <div className="text-right">
                    <h1 className="text-xl font-bold text-slate-900">Process Receipt: PO #{poId}</h1>
                    <p className="text-sm text-slate-500">Destination: <span className="font-semibold text-slate-700">{po?.warehouseName || 'Main Warehouse'}</span></p>
                </div>
            </div>

            <Card className="border-emerald-200 bg-emerald-50/50 shadow-none">
                <CardContent className="py-4 flex items-center gap-3 text-emerald-800 text-sm">
                    <AlertCircle size={18} className="shrink-0" />
                    <p><strong>Staff Protocol:</strong> Verify counts, enter values in <b>Delivered</b>, then <b>Verify</b> each row to finish.</p>
                </CardContent>
            </Card>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4 w-16 text-center">Verify</th>
                        <th className="px-6 py-4">Product Details</th>
                        <th className="px-6 py-4 text-center">Ordered</th>
                        <th className="px-6 py-4 w-32 text-center">Delivered</th>
                        <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {items.length > 0 ? items.map((item) => (
                        <tr key={item.poItemId} className={`transition-colors ${item.confirmed ? "bg-emerald-50/40" : "hover:bg-slate-50/50"}`}>
                            <td className="px-6 py-4 text-center">
                                <input
                                    type="checkbox"
                                    disabled={isReadOnly}
                                    className="h-5 w-5 rounded border-slate-300 text-emerald-600 cursor-pointer disabled:opacity-50"
                                    checked={item.confirmed}
                                    onChange={() => toggleConfirm(item.poItemId)}
                                />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <Package size={16} className="text-slate-400" />
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">{item.productName}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center text-sm font-medium">{item.orderedQty}</td>
                            <td className="px-6 py-4">
                                <Input
                                    type="number"
                                    className="h-9 text-center font-bold"
                                    disabled={item.confirmed || isReadOnly}
                                    value={item.receiveQty}
                                    onChange={(e) => handleQtyChange(item.poItemId, e.target.value)}
                                />
                            </td>
                            <td className="px-6 py-4 text-right">
                                {item.confirmed ? (
                                    <Badge className="bg-emerald-500 text-white">Verified</Badge>
                                ) : isReadOnly ? (
                                    <Badge variant="secondary" className="text-slate-500 italic">Locked</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-slate-400">Pending</Badge>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5" className="px-6 py-10 text-center text-slate-400">No items found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-11 shadow-md"
                    disabled={submitting || items.length === 0 || !items.every(i => i.confirmed) || isReadOnly}
                    onClick={handleSubmit}
                >
                    {submitting ? (
                        <>
                            <Loader2 className="animate-spin mr-2" />
                            Processing...
                        </>
                    ) : isReadOnly ? (
                        <>
                            <CheckCircle2 className="mr-2" size={18} />
                            Already Processed
                        </>
                    ) : (
                        <>
                            <Save className="mr-2" size={18} />
                            Complete Receiving
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default ProcessOrder;