import { useState } from 'react';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        category: '',
        unitPrice: '',
        reorderPoint: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await api.post('/api/core/products', {
                ...formData,
                unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : 0,
                reorderPoint: formData.reorderPoint ? parseInt(formData.reorderPoint) : 0
            });

            setFormData({ sku: '', name: '', category: '', unitPrice: '', reorderPoint: '', description: '' });
            onSuccess();
            onClose();
        } catch (err) {
            // Catches "SKU already exists" or validation errors
            setError(err.response?.data?.message || "Failed to create product. Check if SKU is unique.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
                <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">SKU (Unique)</label>
                            <Input
                                required
                                value={formData.sku}
                                onChange={e => setFormData({...formData, sku: e.target.value})}
                                placeholder="e.g. WH-100"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Category</label>
                            <Input
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                placeholder="e.g. Tools"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Product Name</label>
                        <Input
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Price ($)</label>
                            <Input
                                type="number" step="0.01"
                                value={formData.unitPrice}
                                onChange={e => setFormData({...formData, unitPrice: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Min. Stock Level</label>
                            <Input
                                type="number"
                                value={formData.reorderPoint}
                                onChange={e => setFormData({...formData, reorderPoint: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Description</label>
                        <textarea
                            className="w-full min-h-[100px] p-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Add Product'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;