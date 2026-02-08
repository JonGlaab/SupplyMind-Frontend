import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Loader2, Check, X } from 'lucide-react';
import api from '../../../services/api';

export function ApprovalModal({ poId, isOpen, onOpenChange, onPoApproved, onPoRejected }) {
    const [po, setPo] = useState(null);
    const [loading, setLoading] = useState(true);

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
            // In the next step, we will show the email view instead of closing
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to approve PO", err);
        }
    };

    const handleReject = async () => {
        // For now, we'll just cancel the PO. We can add a reason later.
        if (window.confirm("Are you sure you want to reject this purchase order?")) {
            try {
                await api.post(`/api/core/purchase-orders/${poId}/cancel`);
                onPoRejected();
                onOpenChange(false);
            } catch (err) {
                console.error("Failed to reject PO", err);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Approve Purchase Order</DialogTitle>
                    <DialogDescription>
                        Review the details of PO #{po?.poId} and approve or reject it.
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

                        {/* Right Panel: Email Preview (Placeholder) */}
                        <div className="bg-gray-100 p-4 rounded-md">
                            <h3 className="font-bold">Email Preview</h3>
                            <p className="text-sm text-gray-500">Email editor will go here.</p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="destructive" onClick={handleReject}>
                        <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button onClick={handleApprove}>
                        <Check className="mr-2 h-4 w-4" /> Approve
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
