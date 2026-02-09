import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { POCard } from '../procurementofficer/components/POCard';
import { ApprovalModal } from './components/ApprovalModal';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';

export function PurchaseOrderApproval() {
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedPoId, setSelectedPoId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/core/purchase-orders?size=100');
            setAllOrders(res.data.content || []);
        } catch (err) {
            console.error("Failed to load purchase orders:", err);
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

    const pendingOrders = allOrders.filter(po => po.status === 'PENDING_APPROVAL');

    const renderOrderList = (orders, emptyMessage) => {
        if (loading) {
            return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
        }
        if (orders.length === 0) {
            return <p className="text-muted-foreground text-center py-10">{emptyMessage}</p>;
        }
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {orders.map(po => (
                    <POCard key={po.poId} po={po} onViewDetails={() => handleViewDetails(po.poId)} />
                ))}
            </div>
        );
    };

    return (
        <>
            <div className="space-y-6 p-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Purchase Order Management</h1>
                        <p className="text-muted-foreground mt-1">Approve, reject, and track purchase orders.</p>
                    </div>
                </div>

                <Tabs defaultValue="pending">
                    <TabsList>
                        <TabsTrigger value="pending">
                            Pending Approval ({pendingOrders.length})
                        </TabsTrigger>
                        <TabsTrigger value="all">
                            All Purchase Orders ({allOrders.length})
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pending">
                        {renderOrderList(pendingOrders, "No purchase orders are currently pending approval.")}
                    </TabsContent>
                    <TabsContent value="all">
                        {renderOrderList(allOrders, "No purchase orders found.")}
                    </TabsContent>
                </Tabs>
            </div>

            <ApprovalModal
                poId={selectedPoId}
                isOpen={isModalOpen}
                onOpenChange={handleModalClose}
                onPoApproved={handlePoChange}
                onPoRejected={handlePoChange}
            />
        </>
    );
}

export default PurchaseOrderApproval;