import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft, FileText, CheckCircle, Package, Calendar, User } from 'lucide-react';
import PurchaseOrderApprovalModal from "./PurchaseOrderApprovalModal.jsx";

const PurchaseOrderView = () => {
    const { poId } = useParams();
    const navigate = useNavigate();
    const [po, setPo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

    const userRole = localStorage.getItem('userRole'); // MANAGER or ADMIN

    useEffect(() => {
        fetchPODetails();
    }, [poId]);

    const fetchPODetails = async () => {
        try {
            const res = await api.get(`/api/core/purchase-orders/${poId}`);
            setPo(res.data);
        } catch (err) {
            console.error("Error fetching PO:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Purchase Order...</div>;
    if (!po) return <div className="p-10 text-center text-red-500">PO not found.</div>;

    // Check if button should be visible
    const canApprove = userRole === 'MANAGER' && po.status === 'PENDING_APPROVAL';

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2" size={18} /> Back to List
                </Button>

                {canApprove && (
                    <Button
                        onClick={() => setIsApproveModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <CheckCircle className="mr-2" size={18} /> Approve Order
                    </Button>
                )}
            </div>

            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader className="border-b">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl font-bold">PO #{po.poId}</CardTitle>
                                <p className="text-sm text-slate-500 mt-1">Status:
                                    <Badge className="ml-2 uppercase">{po.status}</Badge>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase">Total Amount</p>
                                <p className="text-2xl font-black text-blue-600">
                                    ${po.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <Package className="text-slate-400" size={20} />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Supplier</p>
                                <p className="font-medium">{po.supplierName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="text-slate-400" size={20} />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Expected Delivery</p>
                                <p className="font-medium">
                                    {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'TBD'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-sm">Originator Details</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <User className="text-slate-400" size={18} />
                            <p className="text-sm">Buyer: <span className="font-semibold">{po.buyerName}</span></p>
                        </div>
                        <div className="flex items-center gap-3">
                            <FileText className="text-slate-400" size={18} />
                            <p className="text-sm">Warehouse: <span className="font-semibold">{po.warehouseName}</span></p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Line Items Table */}
            <Card>
                <CardHeader className="border-b">
                    <CardTitle className="text-lg">Line Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b">
                        <tr>
                            <th className="px-6 py-4">Item Description</th>
                            <th className="px-6 py-4">Qty Ordered</th>
                            <th className="px-6 py-4">Unit Cost</th>
                            <th className="px-6 py-4 text-right">Subtotal</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {po.items?.map((item) => (
                            <tr key={item.poItemId} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-medium">{item.productName}</td>
                                <td className="px-6 py-4">{item.orderedQty}</td>
                                <td className="px-6 py-4">${item.unitCost?.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right font-bold">
                                    ${(item.orderedQty * item.unitCost).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <PurchaseOrderApprovalModal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                onSuccess={fetchPODetails}
                poId={po.poId}
            />
        </div>
    );
};

export default PurchaseOrderView;