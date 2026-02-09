import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { ArrowLeft, Save, Package, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const ProcessOrder = () => {
    const { poId } = useParams();
    const navigate = useNavigate();
    const [po, setPo] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPODetails();
    }, [poId]);

    const fetchPODetails = async () => {
        try {
            const res = await api.get(`/api/core/purchase-orders/${poId}`);
            setPo(res.data);
            const initialItems = res.data.items.map(item => ({
                poItemId: item.poItemId,
                productName: item.productName,
                orderedQty: item.orderedQty,
                receivedQty: item.orderedQty
            }));
            setItems(initialItems);
        } catch (err) {
            console.error("Failed to load PO", err);
        } finally {
            setLoading(false);
        }
    };

    const handleQtyChange = (itemId, val) => {
        setItems(items.map(item =>
            item.poItemId === itemId ? { ...item, receivedQty: parseInt(val) || 0 } : item
        ));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                items: items.map(item => ({
                    poItemId: item.poItemId,
                    receivedQty: item.receivedQty
                }))
            };

            await api.post(`/api/core/purchase-orders/${poId}/receive`, payload);
            alert("Inventory received and updated successfully!");
            navigate('/receiving');
        } catch (err) {
            alert("Error processing shipment: " + (err.response?.data?.message || "Check permissions"));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} className="mr-2" /> Back to Receiving
                </Button>
                <div className="text-right">
                    <h1 className="text-xl font-bold">Process PO #{poId}</h1>
                    <p className="text-sm text-slate-500">Supplier: {po?.supplierName}</p>
                </div>
            </div>

            <Card className="border-amber-200 bg-amber-50/30">
                <CardContent className="py-4 flex items-center gap-3 text-amber-800 text-sm">
                    <AlertCircle size={18} />
                    <span>Please verify the physical count of each item before submitting. Shortages will be flagged.</span>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-sm uppercase tracking-wider text-slate-500">Item Verification List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b text-xs font-semibold text-slate-600">
                        <tr>
                            <th className="px-6 py-3">Product Description</th>
                            <th className="px-6 py-3">Ordered</th>
                            <th className="px-6 py-3 w-40">Received Count</th>
                            <th className="px-6 py-3 text-right">Status</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {items.map((item) => (
                            <tr key={item.poItemId} className="hover:bg-slate-50/30">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Package size={16} className="text-slate-400" />
                                        <span className="font-medium">{item.productName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">{item.orderedQty}</td>
                                <td className="px-6 py-4">
                                    <Input
                                        type="number"
                                        className="h-9"
                                        value={item.receivedQty}
                                        onChange={(e) => handleQtyChange(item.poItemId, e.target.value)}
                                    />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {item.receivedQty === item.orderedQty ? (
                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Match</Badge>
                                    ) : item.receivedQty < item.orderedQty ? (
                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Shortage</Badge>
                                    ) : (
                                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">Over</Badge>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" onClick={() => navigate(-1)}>Discard Changes</Button>
                <Button
                    className="bg-emerald-600 hover:bg-emerald-700 px-8"
                    disabled={submitting}
                    onClick={handleSubmit}
                >
                    {submitting ? "Processing..." : "Complete Receiving"}
                </Button>
            </div>
        </div>
    );
};

export default ProcessOrder;