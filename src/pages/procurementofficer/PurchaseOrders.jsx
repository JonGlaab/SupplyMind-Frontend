import { useState, useEffect } from 'react';
import { Loader2, Package } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { POCard } from './components/POCard';
import { PurchaseOrderDetailModal } from './components/PurchaseOrderDetailModal';

export function PurchaseOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPoId, setSelectedPoId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/core/purchase-orders');
            setOrders(res.data.content || []);
        } catch (err) {
            console.error("Failed to load POs", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (poId) => {
        setSelectedPoId(poId);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedPoId(null);
    };

    const handlePoChange = () => {
        fetchOrders();
    };

    const filteredPOs = (status) => {
        if (status === 'all') return orders;
        return orders.filter(po => po.status === status);
    };

    if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <>
            <div className="space-y-6 p-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
                        <p className="text-muted-foreground mt-1">Real-time procurement tracking</p>
                    </div>
                    <Button className="bg-blue-600"><Package size={18} className="mr-2"/> New Order</Button>
                </div>

                <Tabs defaultValue="all">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="DRAFT">Draft</TabsTrigger>
                        <TabsTrigger value="PENDING_APPROVAL">Pending</TabsTrigger>
                        <TabsTrigger value="APPROVED">Approved</TabsTrigger>
                        <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredPOs('all').map(po => <POCard key={po.poId} po={po} onViewDetails={() => handleViewDetails(po.poId)} />)}
                        </div>
                    </TabsContent>
                    <TabsContent value="DRAFT">
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredPOs('DRAFT').map(po => <POCard key={po.poId} po={po} onViewDetails={() => handleViewDetails(po.poId)} />)}
                        </div>
                    </TabsContent>
                    <TabsContent value="PENDING_APPROVAL">
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredPOs('PENDING_APPROVAL').map(po => <POCard key={po.poId} po={po} onViewDetails={() => handleViewDetails(po.poId)} />)}
                        </div>
                    </TabsContent>
                    <TabsContent value="APPROVED">
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredPOs('APPROVED').map(po => <POCard key={po.poId} po={po} onViewDetails={() => handleViewDetails(po.poId)} />)}
                        </div>
                    </TabsContent>
                    <TabsContent value="COMPLETED">
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredPOs('COMPLETED').map(po => <POCard key={po.poId} po={po} onViewDetails={() => handleViewDetails(po.poId)} />)}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <PurchaseOrderDetailModal
                poId={selectedPoId}
                isOpen={isModalOpen}
                onOpenChange={handleModalClose}
                onPoDeleted={handlePoChange}
                onPoUpdated={handlePoChange}
            />
        </>
    );
}
