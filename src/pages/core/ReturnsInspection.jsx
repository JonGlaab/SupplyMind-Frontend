import { useState } from 'react'
import { AlertCircle, Plus, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Label } from '../../components/ui/label'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { Checkbox } from '../../components/ui/checkbox'

const returnsData = [
    {
        id: 1,
        rmaNumber: 'RMA-5001',
        customer: 'ABC Manufacturing',
        product: 'Industrial Motor X50',
        reason: 'Damaged in shipping',
        date: '2024-01-22',
        status: 'pending-inspection',
        itemCondition: null,
        action: null,
    },
    {
        id: 2,
        rmaNumber: 'RMA-5002',
        customer: 'Tech Solutions Inc',
        product: 'Control Unit Pro',
        reason: 'Defective',
        date: '2024-01-21',
        status: 'inspected',
        itemCondition: 'damaged',
        action: 'return-to-vendor',
    },
    {
        id: 3,
        rmaNumber: 'RMA-5003',
        customer: 'Industrial Services Ltd',
        product: 'Pressure Relief Valve',
        reason: 'Wrong item shipped',
        date: '2024-01-20',
        status: 'completed',
        itemCondition: 'new',
        action: 'restock',
    },
]

const getStatusBadge = (status) => {
    const statusConfig = {
        'pending-inspection': { label: 'Pending Inspection', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
        'inspected': { label: 'Inspected', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
        'completed': { label: 'Completed', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
    }

    const config = statusConfig[status] || statusConfig['pending-inspection']
    return (
        <Badge variant="outline" className={config.className}>
            {config.label}
        </Badge>
    )
}

function InspectionCard({ returnItem, onUpdate }) {
    const [condition, setCondition] = useState(returnItem.itemCondition || '')
    const [action, setAction] = useState(returnItem.action || '')
    const [issueRefund, setIssueRefund] = useState(false)

    const handleSave = () => {
        onUpdate(returnItem.id, {
            itemCondition: condition,
            action: action,
            status: 'completed'
        })
    }

    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{returnItem.rmaNumber}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{returnItem.customer}</p>
                    </div>
                    <div className="text-right">
                        {getStatusBadge(returnItem.status)}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Return Request Details */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-semibold text-foreground">Product</Label>
                            <p className="text-sm text-foreground mt-1">{returnItem.product}</p>
                        </div>

                        <div>
                            <Label className="text-sm font-semibold text-foreground">Reason for Return</Label>
                            <p className="text-sm text-foreground mt-1">{returnItem.reason}</p>
                        </div>

                        <div>
                            <Label className="text-sm font-semibold text-foreground">Date Submitted</Label>
                            <p className="text-sm text-foreground mt-1">{returnItem.date}</p>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg border border-border">
                            <div className="flex gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-foreground">High-value return requiring inspection before processing.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Inspection Form */}
                    <div className="space-y-6 border-l border-border pl-6">
                        <div>
                            <Label className="text-sm font-semibold text-foreground mb-3 block">Item Condition</Label>
                            <RadioGroup value={condition} onValueChange={setCondition}>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="new" id={`new-${returnItem.id}`} />
                                    <Label htmlFor={`new-${returnItem.id}`} className="font-normal cursor-pointer">New</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="open-box" id={`open-box-${returnItem.id}`} />
                                    <Label htmlFor={`open-box-${returnItem.id}`} className="font-normal cursor-pointer">Open Box</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="damaged" id={`damaged-${returnItem.id}`} />
                                    <Label htmlFor={`damaged-${returnItem.id}`} className="font-normal cursor-pointer">Damaged</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div>
                            <Label className="text-sm font-semibold text-foreground mb-3 block">Recommended Action</Label>
                            <RadioGroup value={action} onValueChange={setAction}>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="restock" id={`restock-${returnItem.id}`} />
                                    <Label htmlFor={`restock-${returnItem.id}`} className="font-normal cursor-pointer">Restock</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="return-to-vendor" id={`rtv-${returnItem.id}`} />
                                    <Label htmlFor={`rtv-${returnItem.id}`} className="font-normal cursor-pointer">Return to Vendor</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="scrap" id={`scrap-${returnItem.id}`} />
                                    <Label htmlFor={`scrap-${returnItem.id}`} className="font-normal cursor-pointer">Scrap</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                            <Checkbox
                                id={`refund-${returnItem.id}`}
                                checked={issueRefund}
                                onCheckedChange={(checked) => setIssueRefund(!!checked)}
                            />
                            <Label htmlFor={`refund-${returnItem.id}`} className="font-normal cursor-pointer text-sm">
                                Issue Refund (Triggers Stripe refund)
                            </Label>
                        </div>

                        <Button onClick={handleSave} className="w-full">
                            Save Inspection
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function ReturnsInspection() {
    const [returns, setReturns] = useState(returnsData)

    const handleUpdate = (id, data) => {
        setReturns(returns.map(r => r.id === id ? { ...r, ...data } : r))
    }

    const pendingCount = returns.filter(r => r.status === 'pending-inspection').length
    const completedCount = returns.filter(r => r.status === 'completed').length

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Returns & Inspection</h1>
                    <p className="text-muted-foreground mt-1">Process customer returns and manage reverse logistics</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Return
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Total Returns</p>
                        <p className="text-2xl font-bold text-foreground mt-2">{returns.length}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Pending Inspection</p>
                        <p className="text-2xl font-bold text-foreground mt-2">{pendingCount}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold text-foreground mt-2">{completedCount}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                {returns.map(returnItem => (
                    <InspectionCard
                        key={returnItem.id}
                        returnItem={returnItem}
                        onUpdate={handleUpdate}
                    />
                ))}
            </div>
        </div>
    )
}