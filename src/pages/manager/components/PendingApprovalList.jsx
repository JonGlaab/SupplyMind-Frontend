import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../../services/api';
import { POCard } from '../../procurementofficer/components/POCard';
import { ApprovalModal } from './ApprovalModal'; 

export function PendingApprovalList({ refreshKey }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPoId, setSelectedPoId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchPendingOrders();
    }, [refreshKey]);

    const fetchPendingOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/core/purchase-orders?status=PENDING_APPROVAL');
            setOrders(res.data.content || []);
        } catch (err) {
            console.error("Failed to load pending POs", err);
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
        fetchPendingOrders();
    };

    if (loading) {
        return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {orders.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center">No purchase orders are currently pending approval.</p>
                ) : (
                    orders.map(po => (
                        <POCard key={po.poId} po={po} onViewDetails={() => handleViewDetails(po.poId)} />
                    ))
                )}
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
