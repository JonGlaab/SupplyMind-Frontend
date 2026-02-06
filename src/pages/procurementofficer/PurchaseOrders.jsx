import { useState, useEffect } from 'react'
import { Loader2, Package } from 'lucide-react'
import api from '../../services/api' // Your axios instance
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { POCard } from './components/POCard'

export function PurchaseOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/core/purchase-orders');
            setOrders(res.data.content || res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load POs", err);
            setLoading(false);
        }
    };

    const filteredPOs = activeTab === 'all'
        ? orders
        : orders.filter(po => po.status === activeTab)

    if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
                    <p className="text-muted-foreground mt-1">Real-time procurement tracking</p>
                </div>
                <Button className="bg-blue-600"><Package size={18} className="mr-2"/> New Order</Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-100">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="PENDING_PAYMENT">Pending</TabsTrigger>
                    <TabsTrigger value="PAID">Paid</TabsTrigger>
                    <TabsTrigger value="RECEIVED">Received</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredPOs.map(po => (
                        <POCard key={po.id} po={po} />
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    )
}
