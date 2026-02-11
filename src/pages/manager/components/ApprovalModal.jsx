import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Loader2, Check, X, Save, User, Hash, Send, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import api from '../../../services/api';
import SendEmailModal from '../../shared/SendEmailModal';

const PO_STATUSES = [
    "DRAFT", "PENDING_APPROVAL", "APPROVED", "EMAIL_SENT", "SUPPLIER_REPLIED",
    "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED", "DELAY_EXPECTED"
];
export function ApprovalModal({ poId, isOpen, onOpenChange, onPoUpdated }) {
    const [po, setPo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // NEW: State to control the separate SendEmailModal
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && poId) {
            fetchPoDetails();
        } else {
            setError('');
            setIsEmailModalOpen(false);
        }
    }, [isOpen, poId]);

    const fetchPoDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/api/core/purchase-orders/${poId}`);
            setPo(res.data);
            setSelectedStatus(res.data.status);
        } catch (err) {
            console.error("Failed to fetch PO details", err);
            setError("Failed to load purchase order details.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post(`/api/core/purchase-orders/${poId}/approve`);
            onPoUpdated();
            fetchPoDetails();
        } catch (err) {
            console.error("Failed to approve PO", err);
            setError(err.response?.data?.message || "An error occurred during approval.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewPdf = () => {
        if (po?.pdfUrl) {
            window.open(po.pdfUrl, '_blank');
        }
    };

    const handleReject = async () => {
        if (window.confirm("Are you sure you want to reject this purchase order? This will cancel it.")) {
            try {
                await api.post(`/api/core/purchase-orders/${poId}/cancel`);
                onPoUpdated();
                onOpenChange(false);
            } catch (err) {
                console.error("Failed to reject PO", err);
            }
        }
    };

    const handleStatusUpdate = async () => {
        try {
            await api.post(`/api/core/purchase-orders/${poId}/status`, { status: selectedStatus });
            onPoUpdated();
            fetchPoDetails();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const renderDetailsView = () => (
        <>
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                <div className="md:col-span-1 space-y-6">
                    <Card><CardHeader className="pb-2"><CardTitle className="text-base">Details</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex items-center"><Hash className="h-4 w-4 mr-2 text-gray-400" /> PO Number: <span className="font-semibold ml-auto">{po.poId}</span></div>
                            <div className="flex items-center"><User className="h-4 w-4 mr-2 text-gray-400" /> Buyer: <span className="font-semibold ml-auto break-all">{po.buyerEmail}</span></div>
                            <div className="flex items-center"><Badge>{po.status}</Badge></div>
                        </CardContent>
                    </Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-base">Supplier</CardTitle></CardHeader><CardContent className="text-sm space-y-1"><p className="font-semibold">{po.supplierName}</p></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-base">Ship To</CardTitle></CardHeader><CardContent className="text-sm space-y-1"><p className="font-semibold">{po.warehouseName}</p></CardContent></Card>
                </div>
                <div className="md:col-span-2 space-y-6">
                    <Card><CardHeader><CardTitle>Items</CardTitle></CardHeader>
                        <CardContent>
                            <div className="relative max-h-72 overflow-y-auto">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Quantity</TableHead><TableHead className="text-right">Unit Cost</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {po.items.map(item => (
                                            <TableRow key={item.poItemId}>
                                                <TableCell>{item.productName}</TableCell><TableCell>{item.sku}</TableCell><TableCell>{item.orderedQty}</TableCell>
                                                <TableCell className="text-right">${item.unitCost?.toFixed(2)}</TableCell><TableCell className="text-right">${(item.orderedQty * item.unitCost).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="text-right font-bold text-lg mt-4">Grand Total: ${po.totalAmount?.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card><CardHeader><CardTitle>Manual Status Update</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
                                    <SelectContent>{PO_STATUSES.map(status => (<SelectItem key={status} value={status} disabled={status === 'APPROVED'}>{status}</SelectItem>))}</SelectContent>
                                </Select>
                                <Button onClick={handleStatusUpdate}><Save className="mr-2 h-4 w-4" /> Save Status</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <DialogFooter className="sm:justify-between">
                <div>
                    <Button variant="outline" onClick={handleViewPdf} disabled={!po?.pdfUrl}><FileText className="mr-2 h-4 w-4" /> View PDF</Button>
                </div>
                <div className="flex gap-2">
                    {po?.status === 'PENDING_APPROVAL' && (
                        <>
                            <Button variant="destructive" onClick={handleReject}><X className="mr-2 h-4 w-4" /> Reject</Button>
                            <Button onClick={handleApprove}><Check className="mr-2 h-4 w-4" /> Approve</Button>
                        </>
                    )}
                    {/* TRIGGER: Opens the standalone modal instead of internal view */}
                    {po?.status === 'APPROVED' && (
                        <Button onClick={() => setIsEmailModalOpen(true)}>
                            <Send className="mr-2 h-4 w-4" /> Email to Supplier
                        </Button>
                    )}
                </div>
            </DialogFooter>
        </>
    );

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Purchase Order Details</DialogTitle>
                        <DialogDescription>Review and manage PO #{po?.poId}</DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto">
                        {loading ? <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div> : (po ? renderDetailsView() : <p>No data available.</p>)}
                    </div>
                    {po && (
                        <SendEmailModal
                            isOpen={isEmailModalOpen}
                            onClose={() => setIsEmailModalOpen(false)}
                            po={po}
                            supplierEmail={po.supplierEmail}
                            onEmailSent={() => {
                                setIsEmailModalOpen(false);
                                fetchPoDetails(); // Re-fetch to show updated status
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
