import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../../services/api';
import { POCard } from './POCard';

export function PurchaseOrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/core/purchase-orders');
            setOrders(res.data.content || []);
        } catch (err) {
            console.error("Failed to load POs", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {orders.map(po => (
                <POCard key={po.poId} po={po} />
            ))}
        </div>
    );
}
