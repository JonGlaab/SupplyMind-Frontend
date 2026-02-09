import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import {
    ArrowLeft, Save, Plus, Trash2,
    ClipboardList, PackageOpen, AlertCircle
} from 'lucide-react';

const ReturnRequest = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        poId: '',
        reason: '',
        items: [{ inventoryId: '', quantity: '', reason: '' }]
    });

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { inventoryId: '', quantity: '', reason: '' }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                poId: parseInt(formData.poId),
                reason: formData.reason,
                items: formData.items.map(item => ({
                    ...item,
                    inventoryId: parseInt(item.inventoryId),
                    quantity: parseInt(item.quantity)
                }))
            };

            const res = await api.post('/api/returns', payload);
            alert(`Return Request ${res.data.id} created successfully!`);
            navigate('/returns'); // Redirect to a list view after success
        } catch (err) {
            console.error("Return creation failed", err);
            alert("Error: " + (err.response?.data?.message || "Check PO ID and Inventory permissions."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} className="mr-2" /> Back
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Initiate Return Request</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Information */}
                <Card className="shadow-sm">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <ClipboardList size={18} className="text-blue-600" />
                            General Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Purchase Order ID (PO #)</label>
                            <Input
                                required
                                type="number"
                                placeholder="Enter PO Number"
                                value={formData.poId}
                                onChange={e => setFormData({...formData, poId: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Main Reason for Return</label>
                            <Textarea
                                required
                                placeholder="Describe why this entire shipment is being returned..."
                                value={formData.reason}
                                onChange={e => setFormData({...formData, reason: e.target.value})}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Line Items */}
                <Card className="shadow-sm">
                    <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <PackageOpen size={18} className="text-blue-600" />
                            Return Line Items
                        </CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                            <Plus size={16} className="mr-1" /> Add Item
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {formData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 p-4 border rounded-lg bg-white relative">
                                <div className="md:col-span-3">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Inventory ID</label>
                                    <Input
                                        required
                                        type="number"
                                        value={item.inventoryId}
                                        onChange={e => handleItemChange(index, 'inventoryId', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Qty</label>
                                    <Input
                                        required
                                        type="number"
                                        value={item.quantity}
                                        onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-6">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Item Reason</label>
                                    <Input
                                        placeholder="Defective, wrong size, etc."
                                        value={item.reason}
                                        onChange={e => handleItemChange(index, 'reason', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-1 flex items-end pb-1">
                                    {formData.items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:bg-red-50"
                                            onClick={() => handleRemoveItem(index)}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {formData.items.length === 0 && (
                            <div className="text-center py-6 text-slate-400 flex flex-col items-center">
                                <AlertCircle className="mb-2" />
                                <p>No items added to this return.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 h-12"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : (
                            <span className="flex items-center gap-2">
                                <Save size={18} /> Submit Return Request
                            </span>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-12 px-8"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ReturnRequest;