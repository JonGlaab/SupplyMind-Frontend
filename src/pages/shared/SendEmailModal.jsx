import { useState, useEffect } from 'react';
import { X, Send, Loader2, Sparkles, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Checkbox } from '../../components/ui/checkbox.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import api from '../../services/api.js';

export default function SendEmailModal({ po, isOpen, onClose, onEmailSent, supplierEmail }) {
    // --- All Hooks must be at the top level ---
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isCertified, setIsCertified] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(true);
    const [sending, setSending] = useState(false);
    const [generatingAi, setGeneratingAi] = useState(false);
    const [error, setError] = useState('');

    // --- Effect to initialize state when 'po' is available ---
    useEffect(() => {
        if (po) {
            setSubject(`Purchase Order #${po.poId || po.id} - SupplyMind`);
            setBody('');
            setIsCertified(false);
            setPdfUrl(null);
            setError('');
        }
    }, [po]);

    // --- Effect to load PDF preview ---
    useEffect(() => {
        if (!isOpen || !po) {
            return;
        }

        const currentPoId = po.poId || po.id;
        let activeUrl = null;

        const fetchPdf = async () => {
            setLoadingPdf(true);
            setError('');
            try {
                const response = await api.get(`/api/core/purchase-orders/${currentPoId}/preview-pdf`, {
                    params: { includeSignature: isCertified },
                    responseType: 'blob'
                });
                const blob = new Blob([response.data], { type: 'application/pdf' });
                activeUrl = URL.createObjectURL(blob);
                setPdfUrl(activeUrl);
            } catch (err) {
                console.error("Failed to load PDF preview", err);
                setError('Failed to load PDF preview. It might not be generated yet.');
            } finally {
                setLoadingPdf(false);
            }
        };

        fetchPdf();

        return () => {
            if (activeUrl) {
                URL.revokeObjectURL(activeUrl);
            }
        };
    }, [isOpen, po, isCertified]);

    if (!isOpen || !po) {
        return null;
    }

    const currentPoId = po.poId || po.id;
    const items = po.items || [];

    const handleAiDraft = async () => {
        setGeneratingAi(true);
        try {
            const itemsList = items.map(i => `- ${i.productName} (x${i.orderedQty})`).join('\n');
            const draft = `Dear ${po.supplierName},\n\nPlease find attached Purchase Order #${currentPoId} for the following items:\n\n${itemsList}\n\nWe expect delivery by [Date]. Please confirm receipt of this order.\n\nBest regards,\n${po.buyerEmail || 'Manager'}\nSupplyMind Inc.`;
            setBody(draft);
        } finally {
            setGeneratingAi(false);
        }
    };

    const handleSend = async () => {
        setSending(true);
        setError('');
        try {
            const formattedBody = `<div>${body.replace(/\n/g, '<br>')}</div>`;
            await api.post(`/api/core/purchase-orders/${currentPoId}/send`, {
                subject,
                body: formattedBody,
                addSignature: isCertified
            });
            onEmailSent();
            onClose();
        } catch (err) {
            console.error("Failed to send email.", err);
            setError(err.response?.data?.message || "Failed to send email.");
            alert("Failed to send email.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Compose Pane */}
                <div className="w-[45%] flex flex-col border-r bg-slate-50/50">
                    <div className="p-4 border-b bg-white flex justify-between items-center">
                        <h3 className="font-bold text-lg flex items-center gap-2">Send Order</h3>
                        <Button variant="ghost" size="icon" onClick={onClose}><X size={18} /></Button>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto space-y-4">
                        {error && <div className="bg-red-100 text-red-700 text-sm p-3 rounded-md">{error}</div>}
                        <div className="space-y-1">
                            <Label className="text-xs uppercase">To</Label>
                            <Input value={supplierEmail || ''} disabled className="bg-slate-100" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs uppercase">Subject</Label>
                            <Input value={subject} onChange={e => setSubject(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-xs uppercase">Message</Label>
                                <button onClick={handleAiDraft} className="text-xs flex items-center gap-1 text-purple-600 font-medium">
                                    {generatingAi ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                    {generatingAi ? 'Writing...' : 'Draft with AI'}
                                </button>
                            </div>
                            <Textarea
                                className="min-h-[250px] bg-white text-sm"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Edit your message here..."
                            />
                        </div>
                        <div className={`p-4 rounded-lg border ${isCertified ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="certify"
                                    checked={isCertified}
                                    onChange={(e) => setIsCertified(e.target.checked)}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="certify" className="text-sm font-semibold cursor-pointer">I certify this transaction</Label>
                                    <p className="text-xs text-muted-foreground">Checking this will digitally sign the PDF.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t bg-white flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSend} disabled={!isCertified || sending} className={isCertified ? 'bg-blue-600' : 'bg-slate-300'}>
                            {sending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send size={16} className="mr-2" />} Send Email
                        </Button>
                    </div>
                </div>
                {/* PDF Pane */}
                <div className="w-[55%] bg-slate-100 flex flex-col relative">
                    <div className="h-10 bg-slate-200 border-b flex items-center px-4 text-xs font-medium text-slate-500">
                        <FileText size={14} className="mr-2"/> Signed PDF Preview
                    </div>
                    <div className="flex-1 p-4">
                        {loadingPdf ? (
                            <div className="h-full flex items-center justify-center text-sm text-slate-500">
                                <Loader2 className="animate-spin mr-2" /> Loading PDF Preview...
                            </div>
                        ) : pdfUrl ? (
                            <iframe src={pdfUrl} className="w-full h-full rounded shadow-lg bg-white" title="PDF Preview" />
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-red-500">
                                Could not load PDF.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
