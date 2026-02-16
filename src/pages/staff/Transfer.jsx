import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Package, ArrowRight, Warehouse as WarehouseIcon, Search, ArrowLeft } from 'lucide-react';
import { Input } from '../../components/ui/input.jsx';
import api from '../../services/api.js';
import InventoryTransferModal from './components/InventoryTransferModal.jsx';

const Transfer = () => {
    const navigate = useNavigate();

    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [inventory, setInventory] = useState([]);

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Fetch all warehouses
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await api.get('/api/core/warehouses');
                setWarehouses(res.data.content || res.data || []);
            } catch (err) {
                console.error("Failed to load warehouses", err);
            }
        };
        fetchWarehouses();
    }, []);

    const handleWarehouseSelect = async (wh) => {
        setSelectedWarehouse(wh);
        setLoading(true);
        try {
            const res = await api.get(`/api/core/inventory`, {
                params: { warehouseId: wh.warehouseId, size: 100 }
            });
            setInventory(res.data.content || []);
        } catch (err) {
            console.error("Failed to load inventory", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Top Navigation Bar */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-full shadow-sm hover:bg-slate-100"
                >
                    <ArrowLeft size={18} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Stock Transfer</h1>
                    <p className="text-sm font-medium text-slate-500 italic">
                        Select a source and destination to move inventory
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <Card className="md:col-span-1 shadow-md border-slate-200">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-slate-600">
                            <WarehouseIcon size={16} /> 1. Source Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                        {warehouses.map(wh => (
                            <Button
                                key={wh.warehouseId}
                                variant={selectedWarehouse?.warehouseId === wh.warehouseId ? "default" : "ghost"}
                                className={`w-full justify-start h-auto py-3 px-4 transition-all ${
                                    selectedWarehouse?.warehouseId === wh.warehouseId
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "hover:bg-slate-100"
                                }`}
                                onClick={() => handleWarehouseSelect(wh)}
                            >
                                <div className="text-left">
                                    <div className="font-bold">{wh.locationName}</div>
                                    <div className="text-[10px] opacity-80 font-mono">{wh.skuPrefix || 'WH-'+wh.warehouseId}</div>
                                </div>
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                {/* Step 2: Select Product (wider column) */}
                <Card className="md:col-span-3 shadow-md border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 py-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-slate-600">
                            <Package size={16} /> 2. Available Stock
                        </CardTitle>
                        {selectedWarehouse && (
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <Input
                                    placeholder="Search product or SKU..."
                                    className="h-9 pl-9 text-sm bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        {!selectedWarehouse ? (
                            <div className="py-32 text-center">
                                <WarehouseIcon size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-medium italic">Please select a source location from the left</p>
                            </div>
                        ) : loading ? (
                            <div className="py-32 text-center text-slate-400 animate-pulse font-medium">
                                Retrieving facility inventory...
                            </div>
                        ) : (
                            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
                                {inventory
                                    .filter(item =>
                                        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map(item => (
                                        <div
                                            key={item.inventoryId}
                                            className="flex items-center justify-between p-4 hover:bg-blue-50/50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                                                    <Package size={20} className="text-slate-600" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{item.productName}</div>
                                                    <div className="text-xs text-slate-500 font-mono tracking-tighter">{item.sku}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <div className="text-[10px] text-slate-400 uppercase font-black">Available</div>
                                                    <div className={`font-mono text-xl font-bold ${item.qtyOnHand < 10 ? 'text-red-500' : 'text-slate-700'}`}>
                                                        {item.qtyOnHand}
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="bg-slate-900 hover:bg-blue-600 transition-colors"
                                                    onClick={() => handleOpenModal(item)}
                                                    disabled={item.qtyOnHand <= 0}
                                                >
                                                    Transfer <ArrowRight size={14} className="ml-2" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                {inventory.length === 0 && (
                                    <div className="text-center py-20 text-slate-400 italic">This location is currently empty.</div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <InventoryTransferModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                selectedItem={selectedItem}
                fromWarehouseId={selectedWarehouse?.warehouseId}
                fromWarehouseName={selectedWarehouse?.locationName}
                onComplete={() => {
                    handleWarehouseSelect(selectedWarehouse);
                }}
            />
        </div>
    );
};

export default Transfer;