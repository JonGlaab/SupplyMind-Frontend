import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
import { ArrowLeft, Search, FileText, Calendar, CheckCircle } from 'lucide-react';
import ViewProcessedOrderModal from './ViewProcessedOrderModal.jsx';

const WarehouseOrdersReceived = () => {
    const { warehouseId } = useParams();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const res = await api.get('/api/core/purchase-orders', {
                    params: {
                        warehouseId,
                        status: 'COMPLETED'
                    }
                });
                setOrders(res.data.content || res.data || []);
            } catch (err) {
                console.error("Failed to fetch receiving history", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [warehouseId]);

    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const filteredOrders = orders.filter(order =>
        order.poId?.toString().includes(searchTerm) ||
        order.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Receiving History</h1>
                        <p className="text-muted-foreground">Log of all processed inbound shipments</p>
                    </div>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search PO# or Supplier..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <Card className="shadow-lg border-none overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="text-emerald-500" size={20} />
                        Completed Orders
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase">PO Number</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Supplier</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase text-center">Items</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Received Date</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan="5" className="p-10 text-center text-muted-foreground">Loading history...</td></tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr><td colSpan="5" className="p-10 text-center text-muted-foreground">No completed orders found.</td></tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.poId} className="hover:bg-muted/20 transition-colors">
                                    <td className="p-4 font-bold text-blue-600">#{order.poId}</td>
                                    <td className="p-4">
                                        <div className="font-medium">{order.supplierName}</div>
                                        <div className="text-xs text-muted-foreground">{order.warehouseName}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <Badge variant="outline">{order.items?.length || 0} Lines</Badge>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar size={14} />
                                            {order.receivedAt ? new Date(order.receivedAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenModal(order)}
                                        >
                                            <FileText size={16} className="mr-2" /> Details
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
            <ViewProcessedOrderModal
                order={selectedOrder}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default WarehouseOrdersReceived;