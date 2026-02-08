import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
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
            // Reset state when dialog opens
            setSelectedPO('');
            setQuantity(1);
            setIsCreatingNew(draftPOs.length === 0);
        }
    }, [isOpen, item]);

    const fetchDraftPOs = async () => {
        if (!item?.supplierId) return;
        try {
            const res = await api.get(`/api/core/purchase-orders?status=DRAFT&supplierId=${item.supplierId}`);
            const draftOrders = res.data.content || [];
            setDraftPOs(draftOrders);
            // If there are no draft POs, default to creating a new one
            if (draftOrders.length === 0) {
                setIsCreatingNew(true);
            } else {
                setIsCreatingNew(false);
            }
        } catch (err) {
            console.error("Failed to fetch draft POs", err);
        }
    };

    const handleAdd = async () => {
        if (!item) return;

        try {
            let targetPoId = selectedPO;

            if (isCreatingNew) {
                const newPO = await api.post('/api/core/purchase-orders', {
                    supplierId: item.supplierId,
                    warehouseId: item.warehouseId,
                });
                targetPoId = newPO.data.poId;
            }

            if (!targetPoId) {
                console.error("No Purchase Order selected or created.");
                return;
            }

            await api.post(`/api/core/purchase-orders/${targetPoId}/items`, {
                productId: item.productId,
                orderedQty: quantity,
                unitCost: item.unitPrice
            });

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
                    <DialogDescription>
                        Add {item?.productName} to an existing draft PO or create a new one.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-3 items-center text-sm">
                        <span className="font-semibold">Product:</span>
                        <span className="col-span-2">{item?.productName}</span>
                        <span className="font-semibold">Warehouse:</span>
                        <span className="col-span-2">{item?.warehouseName}</span>
                        <span className="font-semibold">Supplier:</span>
                        <span className="col-span-2">{item?.supplierName}</span>
                    </div>

                    <div>
                        <Label htmlFor="po-select">Purchase Order</Label>
                        <div className="flex gap-2 mt-1">
                            <Select
                                id="po-select"
                                value={selectedPO}
                                onValueChange={setSelectedPO}
                                disabled={isCreatingNew || draftPOs.length === 0}
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
                            className="mt-1"
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
