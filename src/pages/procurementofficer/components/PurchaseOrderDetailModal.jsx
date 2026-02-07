import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Trash2, Save, Loader2, Send } from 'lucide-react';
import api from '../../../services/api';

export function PurchaseOrderDetailModal({ poId, isOpen, onOpenChange, onPoDeleted, onPoUpdated }) {
    const [po, setPo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [itemQuantities, setItemQuantities] = useState({});

    useEffect(() => {
        if (isOpen && poId) {
            fetchPoDetails();
        }
    }, [isOpen, poId]);

    const fetchPoDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/core/purchase-orders/${poId}`);
            setPo(res.data);
            const quantities = res.data.items.reduce((acc, item) => {
                acc[item.poItemId] = item.orderedQty;
                return acc;
            }, {});
            setItemQuantities(quantities);
        } catch (err) {
            console.error("Failed to fetch PO details", err);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (itemId, newQuantity) => {
        setItemQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
    };

    const handleUpdateItem = async (itemId) => {
        const newQuantity = itemQuantities[itemId];
        try {
            await api.patch(`/api/core/purchase-orders/${poId}/items/${itemId}`, {
                orderedQty: newQuantity
            });
            onPoUpdated();
            fetchPoDetails();
        } catch (err) {
            console.error("Failed to update item", err);
        }
    };

    const handleDeletePO = async () => {
        if (window.confirm("Are you sure you want to delete this purchase order?")) {
            try {
                await api.delete(`/api/core/purchase-orders/${poId}`);
                onPoDeleted();
                onOpenChange(false);
            } catch (err) {
                console.error("Failed to delete PO", err);
            }
        }
    };

    const handleSubmitForApproval = async () => {
        if (window.confirm("Are you sure you want to submit this PO for approval?")) {
            try {
                await api.post(`/api/core/purchase-orders/${poId}/submit`);
                onPoUpdated();
                onOpenChange(false);
            } catch (err) {
                console.error("Failed to submit for approval", err);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Purchase Order Details</DialogTitle>
                    <DialogDescription>
                        Viewing PO #{po?.poId} - {po?.supplierName}
                    </DialogDescription>
                </DialogHeader>
                {loading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : po && (
                    <div className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead className="w-32">Quantity</TableHead>
                                    <TableHead className="w-24">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {po.items.map(item => (
                                    <TableRow key={item.poItemId}>
                                        <TableCell>{item.productName}</TableCell>
                                        <TableCell>{item.sku}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={itemQuantities[item.poItemId] || ''}
                                                onChange={(e) => handleQuantityChange(item.poItemId, Number(e.target.value))}
                                                className="h-8"
                                                disabled={po.status !== 'DRAFT'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {po.status === 'DRAFT' && (
                                                <Button size="sm" variant="ghost" onClick={() => handleUpdateItem(item.poItemId)}>
                                                    <Save className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                <DialogFooter className="flex justify-between items-center">
                    <div>
                        {po?.status === 'DRAFT' && (
                            <Button variant="destructive" onClick={handleDeletePO}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete PO
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                        {po?.status === 'DRAFT' && (
                            <Button onClick={handleSubmitForApproval}>
                                <Send className="mr-2 h-4 w-4" /> Submit for Approval
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
