import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import {
    ArrowLeft, Save, Plus, Trash2,
    ClipboardList, PackageOpen, AlertCircle, Loader2
} from 'lucide-react';

const ReturnRequest = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [poVerified, setPoVerified] = useState(false);
    const [poError, setPoError] = useState('');
    const [availableItems, setAvailableItems] = useState([]);

    const [formData, setFormData] = useState({
        poId: '',
        reason: '',
        items: [{ poItemId: '', qtyReturnRequested: 0, conditionNotes: '' }]
    });

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { poItemId: '', qtyReturnRequested: 0, conditionNotes: '' }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const verifyPO = async () => {
        if (!formData.poId) return;
        setLoading(true);
        setPoError('');
        try {
            const res = await api.get(`/api/core/purchase-orders/${formData.poId}`);
            const po = res.data;

            const dupRes = await api.get(`/api/core/returns/by-po/${formData.poId}`);
            const activeReturns = dupRes.data.filter(r =>
                !['REJECTED', 'CANCELLED'].includes(r.status)
            );

            if (activeReturns.length > 0) {
                setPoError(`A return request (ID: ${activeReturns[0].id}) is already in progress for this PO. 
                Multiple active returns are not permitted at this time.`);
                setPoVerified(false);
            } else if (po.status !== 'COMPLETED' && po.status !== 'DELIVERED' && po.status !== 'RECEIVED') {
                setPoError(`PO status is ${po.status}. Only completed orders can be returned.`);
                setPoVerified(false);
            } else {
                setPoVerified(true);
                setAvailableItems(po.items || []);
                setPoError('');
            }
        } catch (err) {
            setPoError("Purchase Order not found.");
            setPoVerified(false);
        } finally {
            setLoading(false);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        const processedValue = (field === 'poItemId' || field === 'qtyReturnRequested')
            ? (value === '' ? '' : Number(value))
            : value;

        newItems[index][field] = processedValue;
        setFormData({ ...formData, items: newItems });
    };

    const getFieldError = (item) => {
        if (!item.poItemId) return null;

        const poMatch = availableItems.find(i => (i.poItemId || i.id) === Number(item.poItemId));

        const max = poMatch?.receivedQty || poMatch?.receivedQtyOnPo || poMatch?.quantity || 0;
        const current = Number(item.qtyReturnRequested) || 0;

        if (current > max) return `Max returnable: ${max}`;
        if (current <= 0 && item.poItemId) return "Must be > 0";
        return null;
    };

    const canSubmit =
        poVerified &&
        formData.reason.trim().length > 0 &&
        formData.items.length > 0 &&
        formData.items.every(item => {
            const err = getFieldError(item);
            const hasId = !!item.poItemId;
            const hasQty = Number(item.qtyReturnRequested) > 0;
            return hasId && hasQty && !err;
        });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) {
            console.error("Form is invalid, blocking submission");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                poId: Number(formData.poId),
                reason: formData.reason,
                requestedBy: JSON.parse(localStorage.getItem('user'))?.username || "Staff",
                items: formData.items.map(item => ({
                    poItemId: Number(item.poItemId),
                    qtyReturnRequested: Number(item.qtyReturnRequested),
                    conditionNotes: item.conditionNotes
                }))
            };
            await api.post('/api/core/returns', payload);
            navigate('/staff/dashboard');
        } catch (err) {
            const serverData = err.response?.data;
            console.error("Raw Error from Server:", serverData);

            const errorMessage = typeof serverData === 'object'
                ? (serverData.message || serverData.error || "Internal Server Error")
                : "Submission failed.";

            setPoError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate(-1)} type="button">
                    <ArrowLeft size={18} className="mr-2" /> Back
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Initiate Return Request</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <ClipboardList size={18} className="text-blue-600" /> General Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">PO Number</label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={formData.poId}
                                    onChange={e => {
                                        setFormData({...formData, poId: e.target.value});
                                        setPoVerified(false);
                                    }}
                                />
                                <Button type="button" onClick={verifyPO} variant="outline">Verify</Button>
                            </div>
                            {poError && <p className="text-xs text-red-500 font-medium">{poError}</p>}
                            {poVerified && <p className="text-xs text-green-600 font-medium">✓ PO Verified</p>}
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium">Reason</label>
                            <Textarea
                                required
                                value={formData.reason}
                                onChange={e => setFormData({...formData, reason: e.target.value})}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <PackageOpen size={18} className="text-blue-600" /> Return Items
                        </CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddItem} disabled={!poVerified}>
                            <Plus size={16} className="mr-1" /> Add
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {formData.items.map((item, index) => {
                            const error = getFieldError(item);
                            return (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 p-4 border rounded-lg">
                                    <div className="md:col-span-5">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Product</label>
                                        <select
                                            className="w-full h-10 border rounded-md px-3 text-sm"
                                            value={item.poItemId}
                                            onChange={e => handleItemChange(index, 'poItemId', e.target.value)}
                                            disabled={!poVerified}
                                        >
                                            <option value="">-- Select Item --</option>
                                            {availableItems.map(p => (
                                                <option key={p.poItemId || p.id} value={p.poItemId || p.id}>
                                                    {p.productName} (Available: {p.receivedQty || 0})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Qty</label>
                                        <Input
                                            type="number"
                                            className={error ? "border-red-500" : ""}
                                            value={item.qtyReturnRequested}
                                            onChange={e => handleItemChange(index, 'qtyReturnRequested', e.target.value)}
                                        />
                                        {error && <p className="text-[10px] text-red-500 mt-1 font-bold">{error}</p>}
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Notes</label>
                                        <Input
                                            value={item.conditionNotes}
                                            onChange={e => handleItemChange(index, 'conditionNotes', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex items-end">
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="text-red-500">
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button type="submit" className="flex-1 bg-blue-600 h-12" disabled={loading || !canSubmit}>
                        {loading ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" /> Submit Return</>}
                    </Button>
                    <Button type="button" variant="outline" className="h-12 px-8" onClick={() => navigate(-1)}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default ReturnRequest;