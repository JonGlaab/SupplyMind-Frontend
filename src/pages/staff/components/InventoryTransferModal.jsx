import React, { useState, useEffect } from 'react';
import api from '../../../services/api.js';
import { Button } from '../../../components/ui/button.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { Label } from "../../../components/ui/label.jsx";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../../components/ui/dialog.jsx";
import { AlertCircle, Loader2, Package } from 'lucide-react';


const InventoryTransferModal = ({ isOpen, setIsOpen, selectedItem, fromWarehouseId, fromWarehouseName, onComplete }) => {
    const [transferQty, setTransferQty] = useState(1);
    const [targetWarehouseId, setTargetWarehouseId] = useState("");
    const [allWarehouses, setAllWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [targetStock, setTargetStock] = useState(null);

    const getValidationError = () => {
        const available = selectedItem?.qtyOnHand || 0;
        const requested = Number(transferQty);

        if (requested > available) {
            return `Insufficient stock. Max available: ${available}`;
        }
        if (requested <= 0) {
            return "Quantity must be greater than 0";
        }
        return null;
    };

    const error = getValidationError();

    useEffect(() => {
        if (isOpen) {
            const fetchWarehouses = async () => {
                try {
                    const res = await api.get('/api/core/warehouses');
                    const data = res.data.content || res.data || [];
                    setAllWarehouses(data.filter(w => Number(w.warehouseId) !== Number(fromWarehouseId)));
                } catch (err) {
                    console.error("Failed to fetch warehouses", err);
                }
            };
            fetchWarehouses();
            setTransferQty(1);
            setTargetWarehouseId("");
        }
    }, [isOpen, fromWarehouseId]);

    useEffect(() => {
        const fetchTargetStock = async () => {
            if (targetWarehouseId && selectedItem && isOpen) {
                try {
                    const res = await api.get('/api/core/inventory', {
                        params: {
                            warehouseId: targetWarehouseId,
                            sku: selectedItem.sku
                        }
                    });

                    const existingItem = res.data.content?.find(item => item.sku === selectedItem.sku);
                    setTargetStock(existingItem ? existingItem.qtyOnHand : 0);
                } catch (err) {
                    console.error("Could not fetch target stock", err);
                    setTargetStock(0);
                }
            } else {
                setTargetStock(null);
            }
        };
        fetchTargetStock();
    }, [targetWarehouseId, selectedItem, isOpen]);

    const handleTransferSubmit = async () => {
        if (!targetWarehouseId || error) return;

        try {
            setLoading(true);
            const payload = {
                fromWarehouseId: Number(fromWarehouseId),
                toWarehouseId: Number(targetWarehouseId),
                productId: selectedItem.productId,
                quantity: Number(transferQty),
                notes: `Outbound transfer initiated from ${fromWarehouseName}`
            };

            await api.post('/api/core/inventory/transfer', payload);
            setIsOpen(false);
            if (onComplete) onComplete();
        } catch (err) {
            console.error("Transfer failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Initiate Stock Transfer</DialogTitle>
                    <p className="text-sm text-slate-500">
                        Moving <strong>{selectedItem?.productName}</strong> from {fromWarehouseName}
                    </p>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                            <Label>Destination Warehouse</Label>
                            <select
                                className="w-full h-10 border rounded-md px-3 text-sm"
                                value={targetWarehouseId}
                                onChange={(e) => setTargetWarehouseId(e.target.value)}
                            >
                                <option value="">Select destination...</option>
                                {allWarehouses.map(w => (
                                    <option key={w.warehouseId} value={w.warehouseId}>
                                        {w.locationName}
                                    </option>
                                ))}
                            </select>

                            {targetStock !== null && (
                                <div className="flex items-center gap-2 mt-2 px-2 py-1.5 bg-blue-50 border border-blue-100 rounded-md">
                                    <Package size={14} className="text-blue-600" />
                                    <span className="text-[11px] text-blue-700 font-medium">
                                    Destination currently has <span className="font-bold">{targetStock}</span> units
                                </span>
                                </div>
                            )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label className={error ? "text-red-500" : ""}>Quantity to Transfer</Label>
                            <span className="text-[10px] font-bold uppercase text-slate-400">
                                On Hand: {selectedItem?.qtyOnHand}
                            </span>
                        </div>
                        <Input
                            type="number"
                            className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
                            value={transferQty}
                            onChange={(e) => setTransferQty(e.target.value)}
                        />
                        {error && (
                            <div className="flex items-center gap-1 text-red-500 text-xs mt-1 font-medium">
                                <AlertCircle size={12} />
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleTransferSubmit}
                        disabled={loading || !!error || !targetWarehouseId}
                        className={error ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Confirm Transfer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InventoryTransferModal;