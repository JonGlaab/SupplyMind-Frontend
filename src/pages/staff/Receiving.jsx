import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
    const [searchParams] = useSearchParams();
    const warehouseId = searchParams.get('wh');

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [warehouseName, setWarehouseName] = useState('');

    useEffect(() => {
        if (warehouseId) {
            fetchIncomingOrders();
        }
    }, [warehouseId]);

    if (!warehouseId) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold">No Warehouse Selected</h2>
                <p className="text-slate-500 mb-4">Please select a location from the dashboard to manage receiving.</p>
                <Button onClick={() => navigate('/warehouse/dashboard')}>Return to Dashboard</Button>
            </div>
        );
    }

    const fetchIncomingOrders = async () => {
        try {
            setLoading(true);

            const [ordersRes, warehouseRes] = await Promise.allSettled([
                api.get('/api/core/purchase-orders', {
                    params: {
                        statuses: 'SHIPPED,DELIVERED',
                        warehouseId: warehouseId
                    }
                }),
                api.get(`/api/core/warehouses/${warehouseId}`)
            ]);

            if (ordersRes.status === 'fulfilled') {
                const data = ordersRes.value.data.content || ordersRes.value.data || [];
                setOrders(data);
            } else {
                console.error("Orders fetch failed", ordersRes.reason);
                setOrders([]);
            }

            if (warehouseRes.status === 'fulfilled') {
                setWarehouseName(warehouseRes.value.data.locationName);
            } else if (ordersRes.status === 'fulfilled' && ordersRes.value.data.length > 0) {
                setWarehouseName(ordersRes.value.data[0].warehouseName);
            }

        } catch (err) {
            console.error("Critical error in receiving fetch", err);
        } finally {
            setLoading(false);
        }
    };

    const onTheWay = orders.filter(o => o.status === 'SHIPPED');
    const readyToProcess = orders.filter(o => o.status === 'DELIVERED');

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Inbound Receiving: <span className="text-blue-600">{warehouseName || `ID #${warehouseId}`}</span>
                    </h1>
                    <p className="text-slate-500">Managing arrivals for this location.</p>
                </div>
                <Link to={`/warehouses/${warehouseId}/receiving-history`}>
                    <Button variant="outline" className="flex items-center gap-2">
                        <History size={18} /> View Receiving History
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-emerald-50 border-emerald-100 shadow-none">
                    <CardContent className="pt-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-600">Arrived / Pending</p>
                            <h3 className="text-2xl font-bold text-emerald-900">{readyToProcess.length}</h3>
                        </div>
                        <PackageCheck className="text-emerald-200" size={40} />
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100 shadow-none">
                    <CardContent className="pt-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600">On the Way</p>
                            <h3 className="text-2xl font-bold text-blue-900">{onTheWay.length}</h3>
                        </div>
                        <Truck className="text-blue-200" size={40} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold">
                        <CheckCircle2 className="text-emerald-500" size={20} />
                        <h2>Ready to Process</h2>
                    </div>
                    {loading ? <Loader2 className="animate-spin" /> : (
                        readyToProcess.length > 0 ? (
                            readyToProcess.map(order => (
                                <OrderCard key={order.poId} order={order} variant="process" navigate={navigate} />
                            ))
                        ) : (
                            <EmptyState message="No orders currently pending verification." />
                        )
                    )}
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold">
                        <Clock className="text-blue-500" size={20} />
                        <h2>On the Way</h2>
                    </div>
                    {loading ? <Loader2 className="animate-spin" /> : (
                        onTheWay.length > 0 ? (
                            onTheWay.map(order => (
                                <OrderCard key={order.poId} order={order} variant="tracking" navigate={navigate} />
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

const OrderCard = ({ order, variant, navigate }) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">PO #{order.poId}</span>
                    <Badge variant={variant === 'process' ? 'default' : 'secondary'} className="text-[10px]">
                        {order.status}
                    </Badge>
                </div>
                <p className="text-xs text-slate-500 italic">Expected at: {order.warehouseName || "Main Hub"}</p>
                <p className="text-sm text-slate-600">{order.items?.length || 0} items from {order.supplierName}</p>
            </div>
            <Button
                onClick={() => order.status === 'DELIVERED' && navigate(`/receiving/process/${order.poId}`)}
                variant={variant === 'process' ? 'default' : 'ghost'}
                size="sm"
                disabled={order.status !== 'DELIVERED'}
                className={variant === 'process' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
                {variant === 'process' ? 'Receive Now' : 'In Transit'} <ArrowRight size={14} className="ml-2" />
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