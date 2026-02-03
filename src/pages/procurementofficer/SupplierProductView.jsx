import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Clock, DollarSign, Package, Trash2, Save, Truck, Loader2 } from 'lucide-react';

const SupplierProductView = () => {
    const { supplierId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSupplierProducts();
    }, [supplierId]);

    const [supplierName, setSupplierName] = useState("");

    const fetchSupplierProducts = async () => {
        try {
            const res = await api.get(`/api/core/supplier-products`, {
                params: { supplierId }
            });
            setProducts(res.data);

            // Grab the name from the first product in the list
            if (res.data.length > 0) {
                // Adjust 'item.supplierName' based on your DTO field name
                setSupplierName(res.data[0].supplierName || res.data[0].supplier?.name);
            }

            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    };

    const handleUpdate = async (id, costPrice, leadTimeDays) => {
        try {
            // Matches @PatchMapping("/{id}")
            await api.patch(`/api/core/supplier-products/${id}`, {
                costPrice: parseFloat(costPrice),
                leadTimeDays: parseInt(leadTimeDays)
            });
            fetchSupplierProducts(); // Refresh
        } catch (err) {
            alert("Update failed. Check your values.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this product from this supplier's catalog?")) return;
        try {
            // Matches @DeleteMapping("/{id}")
            await api.delete(`/api/core/supplier-products/${id}`);
            fetchSupplierProducts();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="text-2xl font-bold italic">Supplier Catalog Management</h1>
            </div>

            <div className="flex items-center gap-4 border-b pb-6">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <div className="flex items-center gap-2">
                        <Truck className="text-slate-400" size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Supplier Catalog</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {loading ? "Loading..." : supplierName || "Unknown Supplier"}
                    </h1>
                </div>
            </div>

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

            {products.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400">No products assigned to this supplier.</p>
                </div>
            )}
        </div>
    );
};

export default SupplierProductView;