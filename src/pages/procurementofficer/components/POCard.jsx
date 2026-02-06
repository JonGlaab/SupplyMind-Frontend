import { Check, Clock, Landmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';

// Maps your DB Status strings to UI steps
const statusToStep = {
    'DRAFT': 1,
    'SENT': 2,
    'PENDING_PAYMENT': 3,
    'PAID': 4,
    'RECEIVED': 5
};
const steps = ['Draft', 'Sent', 'Payment Pending', 'Paid', 'Received'];

const getStatusBadge = (status) => {
    const statusConfig = {
        'PAID': { label: 'Paid', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
        'PENDING_PAYMENT': { label: 'Pending Payment', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
        'DRAFT': { label: 'Draft', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
        'RECEIVED': { label: 'Completed', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-slate-500/10' };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
};

export function POCard({ po }) {
    const currentStep = statusToStep[po.status] || 1;

    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle>PO #{po.poId}</CardTitle>
                            <Badge variant="secondary" className="text-[10px]">
                                {po.warehouseName || 'Main Warehouse'}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 font-medium text-blue-600">
                            {po.supplierName || 'Unknown Supplier'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                            Issued: {new Date(po.createdOn).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="text-right">
                        {getStatusBadge(po.status)}
                        <p className="text-lg font-bold text-foreground mt-2">
                            ${po.totalAmount?.toLocaleString() || '0.00'}
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Progress Steps */}
                <div>
                    <div className="space-y-2">
                        <Progress value={(currentStep / steps.length) * 100} className="h-2" />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                    {idx + 1 < currentStep ? (
                                        <Check className="w-3 h-3 text-green-600" />
                                    ) : idx + 1 === currentStep ? (
                                        <Clock className="w-3 h-3 text-yellow-600" />
                                    ) : (
                                        <div className="w-3 h-3 rounded-full border border-border" />
                                    )}
                                    <span className={idx + 1 <= currentStep ? 'font-bold text-slate-700' : ''}>{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Items from purchaseOrderItems Set */}
                <div className="border-t border-border pt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Order Items</p>
                    <div className="space-y-2">
                        {po.items?.map((item) => (
                            <div key={item.poItemId} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                                <span>{item.productName || 'Product'}</span>
                                <span className="font-mono font-bold">{item.orderedQty} units</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    {po.status === 'PENDING_PAYMENT' && (
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            <Landmark size={16} className="mr-2" /> Process Payment
                        </Button>
                    )}
                    <Button variant="outline" className="flex-1">
                        View Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
