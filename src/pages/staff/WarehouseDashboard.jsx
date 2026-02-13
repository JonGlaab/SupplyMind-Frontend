import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Truck, History, ArrowLeftRight, RotateCcw, ClipboardList } from 'lucide-react';

const WarehouseDashboard = () => {
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWhId, setSelectedWhId] = useState('');

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await api.get('/api/core/warehouses');
                const data = res.data.content || res.data || [];
                setWarehouses(data);
                if (data.length > 0) setSelectedWhId(data[0].warehouseId.toString());
            } catch (err) {
                console.error("Error fetching warehouses", err);
            }
        };
        fetchWarehouses();
    }, []);

    const menuItems = [
        {
            title: "Inbound Receiving",
            description: "Process arriving shipments",
            icon: <Truck size={24} className="text-blue-600" />,
            path: `/staff/receiving?wh=${selectedWhId}`,
            color: "bg-blue-50"

        },
        {
            title: "Transfer Stock",
            description: "Move items to another location",
            icon: <ArrowLeftRight size={24} className="text-amber-600" />,
            path: `/staff/transfer?from=${selectedWhId}`,
            color: "bg-amber-50"
        }
        ,
        {
            title: "Return Request",
            description: "Send stock back to supplier",
            icon: <RotateCcw size={24} className="text-rose-600" />,
            path: `/staff/returnrequest?wh=${selectedWhId}`,
            color: "bg-rose-50"
        },
        {
            title: "Receiving History",
            description: `PO history for this site`,
            icon: <History size={24} className="text-emerald-600" />,
            path: `/staff/${selectedWhId}/receiving-history`,
            color: "bg-emerald-50"
        },
        {
            title: "Transfer History",
            description: `Audit logs for this site`,
            icon: <ClipboardList size={24} className="text-slate-600" />,
            path: `/staff/${selectedWhId}/transferhistory`,
            color: "bg-slate-50"
        },
        {
            title: "Warehouse Network",
            description: `Check inventory at selected warehouse`,
            icon: <ClipboardList size={24} className="text-slate-600" />,
            path: `/staff/${selectedWhId}/inventory`,
            color: "bg-slate-50"
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Operations Overview</h1>
                    <p className="text-slate-500">Manage movement for your assigned location.</p>
                </div>

                <div className="w-80 space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-400">Current Warehouse Location</label>
                    <Select onValueChange={setSelectedWhId} value={selectedWhId}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select Warehouse..." />
                        </SelectTrigger>
                        <SelectContent>
                            {warehouses.map(wh => (
                                <SelectItem key={wh.warehouseId} value={wh.warehouseId.toString()}>
                                    {wh.locationName} {wh.address ? `- ${wh.address}` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item, index) => (
                    <Card
                        key={index}
                        className={`transition-all border-slate-200 ${!selectedWhId ? 'opacity-50 grayscale pointer-events-none' : 'hover:shadow-md cursor-pointer group'}`}
                        onClick={() => navigate(item.path)}
                    >
                        <CardHeader className="pb-2">
                            <div className={`w-12 h-12 ${item.color} rounded flex items-center justify-center mb-2`}>
                                {item.icon}
                            </div>
                            <CardTitle className="text-xl">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-500 text-sm">{item.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default WarehouseDashboard;