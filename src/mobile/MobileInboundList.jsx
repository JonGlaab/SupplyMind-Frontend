import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Truck, PackageCheck, ChevronRight, Calendar, Loader2, MapPin } from 'lucide-react';

const MobileInboundList = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('DELIVERED');

    // Retrieve the context
    const currentWarehouse = JSON.parse(localStorage.getItem('currentWarehouse'));

    useEffect(() => {
        if (!currentWarehouse) {
            navigate('/mobile/home');
            return;
        }

        const fetchOrders = async () => {
            setLoading(true);
            try {
                // Filter by the stored Warehouse ID
                const res = await api.get('/api/core/purchase-orders', {
                    params: {
                        statuses: 'SHIPPED,DELIVERED',
                        warehouseId: currentWarehouse.warehouseId
                    }
                });
                const data = res.data.content || res.data || [];
                setOrders(data);
            } catch (err) {
                console.error("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [navigate]);

    const filteredOrders = orders.filter(o => o.status === filter);

    return (
        <div className="flex flex-col h-full bg-slate-950 text-white">
            <div className="p-4 bg-slate-900 border-b border-slate-800">
                <button onClick={() => navigate('/mobile/home')} className="flex items-center gap-2 text-slate-400 mb-4">
                    <ArrowLeft size={18} /> <span>Back</span>
                </button>
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Inbound</h1>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
                        <MapPin size={12} /> {currentWarehouse?.locationName}
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <button onClick={() => setFilter('DELIVERED')} className={`flex-1 py-3 rounded-xl text-xs font-bold ${filter === 'DELIVERED' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        Ready ({orders.filter(o=>o.status==='DELIVERED').length})
                    </button>
                    <button onClick={() => setFilter('SHIPPED')} className={`flex-1 py-3 rounded-xl text-xs font-bold ${filter === 'SHIPPED' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        En Route ({orders.filter(o=>o.status==='SHIPPED').length})
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                {loading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-blue-500"/></div> :
                    filteredOrders.length === 0 ? <div className="text-center py-10 text-slate-500">No orders found.</div> :
                        filteredOrders.map(po => (
                            <button
                                key={po.poId}
                                onClick={() => filter === 'DELIVERED' ? navigate(`/mobile/process/${po.poId}`) : null}
                                className={`w-full text-left p-4 rounded-2xl border flex items-center gap-4 ${filter === 'DELIVERED' ? 'bg-slate-900 border-slate-800' : 'bg-slate-900/50 border-slate-800/50 opacity-70'}`}
                            >
                                <div className={`p-3 rounded-xl ${filter === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    {filter === 'DELIVERED' ? <PackageCheck size={20} /> : <Truck size={20} />}
                                </div>
                                <div className="flex-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">PO #{po.poId}</span>
                                    <h3 className="text-white font-bold">{po.supplierName}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                        <Calendar size={12} /> {new Date(po.orderDate).toLocaleDateString()}
                                    </div>
                                </div>
                                {filter === 'DELIVERED' && <ChevronRight className="text-slate-600" />}
                            </button>
                        ))}
            </div>
        </div>
    );
};

export default MobileInboundList;