import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Search, PackagePlus, Warehouse, History, ArrowRightLeft } from 'lucide-react';

const InventoryView = () => {
    const [inventory, setInventory] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedWarehouse, setSelectedWarehouse] = useState(1);
    const [recentActions, setRecentActions] = useState([]);
    // FIXED: Changed 'role' to 'userRole' to match your Login/App logic
    const [userRole] = useState(localStorage.getItem('userRole'));

    useEffect(() => {
        fetchInventory();
    }, [selectedWarehouse]);

    const fetchInventory = async () => {
        try {
            const res = await api.get(`/api/inventory/warehouse/${selectedWarehouse}`);
            setInventory(res.data);
        } catch (err) {
            console.error("Error fetching inventory", err);
        }
    };

    const handleReceive = async (productId, productName, amount) => {
        if (!amount || amount <= 0) return;
        try {
            await api.post('/api/inventory/receive', {
                warehouseId: selectedWarehouse,
                productId,
                amount: parseInt(amount)
            });
            logAction(`Added ${amount} units to ${productName}`);
            fetchInventory();
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    const handleTransfer = async (productId, productName, amount) => {
        if (!amount || amount <= 0) return;
        // Determine destination (if 1 go to 2, if 2 go to 1)
        const destinationId = selectedWarehouse == 1 ? 2 : 1;
        const destinationName = selectedWarehouse == 1 ? "East Distribution" : "Main Warehouse";

        try {
            await api.post('/api/inventory/transfer', {
                fromWarehouseId: selectedWarehouse,
                toWarehouseId: destinationId,
                productId,
                amount: parseInt(amount)
            });
            logAction(`Transferred ${amount} ${productName} to ${destinationName}`);
            fetchInventory();
        } catch (err) {
            alert("Transfer failed. Ensure you have enough stock.");
        }
    };

    const logAction = (msg) => {
        const entry = `${new Date().toLocaleTimeString()}: ${msg}`;
        setRecentActions(prev => [entry, ...prev].slice(0, 5));
    };

    const filteredInventory = inventory.filter(item =>
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Inventory Management</h1>
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-md border shadow-sm">
                        <Warehouse size={16} className="text-slate-400" />
                        <select
                            className="text-sm font-medium bg-transparent focus:outline-none"
                            value={selectedWarehouse}
                            onChange={(e) => setSelectedWarehouse(e.target.value)}
                        >
                            <option value={1}>Main Warehouse</option>
                            <option value={2}>East Distribution</option>
                        </select>
                    </div>
                </div>

                <Card className="shadow-md border-none">
                    <CardHeader className="pb-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                                placeholder="Search by SKU or name..."
                                className="pl-10 h-11"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-4 text-xs font-bold uppercase text-slate-500">Product / SKU</th>
                                    <th className="p-4 text-xs font-bold uppercase text-slate-500">Stock Level</th>
                                    <th className="p-4 text-xs font-bold uppercase text-slate-500 text-center">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredInventory.map(item => (
                                    <tr key={item.id} className="border-b hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold">{item.product.name}</div>
                                            <div className="text-xs font-mono text-slate-400">{item.product.sku}</div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={item.qtyOnHand < 5 ? "destructive" : "outline"} className="px-3">
                                                {item.qtyOnHand} On Hand
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2 justify-center">
                                                <Input
                                                    type="number"
                                                    className="w-20 h-9 text-center"
                                                    placeholder="Qty"
                                                    id={`qty-${item.product.id}`}
                                                />
                                                {/* Add Stock Button */}
                                                <Button
                                                    size="sm"
                                                    title="Receive Stock"
                                                    className="bg-emerald-600 hover:bg-emerald-700 h-9"
                                                    onClick={() => {
                                                        const input = document.getElementById(`qty-${item.product.id}`);
                                                        handleReceive(item.product.id, item.product.name, input.value);
                                                        input.value = '';
                                                    }}
                                                >
                                                    <PackagePlus size={16} />
                                                </Button>
                                                {/* Transfer Stock Button */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    title="Transfer to other Warehouse"
                                                    className="h-9 border-blue-200 text-blue-600 hover:bg-blue-50"
                                                    onClick={() => {
                                                        const input = document.getElementById(`qty-${item.product.id}`);
                                                        handleTransfer(item.product.id, item.product.name, input.value);
                                                        input.value = '';
                                                    }}
                                                >
                                                    <ArrowRightLeft size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-1">
                <Card className="h-full shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-2 border-b">
                        <History size={18} className="text-slate-500" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                            Recent Updates
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {recentActions.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-10 italic">No updates in this session.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentActions.map((action, i) => (
                                    <div key={i} className="text-[11px] leading-relaxed p-3 bg-slate-50 rounded-lg border-l-4 border-blue-500 shadow-sm">
                                        {action}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InventoryView;