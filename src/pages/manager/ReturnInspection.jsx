import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Loader2, Check, X, ArrowLeft, Hash, User, ClipboardList, Save } from 'lucide-react';
import toast from "react-hot-toast";

export function ReturnInspection() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [request, setRequest] = useState(null);
    const [approvalData, setApprovalData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchReturnDetails();
    }, [id]);

    const fetchReturnDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/core/returns/${id}`);
            setRequest(res.data);
            // Initialize the editable rows
            setApprovalData(res.data.items.map(item => ({
                returnLineId: item.id,
                qtyApproved: item.qtyReturnRequested,
            })));
        } catch (err) {
            console.error("Failed to fetch return details", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprovalDecision = async (decision) => {
        setIsSubmitting(true);
        try {
            const payload = {
                // This is the "Sign Off" - capturing the manager's action
                approvedBy: "Manager Name", // Ideally request.approvedBy or from Auth
                items: approvalData.map(item => ({
                    returnLineId: item.returnLineId,
                    qtyApproved: decision === 'APPROVED' ? parseInt(item.qtyApproved) : 0,
                    restockFee: 0
                }))
            };

            await api.post(`/api/core/returns/${id}/approve`, payload);
            toast.error(`Return ${decision === 'APPROVED' ? 'Authorized' : 'Rejected'} successfully.`);
            navigate('/manager/returns');
        } catch (err) {
            toast.error("Error updating return: " + (err.response?.data?.message || "Server Error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Returns
                </Button>
                <div className="flex gap-3">
                    {request.status === 'REQUESTED' && (
                        <>
                            <Button
                                variant="destructive"
                                onClick={() => handleApprovalDecision('REJECTED')}
                                disabled={isSubmitting}
                            >
                                <X className="mr-2 h-4 w-4" /> Reject Request
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprovalDecision('APPROVED')}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                                Authorize Sign-off
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base">Return Header</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-3">
                            <div className="flex items-center text-slate-600"><Hash className="h-4 w-4 mr-2" /> Return ID: <span className="font-bold ml-auto">RET-{request.id}</span></div>
                            <div className="flex items-center text-slate-600"><ClipboardList className="h-4 w-4 mr-2" /> Original PO: <span className="font-bold ml-auto">#{request.po?.id}</span></div>
                            <div className="flex items-center text-slate-600"><User className="h-4 w-4 mr-2" /> Requestor: <span className="font-bold ml-auto">{request.requestedBy}</span></div>
                            <div className="pt-2 flex justify-center"><Badge variant="outline" className="px-4 py-1">{request.status}</Badge></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base">Approval Reason</CardTitle></CardHeader>
                        <CardContent className="text-sm text-slate-600 italic">
                            "{request.reason}"
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card>
                        <CardHeader><CardTitle>Line Item Verification</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-center">Requested</TableHead>
                                        <TableHead className="w-32">Approve Qty</TableHead>
                                        <TableHead>Staff Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {request.items.map((item, idx) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <p className="font-medium text-blue-600">Item #{item.poItem?.id}</p>
                                                <p className="text-[10px] text-slate-400">Unit Cost: ${item.unitCost?.toFixed(2)}</p>
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">{item.qtyReturnRequested}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    className="h-8"
                                                    value={approvalData[idx]?.qtyApproved}
                                                    onChange={(e) => {
                                                        const updated = [...approvalData];
                                                        updated[idx].qtyApproved = e.target.value;
                                                        setApprovalData(updated);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500 italic max-w-[150px] truncate">
                                                {item.conditionNotes || "N/A"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default ReturnInspection;