import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Loader2, Check, X, Save, ShoppingCart, User, Building, Hash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import api from '../../../services/api';

const PO_STATUSES = [
    "DRAFT", "PENDING_APPROVAL", "APPROVED", "EMAIL_SENT", "SUPPLIER_REPLIED", 
    "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED", "DELAY_EXPECTED"
];

export function ApprovalModal({ poId, isOpen, onOpenChange, onPoApproved, onPoRejected }) {
    const [po, setPo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('');

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
            setSelectedStatus(res.data.status);
        } catch (err) {
            console.error("Failed to fetch PO details", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            await api.post(`/api/core/purchase-orders/${poId}/approve`);
            onPoApproved();
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to approve PO", err);
        }
    };

    const handleReject = async () => {
        if (window.confirm("Are you sure you want to reject this purchase order? This will cancel it.")) {
            try {
                await api.post(`/api/core/purchase-orders/${poId}/cancel`);
                onPoRejected();
                onOpenChange(false);
            } catch (err) {
                console.error("Failed to reject PO", err);
            }
        }
    };

    const handleStatusUpdate = async () => {
        try {
            await api.post(`/api/core/purchase-orders/${poId}/status`, { status: selectedStatus });
            onPoApproved(); // Re-use the same refresh logic
            fetchPoDetails(); // Refresh the modal content
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Purchase Order Details</DialogTitle>
                    <DialogDescription>
                        Review and manage PO #{po?.poId}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : po && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                        {/* Left Column: PO Info */}
                        <div className="md:col-span-1 space-y-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Details</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    <div className="flex items-center"><Hash className="h-4 w-4 mr-2 text-gray-400" /> PO Number: <span className="font-semibold ml-auto">{po.poId}</span></div>
                                    <div className="flex items-center"><User className="h-4 w-4 mr-2 text-gray-400" /> Buyer: <span className="font-semibold ml-auto">{po.buyerEmail}</span></div>
                                    <div className="flex items-center"><Badge>{po.status}</Badge></div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Supplier</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <p className="font-semibold">{po.supplierName}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Ship To</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <p className="font-semibold">{po.warehouseName}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Items and Status Update */}
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative max-h-72 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>SKU</TableHead>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableHead className="text-right">Unit Cost</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {po.items.map(item => (
                                                    <TableRow key={item.poItemId}>
                                                        <TableCell>{item.productName}</TableCell>
                                                        <TableCell>{item.sku}</TableCell>
                                                        <TableCell>{item.orderedQty}</TableCell>
                                                        <TableCell className="text-right">${item.unitCost?.toFixed(2)}</TableCell>
                                                        <TableCell className="text-right">${(item.orderedQty * item.unitCost).toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <div className="text-right font-bold text-lg mt-4">
                                        Grand Total: ${po.totalAmount?.toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>Manual Status Update</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PO_STATUSES.map(status => (
                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button onClick={handleStatusUpdate}>
                                            <Save className="mr-2 h-4 w-4" /> Save Status
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="destructive" onClick={handleReject} disabled={po?.status !== 'PENDING_APPROVAL'}>
                        <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button onClick={handleApprove} disabled={po?.status !== 'PENDING_APPROVAL'}>
                        <Check className="mr-2 h-4 w-4" /> Approve
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
