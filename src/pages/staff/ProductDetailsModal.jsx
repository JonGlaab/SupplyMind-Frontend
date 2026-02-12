import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Badge } from '../../components/ui/badge.jsx';

const ProductDetailsModal = ({ product, isOpen, onClose, onUpdateSuccess, userRole }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setEditData({
                name: product.name,
                category: product.category,
                unitPrice: product.unitPrice,
                description: product.description || ''
            });
        }
        setIsEditing(false);
    }, [product]);

    if (!isOpen || !product) return null;

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.patch(`/api/core/products/${product.productId}`, editData);
            onUpdateSuccess();
            Object.assign(product, response.data);
            setIsEditing(false);
        } catch (err) {
            console.error("Update failed", err);
            alert("Failed to update product.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

        setIsLoading(true);
        try {
            await api.delete(`/api/core/products/${productId}`);
            onClose();
            onUpdateSuccess();
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete product. It may be linked to existing orders.");
        } finally {
            setIsLoading(false);
        }
    };

    // TODO: Remove ADMIN for production

    // --- DEVELOPMENT: Grant Admin full control ---
    const canModify = userRole === 'MANAGER' || userRole === 'PROCUREMENT_OFFICER' || userRole === 'ADMIN';
    const canDelete = userRole === 'PROCUREMENT_OFFICER' || userRole === 'ADMIN';

    /* --- PRODUCTION:
    const canModify = userRole === 'MANAGER' || userRole === 'PROCUREMENT_OFFICER';
    const canDelete = userRole === 'PROCUREMENT_OFFICER';
    --- */

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                    <div className="space-y-1">
                        {isEditing ? (
                            <Input
                                value={editData.name}
                                onChange={e => setEditData({...editData, name: e.target.value})}
                                className="text-xl font-bold h-8"
                            />
                        ) : (
                            <h2 className="text-2xl font-bold text-slate-900">{product.name}</h2>
                        )}
                        <p className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-fit">
                            {product.sku}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                </div>

                {/* Content Area */}
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Category</label>
                            {isEditing ? (
                                <Input
                                    value={editData.category}
                                    onChange={e => setEditData({...editData, category: e.target.value})}
                                />
                            ) : (
                                <div className="pt-1"><Badge variant="default">{product.category || 'N/A'}</Badge></div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Unit Price</label>
                            {isEditing ? (
                                <Input
                                    type="number"
                                    value={editData.unitPrice}
                                    onChange={e => setEditData({...editData, unitPrice: e.target.value})}
                                />
                            ) : (
                                <p className="text-xl font-bold">${product.unitPrice?.toFixed(2)}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Description</label>
                        {isEditing ? (
                            <textarea
                                className="w-full min-h-[150px] p-3 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={editData.description}
                                onChange={e => setEditData({...editData, description: e.target.value})}
                                placeholder="Enter detailed product specifications..."
                            />
                        ) : (
                            <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg italic">
                                {product.description || 'No detailed description provided for this item.'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
                    <div>
                        {!isEditing && canDelete && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(product.productId)}
                                disabled={isLoading}
                            >
                                {isLoading ? "Deleting..." : "Delete Product"}
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={onClose}>Close</Button>
                                {canModify && (
                                    <Button onClick={() => setIsEditing(true)}>Edit Product</Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsModal;