import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../../services/api';
import { POCard } from './POCard';
import { PurchaseOrderDetailModal } from './PurchaseOrderDetailModal';

export function PurchaseOrderList({ refreshKey }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPoId, setSelectedPoId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [refreshKey]);

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
        fetchOrders(); // Refetch all POs when one is updated or deleted
    };

    if (loading) {
        return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {orders.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center">No purchase orders found.</p>
                ) : (
                    orders.map(po => (
                        <POCard key={po.poId} po={po} onViewDetails={() => handleViewDetails(po.poId)} />
                    ))
                )}
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
