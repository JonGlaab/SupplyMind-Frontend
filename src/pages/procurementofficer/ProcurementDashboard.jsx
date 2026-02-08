import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { LowStockTable } from './components/LowStockTable';
import { PurchaseOrderList } from './components/PurchaseOrderList';

export function ProcurementDashboard() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handlePurchaseOrderChange = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Procurement Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Manage low stock and purchase orders.</p>
                </div>
            </div>

            <Tabs defaultValue="low-stock">
                <TabsList className="bg-slate-100">
                    <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                    <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
                </TabsList>

                <TabsContent value="low-stock" className="mt-6">
                    <LowStockTable onPoChange={handlePurchaseOrderChange} />
                </TabsContent>
                <TabsContent value="purchase-orders" className="mt-6">
                    <PurchaseOrderList refreshKey={refreshKey} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
