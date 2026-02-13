import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import api from '../../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { AddToPODialog } from './AddToPODialog';

export function LowStockTable({ onPoChange }) {
    const [lowStockItems, setLowStockItems] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ warehouseId: '', supplierId: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchInitialData();
        fetchLowStockItems();
    }, []);

    useEffect(() => {
        fetchLowStockItems();
    }, [filters]);

    const fetchInitialData = async () => {
        try {
            const [warehouseRes, supplierRes] = await Promise.all([
                api.get('/api/core/warehouses', { params: { size: 200 } }),
                api.get('/api/core/suppliers', { params: { size: 200 } })
            ]);
            setWarehouses(warehouseRes.data.content || []);
            setSuppliers(supplierRes.data.content || []);
        } catch (err) {
            console.error("Failed to load initial data", err);
        }
    };

    const fetchLowStockItems = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.warehouseId) params.append('warehouseId', filters.warehouseId);
            if (filters.supplierId) params.append('supplierId', filters.supplierId);

            const res = await api.get(`/api/core/inventory/low-stock?${params.toString()}`);
            setLowStockItems(res.data.content || []);
        } catch (err) {
            console.error("Failed to load low stock items", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value === 'all' ? '' : value }));
    };

    const handleAddToPO = (item) => {
        setSelectedItem(item);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setSelectedItem(null);
    };

    const handleItemAdded = () => {
        fetchLowStockItems();
        onPoChange(); // Trigger a refresh in the parent component
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Low Stock Alerts</CardTitle>
                    <div className="flex gap-4 mt-4">
                        <Select onValueChange={(value) => handleFilterChange('warehouseId', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Warehouse" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Warehouses</SelectItem>
                                {warehouses.filter(w => w.warehouseId).map(w => <SelectItem key={`wh-${w.warehouseId}`} value={String(w.warehouseId)}>{w.locationName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(value) => handleFilterChange('supplierId', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Suppliers</SelectItem>
                                {suppliers.filter(s => s.supplierId).map(s => <SelectItem key={`sup-${s.supplierId}`} value={String(s.supplierId)}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Warehouse</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Current Qty</TableHead>
                                <TableHead>Min. Qty</TableHead>
                                <TableHead>Max. Qty</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan="7" className="text-center">Loading...</TableCell></TableRow>
                            ) : lowStockItems.length === 0 ? (
                                <TableRow><TableCell colSpan="7" className="text-center">No low stock items.</TableCell></TableRow>
                            ) : (
                                lowStockItems.map(item => (
                                    <TableRow key={item.inventoryId}>
                                        <TableCell>{item.productName}</TableCell>
                                        <TableCell>{item.warehouseName}</TableCell>
                                        <TableCell>{item.supplierName || 'N/A'}</TableCell>
                                        <TableCell className="text-red-600 font-bold">{item.qtyOnHand}</TableCell>
                                        <TableCell>{item.reorderPoint}</TableCell>
                                        <TableCell>{item.maxStockLevel}</TableCell>
                                        <TableCell>
                                            <Button size="sm" onClick={() => handleAddToPO(item)}>
                                                <PlusCircle size={16} className="mr-2" />
                                                Add to PO
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AddToPODialog
                isOpen={isDialogOpen}
                onOpenChange={handleDialogClose}
                item={selectedItem}
                onAdded={handleItemAdded}
            />
        </>
    );
}