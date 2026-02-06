import { useState, useEffect } from 'react';
import { X, Send, Loader2, Sparkles, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import api from '../../services/api';

export default function SendEmailModal({ po, isOpen, onClose, onEmailSent }) {
    if (!isOpen) return null;

    // --- State ---
    const [subject, setSubject] = useState(`Purchase Order #${po.id} - SupplyMind`);
    const [body, setBody] = useState('');
    const [isCertified, setIsCertified] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(true);
    const [sending, setSending] = useState(false);
    const [generatingAi, setGeneratingAi] = useState(false);

    // --- 1. Load PDF Preview (Securely via Blob) ---
    useEffect(() => {
        let activeUrl = null;

        const fetchPdf = async () => {
            setLoadingPdf(true);
            try {
                // Fetch as BLOB to include Auth Headers
                const response = await api.get(`/api/core/purchase-orders/${po.id}/preview-pdf`, {
                    params: { signed: isCertified }, // Toggle based on checkbox
                    responseType: 'blob'
                });

                // Create local URL for the iframe
                const blob = new Blob([response.data], { type: 'application/pdf' });
                activeUrl = URL.createObjectURL(blob);
                setPdfUrl(activeUrl);
            } catch (error) {
                console.error("Failed to load PDF preview", error);
            } finally {
                setLoadingPdf(false);
            }
        };

        if (isOpen) {
            fetchPdf();
        }

        // Cleanup to prevent memory leaks
        return () => {
            if (activeUrl) URL.revokeObjectURL(activeUrl);
        };
    }, [isOpen, po.id, isCertified]); // Re-run when "Certified" changes

    // --- 2. AI Draft Logic ---
    const handleAiDraft = async () => {
        setGeneratingAi(true);
        // Simulate AI delay for now (or call real endpoint if ready)
        setTimeout(() => {
            const itemsList = po.purchaseOrderItems?.map(i => `- ${i.product.name} (x${i.quantity})`).join('\n') || '';
            const draft = `Dear ${po.supplier?.name || 'Supplier'},

Please find attached Purchase Order #${po.id} for the following items:

${itemsList}

We expect delivery by [Date]. Please confirm receipt of this order.

Best regards,
${po.buyer?.firstName || 'Procurement'} ${po.buyer?.lastName || 'Officer'}
SupplyMind Inc.`;
            setBody(draft);
            setGeneratingAi(false);
        }, 800);
    };

    // --- 3. Send Logic ---
    const handleSend = async () => {
        setSending(true);
        try {
            await api.post(`/api/core/purchase-orders/${po.id}/send`, {
                subject,
                body,
                addSignature: isCertified // <--- The Important Flag
            });
            onEmailSent();
            onClose();
        } catch (error) {
            console.error("Failed to send", error);
            alert("Failed to send email.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* --- LEFT PANE: Compose (40%) --- */}
                <div className="w-[40%] flex flex-col border-r bg-slate-50/50">
                    <div className="p-4 border-b bg-white flex justify-between items-center">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Send size={18} className="text-blue-600" />
                            Send Order
                        </h3>
                        <Button variant="ghost" size="icon" onClick={onClose}><X size={18} /></Button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto space-y-5">
                        {/* Header Inputs */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">To</label>
                                <Input value={po.supplier?.contactEmail || 'No Email'} disabled className="bg-slate-100" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Subject</label>
                                <Input value={subject} onChange={e => setSubject(e.target.value)} />
                            </div>
                        </div>

                        {/* Body & AI Button */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Message</label>
                                <button
                                    onClick={handleAiDraft}
                                    disabled={generatingAi || body.length > 10}
                                    className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium transition-colors disabled:opacity-50"
                                >
                                    <Sparkles size={12} />
                                    {generatingAi ? 'Writing...' : 'Draft with AI'}
                                </button>
                            </div>
                            <textarea
                                className="flex min-h-[200px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 resize-none"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Write your message..."
                            />
                        </div>

                        {/* Compliance Checkbox */}
                        <div className={`p-4 rounded-lg border transition-all ${isCertified ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="certify"
                                    checked={isCertified}
                                    onCheckedChange={setIsCertified}
                                />
                                <div className="space-y-1">
                                    <label htmlFor="certify" className="text-sm font-semibold leading-none cursor-pointer">
                                        I certify this transaction
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                        Checking this will digitally sign the PDF and authorize the payment request.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t bg-white flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button
                            onClick={handleSend}
                            disabled={!isCertified || sending || !po.supplier?.contactEmail}
                            className={`${isCertified ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed text-slate-500'}`}
                        >
                            {sending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send className="mr-2" size={16} />}
                            Send Email
                        </Button>
                    </div>
                </div>

                {/* --- RIGHT PANE: PDF Preview (60%) --- */}
                <div className="w-[60%] bg-slate-100 flex flex-col relative">
                    <div className="h-10 bg-slate-200 border-b flex items-center px-4 text-xs font-medium text-slate-500 justify-between">
                        <span className="flex items-center gap-2"><FileText size={14}/> PDF Preview</span>
                        {loadingPdf && <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Updating...</span>}
                    </div>

                    <div className="flex-1 p-8 overflow-hidden flex items-center justify-center">
                        {/* The Iframe Container - Simulates a Paper Sheet */}
                        <div className="bg-white shadow-xl w-full h-full max-w-[500px] transition-all duration-300 relative">
                            {loadingPdf && (
                                <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-blue-600" size={32} />
                                </div>
                            )}
                            {pdfUrl ? (
                                <iframe
                                    src={pdfUrl}
                                    className="w-full h-full"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">
                                    Failed to load PDF
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}