import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import {
    Truck, PackageCheck, History, Search,
    ArrowRight, Loader2, Clock, CheckCircle2
} from 'lucide-react';

const Receiving = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        fetchIncomingOrders();
    }, []);

    const fetchIncomingOrders = async () => {
        try {
            setLoading(true);
            // Assuming your backend has a filtered endpoint for active inbound orders
            const res = await api.get('/api/core/orders?status=SHIPPED,ARRIVED');
            setOrders(res.data.content || res.data || []);
        } catch (err) {
            console.error("Error fetching receiving list", err);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic for the two tabs
    const onTheWay = orders.filter(o => o.status === 'SHIPPED');
    const readyToProcess = orders.filter(o => o.status === 'ARRIVED');

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inbound Receiving</h1>
                    <p className="text-slate-500">Manage incoming shipments and verify inventory arrival.</p>
                </div>
                <Link to="/receiving/history">
                    <Button variant="outline" className="flex items-center gap-2">
                        <History size={18} /> View Receiving History
                    </Button>
                </Link>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-100 shadow-none">
                    <CardContent className="pt-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600">On the Way</p>
                            <h3 className="text-2xl font-bold text-blue-900">{onTheWay.length}</h3>
                        </div>
                        <Truck className="text-blue-200" size={40} />
                    </CardContent>
                </Card>
                <Card className="bg-amber-50 border-amber-100 shadow-none">
                    <CardContent className="pt-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-600">Arrived / Pending</p>
                            <h3 className="text-2xl font-bold text-amber-900">{readyToProcess.length}</h3>
                        </div>
                        <PackageCheck className="text-amber-200" size={40} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Section 1: Ready to Process (ARRIVED) */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold">
                        <CheckCircle2 className="text-emerald-500" size={20} />
                        <h2>Ready to Process</h2>
                    </div>
                    {loading ? <Loader2 className="animate-spin" /> : (
                        readyToProcess.length > 0 ? (
                            readyToProcess.map(order => (
                                <OrderCard key={order.id} order={order} variant="process" navigate={navigate} />
                            ))
                        ) : (
                            <EmptyState message="No orders currently pending verification." />
                        )
                    )}
                </section>

                {/* Section 2: On the Way (SHIPPED) */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold">
                        <Clock className="text-blue-500" size={20} />
                        <h2>On the Way</h2>
                    </div>
                    {loading ? <Loader2 className="animate-spin" /> : (
                        onTheWay.length > 0 ? (
                            onTheWay.map(order => (
                                <OrderCard key={order.id} order={order} variant="tracking" navigate={navigate} />
                            ))
                        ) : (
                            <EmptyState message="No shipments currently in transit." />
                        )
                    )}
                </section>
            </div>
        </div>
    );
};

// Sub-component for individual Order Cards
const OrderCard = ({ order, variant, navigate }) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">PO #{order.id}</span>
                    <Badge variant={variant === 'process' ? 'default' : 'secondary'} className="text-[10px]">
                        {order.status}
                    </Badge>
                </div>
                <p className="text-xs text-slate-500 italic">Expected at: {order.warehouseName || "Main Hub"}</p>
                <p className="text-sm text-slate-600">{order.itemsCount || 0} items from {order.vendorName}</p>
            </div>
            <Button
                onClick={() => navigate(`/receiving/process/${order.id}`)}
                variant={variant === 'process' ? 'default' : 'ghost'}
                size="sm"
                className={variant === 'process' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
                {variant === 'process' ? 'Receive Now' : 'Details'} <ArrowRight size={14} className="ml-2" />
            </Button>
        </CardContent>
    </Card>
);

const EmptyState = ({ message }) => (
    <div className="border-2 border-dashed border-slate-100 rounded-lg py-12 text-center">
        <p className="text-slate-400 text-sm">{message}</p>
    </div>
);

export default Receiving;