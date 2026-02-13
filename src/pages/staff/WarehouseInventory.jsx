import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import {
    ArrowLeft, Package, History,
    AlertTriangle, Loader2, Search
} from 'lucide-react';
import { Input } from '../../components/ui/input.jsx';

const WarehouseInventory = () => {
    const { warehouseId } = useParams();
    const [warehouse, setWarehouse] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const warehouseName = location.state?.name || "Warehouse";

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchWarehouse = async () => {
            try {
                const res = await api.get(`/api/core/warehouses/${warehouseId}`);
                setWarehouse(res.data);
            } catch (err) {
                console.error("Failed to load warehouse name", err);
            }
        };
        fetchWarehouse();
    }, [warehouseId]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/core/inventory`, {
                params: {
                    warehouseId,
                    page: page,
                    size: 10
                }
            });

            setInventory(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [warehouseId, page]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{warehouse ? `${warehouse.locationName} - Inventory` : "Loading..."}</h1>
                        <p className="text-sm text-slate-500">Real-time stock levels for this facility</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={() => navigate(`/staff/${warehouseId}/transferhistory`)}
                >
                    <History size={16} className="mr-2" /> View Transfer Log
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Filter by product name or SKU..."
                            className="pl-10"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b text-[11px] font-bold uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Product Details</th>
                            <th className="px-6 py-4 text-center">Current Stock</th>
                            <th className="px-6 py-4">Last Updated</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                        ) : inventory.length === 0 ? (
                            <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-medium">No stock found in this facility.</td></tr>
                        ) : (
                            inventory
                                .filter(item => item.productName?.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((item) => (
                                    <tr key={item.inventoryId} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded text-slate-600">
                                                    <Package size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{item.productName}</div>
                                                    <div className="text-[10px] font-mono text-slate-400">SKU: {item.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                                <span className={`text-lg font-bold ${item.qtyOnHand < 10 ? 'text-red-600' : 'text-slate-900'}`}>
                                                    {item.qtyOnHand.toLocaleString()}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(item.updatedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {item.qtyOnHand < 10 ? (
                                                <Badge className="bg-red-50 text-red-700 border-red-100">
                                                    <AlertTriangle size={12} className="mr-1" /> Low Stock
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-green-50 text-green-700 border-green-100">
                                                    In Stock
                                                </Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))
                        )}
                        </tbody>
                    </table>
                    <div className="flex justify-between items-center p-4 border-t">
                        <Button
                            disabled={page === 0}
                            onClick={() => setPage(prev => prev - 1)}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-slate-500">
        Page {page + 1} of {totalPages}
    </span>
                        <Button
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(prev => prev + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WarehouseInventory;