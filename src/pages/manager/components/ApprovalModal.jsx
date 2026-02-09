import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Loader2, Check, X, Save, ShoppingCart, User, Building, Hash, Send, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import api from '../../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PO_STATUSES = [
    "DRAFT", "PENDING_APPROVAL", "APPROVED", "EMAIL_SENT", "SUPPLIER_REPLIED", 
    "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED", "DELAY_EXPECTED"
];

const isStatusPostApproval = (status) => {
    const approvedIndex = PO_STATUSES.indexOf("APPROVED");
    const statusIndex = PO_STATUSES.indexOf(status);
    return statusIndex >= approvedIndex;
};

export function ApprovalModal({ poId, isOpen, onOpenChange, onPoApproved, onPoRejected }) {
    const [po, setPo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isEmailView, setIsEmailView] = useState(false);
    const [emailDraft, setEmailDraft] = useState({ subject: '', body: '' });
    const [pdfUrl, setPdfUrl] = useState('');

    useEffect(() => {
        if (isOpen && poId) {
            fetchPoDetails();
        } else {
            setIsEmailView(false);
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

    const generatePdfBlob = () => {
        const doc = new jsPDF();
        doc.text(`Purchase Order #${po.poId}`, 14, 22);
        doc.autoTable({
            startY: 30,
            head: [['Product', 'SKU', 'Qty', 'Unit Cost', 'Total']],
            body: po.items.map(item => [
                item.productName,
                item.sku,
                item.orderedQty,
                `$${item.unitCost.toFixed(2)}`,
                `$${(item.orderedQty * item.unitCost).toFixed(2)}`
            ]),
        });
        doc.text(`Grand Total: $${po.totalAmount.toLocaleString()}`, 14, doc.autoTable.previous.finalY + 10);
        return doc.output('blob');
    };

    const handleApprove = async () => {
        try {
            const approvalResponse = await api.post(`/api/core/purchase-orders/${poId}/approve`);
            const { presignedUrl, po: updatedPo } = approvalResponse.data;

            const pdfBlob = generatePdfBlob();
            await api.put(presignedUrl, pdfBlob, {
                headers: { 'Content-Type': 'application/pdf' }
            });

            await api.patch(`/api/core/purchase-orders/${poId}`, { pdfUrl: updatedPo.pdfUrl });

            onPoApproved();
            prepareAndShowEmailView(pdfBlob);
        } catch (err) {
            console.error("Failed to approve PO", err);
        }
    };

    const prepareAndShowEmailView = async (pdfBlob) => {
        setLoading(true);
        try {
            const emailRes = await api.get(`/api/core/purchase-orders/${poId}/email-draft`);
            setEmailDraft(emailRes.data);
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
            setIsEmailView(true);
        } catch (err) {
            console.error("Failed to prepare email view", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        try {
            await api.post(`/api/core/purchase-orders/${poId}/send`, emailDraft);
            onPoApproved();
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to send email", err);
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
            onPoApproved();
            fetchPoDetails();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const renderDetailsView = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                <div className="md:col-span-1 space-y-6">
                    <Card><CardHeader className="pb-2"><CardTitle className="text-base">Details</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex items-center"><Hash className="h-4 w-4 mr-2 text-gray-400" /> PO Number: <span className="font-semibold ml-auto">{po.poId}</span></div>
                            <div className="flex items-center"><User className="h-4 w-4 mr-2 text-gray-400" /> Buyer: <span className="font-semibold ml-auto">{po.buyerEmail}</span></div>
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
                                    <SelectContent>{PO_STATUSES.map(status => (<SelectItem key={status} value={status}>{status}</SelectItem>))}</SelectContent>
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
                    <Button variant="destructive" onClick={handleReject} disabled={po?.status !== 'PENDING_APPROVAL'}><X className="mr-2 h-4 w-4" /> Reject</Button>
                    <Button onClick={handleApprove} disabled={po?.status !== 'PENDING_APPROVAL'}><Check className="mr-2 h-4 w-4" /> Approve</Button>
                </div>
            </DialogFooter>
        </>
    );

    const renderEmailView = () => (
        <>
            <div className="grid grid-cols-2 gap-6 h-full py-4">
                <div className="space-y-4"><Input value={emailDraft.subject} onChange={(e) => setEmailDraft(d => ({ ...d, subject: e.target.value }))} /><Textarea value={emailDraft.body} onChange={(e) => setEmailDraft(d => ({ ...d, body: e.target.value }))} className="h-full" /></div>
                <div><iframe src={pdfUrl} className="w-full h-full border rounded-md" /></div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEmailView(false)}>Back</Button>
                <Button onClick={handleSendEmail}><Send className="mr-2 h-4 w-4" /> Send Email</Button>
            </DialogFooter>
        </>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{isEmailView ? "Send Purchase Order" : "Purchase Order Details"}</DialogTitle>
                    <DialogDescription>
                        {isEmailView ? `Sending PO #${po?.poId} to ${po?.supplierName}` : `Review and manage PO #${po?.poId}`}
                    </DialogDescription>
                </DialogHeader>
                {loading ? <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div> : (isEmailView ? renderEmailView() : renderDetailsView())}
            </DialogContent>
        </Dialog>
    );
}
