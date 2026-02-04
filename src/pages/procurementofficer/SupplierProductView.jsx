import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Clock, DollarSign, Package, Trash2, Plus, X, Truck, Loader2, Save } from 'lucide-react';

const SupplierProductView = () => {
    const { supplierId } = useParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [masterProducts, setMasterProducts] = useState([]); // All available products in system
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [supplierName, setSupplierName] = useState("");

    const [newLink, setNewLink] = useState({
        productId: '',
        costPrice: '',
        leadTimeDays: ''
    });

    useEffect(() => {
        fetchSupplierProducts();
        fetchMasterProducts();
    }, [supplierId]);

    const fetchSupplierProducts = async () => {
        try {
            const res = await api.get(`/api/core/supplier-products`, {
                params: { supplierId }
            });
            setProducts(res.data);
            if (res.data.length > 0) {
                setSupplierName(res.data[0].supplierName || res.data[0].supplier?.name);
            }
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    };

    const fetchMasterProducts = async () => {
        try {
            const res = await api.get('/api/core/products'); // Adjust path to your ProductController
            // If your product endpoint is paginated, use res.data.content
            setMasterProducts(Array.isArray(res.data) ? res.data : res.data.content || []);
        } catch (err) {
            console.error("Could not load master product list", err);
        }
    };

    const handleCreateLink = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/api/core/supplier-products`, {
                supplierId: parseInt(supplierId),
                productId: parseInt(newLink.productId),
                costPrice: parseFloat(newLink.costPrice),
                leadTimeDays: parseInt(newLink.leadTimeDays)
            });
            setShowAddForm(false);
            setNewLink({ productId: '', costPrice: '', leadTimeDays: '' });
            fetchSupplierProducts(); // Refresh list
        } catch (err) {
            alert("Failed to link product. It might already be assigned to this supplier.");
        }
    };

    const handleUpdate = async (id, costPrice, leadTimeDays) => {
        try {
            await api.patch(`/api/core/supplier-products/${id}`, {
                costPrice: parseFloat(costPrice),
                leadTimeDays: parseInt(leadTimeDays)
            });
            fetchSupplierProducts();
        } catch (err) {
            alert("Update failed.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this product from this supplier's catalog?")) return;
        try {
            await api.delete(`/api/core/supplier-products/${id}`);
            fetchSupplierProducts();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between border-b pb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <Truck className="text-slate-400" size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Supplier Catalog</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            {supplierName || "Catalog Management"}
                        </h1>
                    </div>
                </div>

                {!showAddForm && (
                    <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus size={18} className="mr-2" /> Add Product to Catalog
                    </Button>
                )}
            </div>

            {/* Quick Add Form */}
            {showAddForm && (
                <Card className="border-2 border-blue-100 bg-blue-50/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">Link Product to Supplier</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}>
                            <X size={18} />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateLink} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Select Product</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                                    value={newLink.productId}
                                    onChange={(e) => setNewLink({...newLink, productId: e.target.value})}
                                    required
                                >
                                    <option value="">Choose product...</option>
                                    {masterProducts.map(p => (
                                        <option key={p.productId || p.id} value={p.productId || p.id}>
                                            {p.name} ({p.sku})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Unit Cost</label>
                                <Input
                                    type="number" step="0.01" required
                                    value={newLink.costPrice}
                                    onChange={(e) => setNewLink({...newLink, costPrice: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Lead Time (Days)</label>
                                <Input
                                    type="number" required
                                    value={newLink.leadTimeDays}
                                    onChange={(e) => setNewLink({...newLink, leadTimeDays: e.target.value})}
                                />
                            </div>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 w-full">
                                <Save size={18} className="mr-2" /> Confirm Link
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Existing Catalog Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {products.map((item) => (
                    <Card key={item.id} className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b pb-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Package className="text-blue-500" size={18} />
                                    <CardTitle className="text-base">{item.productName}</CardTitle>
                                </div>
                                <Badge variant="outline" className="font-mono">{item.sku}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-6 mb-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                                        <DollarSign size={12} /> Unit Cost
                                    </label>
                                    <Input
                                        type="number"
                                        defaultValue={item.costPrice}
                                        step="0.01"
                                        onBlur={(e) => handleUpdate(item.id, e.target.value, item.leadTimeDays)}
                                        className="h-9 focus:border-emerald-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                                        <Clock size={12} /> Lead Time (Days)
                                    </label>
                                    <Input
                                        type="number"
                                        defaultValue={item.leadTimeDays}
                                        onBlur={(e) => handleUpdate(item.id, item.costPrice, e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2 border-t mt-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:bg-red-50"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    <Trash2 size={16} className="mr-2" /> Unlink Product
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {products.length === 0 && !showAddForm && (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <Package className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-slate-400">No products assigned to this supplier.</p>
                    <Button variant="link" onClick={() => setShowAddForm(true)}>Add your first product</Button>
                </div>
            )}
        </div>
    );
};

export default SupplierProductView;