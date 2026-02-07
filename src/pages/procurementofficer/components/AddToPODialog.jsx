import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import api from '../../../services/api';

export function AddToPODialog({ isOpen, onOpenChange, item, onAdded }) {
    const [draftPOs, setDraftPOs] = useState([]);
    const [selectedPO, setSelectedPO] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isCreatingNew, setIsCreatingNew] = useState(false);

    useEffect(() => {
        if (isOpen && item) {
            fetchDraftPOs();
        }
    }, [isOpen, item]);

    const fetchDraftPOs = async () => {
        if (!item?.supplierId) return;
        try {
            const res = await api.get(`/api/core/purchase-orders?status=DRAFT&supplierId=${item.supplierId}`);
            setDraftPOs(res.data.content || []);
        } catch (err) {
            console.error("Failed to fetch draft POs", err);
        }
    };

    const handleAdd = async () => {
        if (!item) return;

        try {
            if (isCreatingNew) {
                const newPO = await api.post('/api/core/purchase-orders', {
                    supplierId: item.supplierId,
                    warehouseId: item.warehouseId,
                });
                await api.post(`/api/core/purchase-orders/${newPO.data.poId}/items`, {
                    productId: item.productId,
                    orderedQty: quantity,
                    unitCost: item.unitPrice // Assuming unitPrice is available on the item
                });
            } else {
                await api.post(`/api/core/purchase-orders/${selectedPO}/items`, {
                    productId: item.productId,
                    orderedQty: quantity,
                    unitCost: item.unitPrice
                });
            }
            onAdded();
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to add to PO", err);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add to Purchase Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p>Product: <strong>{item?.productName}</strong></p>
                    <p>Warehouse: <strong>{item?.warehouseName}</strong></p>
                    <p>Supplier: <strong>{item?.supplierName}</strong></p>

                    <div>
                        <Label htmlFor="po-select">Purchase Order</Label>
                        <div className="flex gap-2">
                            <Select
                                id="po-select"
                                value={selectedPO}
                                onValueChange={setSelectedPO}
                                disabled={isCreatingNew}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a draft PO" />
                                </SelectTrigger>
                                <SelectContent>
                                    {draftPOs.map(po => (
                                        <SelectItem key={po.poId} value={String(po.poId)}>
                                            PO #{po.poId}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => setIsCreatingNew(!isCreatingNew)}>
                                {isCreatingNew ? 'Select Existing' : 'Create New'}
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            min="1"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleAdd}>Add to PO</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
