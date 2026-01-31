import { useState } from 'react'
import { Plus, Barcode, Download, MoreVertical, Filter } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
 } from '../../components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
 } from '../../components/ui/select'

// Mock Data
const inventoryData = [
    { id: 1, name: 'Industrial Motor X50', sku: 'SKU-001', warehouse: 'East Coast', available: 245, forecast: 180, status: 'in-stock' },
    { id: 2, name: 'Hydraulic Pump Series A', sku: 'SKU-002', warehouse: 'West Coast', available: 89, forecast: 120, status: 'reorder-soon' },
    { id: 3, name: 'Control Unit Pro', sku: 'SKU-003', warehouse: 'Central Hub', available: 0, forecast: 45, status: 'stockout' },
    { id: 4, name: 'Pressure Relief Valve', sku: 'SKU-004', warehouse: 'East Coast', available: 512, forecast: 300, status: 'in-stock' },
    { id: 5, name: 'Temperature Sensor Pro', sku: 'SKU-005', warehouse: 'West Coast', available: 145, forecast: 200, status: 'reorder-soon' },
    { id: 6, name: 'Flow Meter Digital', sku: 'SKU-006', warehouse: 'Central Hub', available: 32, forecast: 75, status: 'reorder-soon' },
]

const getStatusBadge = (status) => {
    const statusConfig = {
        'in-stock': { label: 'In Stock', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
        'reorder-soon': { label: 'Reorder Soon', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
        'stockout': { label: 'Stockout', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
    }

    const config = statusConfig[status] || statusConfig['in-stock']
    return (
        <Badge variant="outline" className={config.className}>
            {config.label}
        </Badge>
    )
}

export function InventoryView() {
    const [warehouse, setWarehouse] = useState('all')
    const [sortBy, setSortBy] = useState('name')

    // Filtering Logic
    const filteredData = warehouse === 'all'
        ? inventoryData
        : inventoryData.filter(item => item.warehouse === warehouse)

    // Sorting Logic
    const sortedData = [...filteredData].sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'available') return b.available - a.available
        if (sortBy === 'status') return a.status.localeCompare(b.status)
        return 0
    })

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Inventory Level</h1>
                    <p className="text-muted-foreground mt-1">Manage products across warehouses</p>
                </div>
                <div className="flex gap-2">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                    <Button variant="outline">
                        <Barcode className="w-4 h-4 mr-2" />
                        Scan Barcode
                    </Button>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Select value={warehouse} onValueChange={setWarehouse}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Select Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Warehouses</SelectItem>
                        <SelectItem value="East Coast">East Coast</SelectItem>
                        <SelectItem value="West Coast">West Coast</SelectItem>
                        <SelectItem value="Central Hub">Central Hub</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name">Sort by Name</SelectItem>
                        <SelectItem value="available">Sort by Available</SelectItem>
                        <SelectItem value="status">Sort by Status</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                </Button>
            </div>

            {/* Inventory Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left py-3 px-4 font-semibold text-foreground">Product</th>
                                <th className="text-left py-3 px-4 font-semibold text-foreground">SKU</th>
                                <th className="text-left py-3 px-4 font-semibold text-foreground">Location</th>
                                <th className="text-right py-3 px-4 font-semibold text-foreground">Available</th>
                                <th className="text-right py-3 px-4 font-semibold text-foreground">30-Day Forecast</th>
                                <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                                <th className="text-center py-3 px-4 font-semibold text-foreground">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedData.map((item) => (
                                <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                    <td className="py-3 px-4">
                                        <p className="font-medium text-foreground">{item.name}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">{item.sku}</code>
                                    </td>
                                    <td className="py-3 px-4 text-muted-foreground">{item.warehouse}</td>
                                    <td className="py-3 px-4 text-right font-semibold text-foreground">{item.available}</td>
                                    <td className="py-3 px-4 text-right text-muted-foreground">{item.forecast}</td>
                                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                                    <td className="py-3 px-4 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Transfer Stock</DropdownMenuItem>
                                                <DropdownMenuItem>Adjust Quantity</DropdownMenuItem>
                                                <DropdownMenuItem>Print Label</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {sortedData.length} of {inventoryData.length} products
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" disabled>Previous</Button>
                    <Button variant="outline">Next</Button>
                </div>
            </div>
        </div>
    )
}