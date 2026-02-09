import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Loader2, Check, X, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
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
            <DialogContent className="max-w-4xl h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Purchase Order Details</DialogTitle>
                    <DialogDescription>
                        Review and manage PO #{po?.poId} for {po?.supplierName}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-6 h-full">
                        {/* Left Panel: PO Details */}
                        <div className="space-y-4">
                            <h3 className="font-bold">PO Details</h3>
                            <p><strong>Supplier:</strong> {po?.supplierName}</p>
                            <p><strong>Warehouse:</strong> {po?.warehouseName}</p>
                            <p><strong>Total:</strong> ${po?.totalAmount?.toLocaleString()}</p>
                            <ul>
                                {po?.items.map(item => (
                                    <li key={item.poItemId}>{item.productName} - Qty: {item.orderedQty}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Right Panel: Manual Status Update */}
                        <div className="bg-gray-100 p-4 rounded-md">
                            <h3 className="font-bold">Manual Status Update</h3>
                            <div className="flex items-center gap-2 mt-4">
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
                                <Button onClick={handleStatusUpdate} size="sm">
                                    <Save className="mr-2 h-4 w-4" /> Save
                                </Button>
                            </div>
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
