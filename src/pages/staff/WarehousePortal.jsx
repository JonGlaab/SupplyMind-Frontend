import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Input } from '../../components/ui/input.jsx'
import {
    Search,
    PackageCheck,
    Truck,
    Barcode,
    ChevronRight,
    ClipboardList
} from 'lucide-react'

export function WarehousePortal() {
    const [search, setSearch] = useState('')

    // Mock data for Incoming Shipments
    const incomingOrders = [
        { id: 'PO-8821', vendor: 'Global Logistics', items: 12, status: 'In Transit', ETA: '2:00 PM' },
        { id: 'PO-8824', vendor: 'Apex Parts', items: 45, status: 'Docked', ETA: 'Now' },
    ]

    return (
        <div className="max-w-7xl mx-auto space-y-10 p-2"> {/* Added container margin */}

            {/* Header Section with extra spacing */}
            <div className="flex flex-col gap-6 border-b-2 border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-primary">WAREHOUSE RECEIVING</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Scan or select incoming shipments to process stock.</p>
                </div>

                <div className="relative w-full max-w-2xl">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search PO number or Vendor..."
                        className="pl-12 h-12 text-lg border-2 focus-visible:ring-primary shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Incoming Orders Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Truck className="text-primary h-6 w-6" />
                    <h2 className="text-xl font-bold italic uppercase tracking-wider">Expected Shipments</h2>
                </div>

                <div className="grid gap-6">
                    {incomingOrders.map((order) => (
                        <Card key={order.id} className="border-2 shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row items-stretch">
                                    {/* Status Bar - Vertical on Desktop */}
                                    <div className={`w-3 ${order.status === 'Docked' ? 'bg-success' : 'bg-warning'}`} />

                                    <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl font-black font-mono">{order.id}</span>
                                                <Badge variant={order.status === 'Docked' ? 'success' : 'secondary'} className="px-3">
                                                    {order.status}
                                                </Badge>
                                            </div>
                                            <p className="text-lg font-medium text-muted-foreground">{order.vendor}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-8 items-center text-sm font-semibold">
                                            <div className="flex flex-col">
                                                <span className="text-muted-foreground uppercase text-xs">Quantity</span>
                                                <span className="text-lg">{order.items} Units</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-muted-foreground uppercase text-xs">Scheduled</span>
                                                <span className="text-lg">{order.ETA}</span>
                                            </div>
                                            <Button size="lg" className="gap-2 font-bold px-8">
                                                Process Order <ChevronRight className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Quick Access SKU Reference */}
            <div className="pt-10 border-t-2 border-border">
                <div className="flex items-center gap-2 mb-6">
                    <Barcode className="text-primary h-6 w-6" />
                    <h2 className="text-xl font-bold italic uppercase tracking-wider">Fast SKU Look-up</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['A-101', 'A-102', 'B-201', 'C-305'].map((zone) => (
                        <Button key={zone} variant="outline" className="h-20 border-2 text-lg font-bold hover:bg-primary hover:text-white transition-all">
                            Zone {zone}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default WarehousePortal;