import { useState } from 'react'
import { Check, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'

const poData = [
    {
        id: 1,
        poNumber: 'PO-1284',
        supplier: 'Industrial Supply Co',
        date: '2024-01-15',
        total: 45000,
        status: 'paid',
        step: 4,
        paymentMethod: 'Card ****4242',
        items: [
            { name: 'Industrial Motor X50', qty: 50, received: 50 },
            { name: 'Hydraulic Pump Series A', qty: 30, received: 30 },
        ],
    },
    {
        id: 2,
        poNumber: 'PO-1285',
        supplier: 'Tech Components Ltd',
        date: '2024-01-18',
        total: 28500,
        status: 'pending-payment',
        step: 3,
        paymentMethod: null,
        items: [
            { name: 'Control Unit Pro', qty: 75, received: 0 },
            { name: 'Temperature Sensor Pro', qty: 120, received: 0 },
        ],
    },
    {
        id: 3,
        poNumber: 'PO-1286',
        supplier: 'Valve Systems Inc',
        date: '2024-01-20',
        total: 12000,
        status: 'partial',
        step: 2,
        paymentMethod: null,
        items: [
            { name: 'Pressure Relief Valve', qty: 100, received: 60 },
        ],
    },
]

const steps = ['Draft', 'Sent', 'Payment Pending', 'Paid', 'Received']

const getStatusBadge = (status) => {
    const statusConfig = {
        'paid': { label: 'Paid', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
        'pending-payment': { label: 'Payment Pending', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
        'partial': { label: 'Partial Receipt', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
    }

    const config = statusConfig[status] || statusConfig['pending-payment']
    return (
        <Badge variant="outline" className={config.className}>
            {config.label}
        </Badge>
    )
}

function POCard({ po }) {
    const [receivedQty, setReceivedQty] = useState({})

    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>{po.poNumber}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{po.supplier}</p>
                    </div>
                    <div className="text-right">
                        {getStatusBadge(po.status)}
                        <p className="text-sm font-semibold text-foreground mt-2">${po.total.toLocaleString()}</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Progress Steps */}
                <div>
                    <p className="text-sm font-semibold text-foreground mb-3">Order Progress</p>
                    <div className="space-y-2">
                        <Progress value={(po.step / steps.length) * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                    {idx < po.step ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                    ) : idx === po.step ? (
                                        <Clock className="w-4 h-4 text-yellow-600" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border border-border" />
                                    )}
                                    <span className={idx <= po.step ? 'text-foreground' : ''}>{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payment Section */}
                <div className="border-t border-border pt-6">
                    <p className="text-sm font-semibold text-foreground mb-3">Payment Status</p>
                    {po.status === 'paid' ? (
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
                            <Check className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">Paid via {po.paymentMethod}</p>
                            </div>
                        </div>
                    ) : (
                        <Button className="w-full bg-primary hover:bg-primary/90">
                            Pay with Stripe
                        </Button>
                    )}
                </div>

                {/* Receiving Section */}
                <div className="border-t border-border pt-6">
                    <p className="text-sm font-semibold text-foreground mb-4">Receiving</p>
                    <div className="space-y-3">
                        {po.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Ordered: {item.qty} units
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min="0"
                                        max={item.qty}
                                        value={receivedQty[idx] !== undefined ? receivedQty[idx] : item.received}
                                        onChange={(e) => setReceivedQty({
                                            ...receivedQty,
                                            [idx]: parseInt(e.target.value) || 0
                                        })}
                                        className="w-16 text-center"
                                        placeholder="Qty"
                                    />
                                    <span className="text-sm text-muted-foreground">/ {item.qty}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button className="w-full mt-4">
                        Finalize Receipt
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export function PurchaseOrders() {
    const [activeTab, setActiveTab] = useState('all')

    const filteredPOs = activeTab === 'all'
        ? poData
        : poData.filter(po => po.status === activeTab)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
                <p className="text-muted-foreground mt-1">Manage orders, payments, and receiving</p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All Orders</TabsTrigger>
                    <TabsTrigger value="paid">Paid</TabsTrigger>
                    <TabsTrigger value="pending-payment">Payment Pending</TabsTrigger>
                    <TabsTrigger value="partial">Partial Receipt</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6 space-y-4">
                    {filteredPOs.map(po => (
                        <POCard key={po.id} po={po} />
                    ))}
                </TabsContent>
            </Tabs>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total POs</p>
                                <p className="text-2xl font-bold text-foreground mt-2">{poData.length}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-primary/30" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold text-foreground mt-2">
                                    ${poData.reduce((sum, po) => sum + po.total, 0).toLocaleString()}
                                </p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-primary/30" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Awaiting Payment</p>
                                <p className="text-2xl font-bold text-foreground mt-2">
                                    ${poData
                                    .filter(po => po.status === 'pending-payment')
                                    .reduce((sum, po) => sum + po.total, 0)
                                    .toLocaleString()}
                                </p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-red-600/30" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}