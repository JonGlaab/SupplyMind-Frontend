import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import toast from 'react-hot-toast';

import {
    Search, Plus, Warehouse as WarehouseIcon, MapPin,
    ArrowLeft, Save, Loader2, BarChart3
} from 'lucide-react';
import {useNavigate} from "react-router-dom";

const WarehouseList = () => {
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const userRole = localStorage.getItem('userRole');

    const [formData, setFormData] = useState({
        locationName: '',
        address: '',
        capacity: ''
    });

    useEffect(() => {
        fetchWarehouses(page);
    }, [page]);

    const fetchWarehouses = async (currentPage) => {
        try {
            setLoading(true);
            const res = await api.get('/api/core/warehouses', {
                params: {
                    page: currentPage,
                    size: 10,
                }
            });
            setWarehouses(res.data.content || []);
            setTotalPages(res.data.totalPages);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch warehouses", err);
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, capacity: parseInt(formData.capacity) };
            await api.post('/api/core/warehouses', payload);
            setIsAdding(false);
            setFormData({ locationName: '', address: '', capacity: '' });
            fetchWarehouses(page);
            toast.success("Warehouse created successfully!");
        } catch (err) {
            toast.error("Error: Ensure Location Name is provided and Capacity is a number.");
        }
    };

    if (isAdding) {
        return (
            <div className="p-6 max-w-2xl mx-auto">
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="mb-4">
                    <ArrowLeft size={18} className="mr-2" /> Back to List
                </Button>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Register New Warehouse</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Location Name *</label>
                                <Input
                                    required
                                    placeholder="e.g. Central Hub - Berlin"
                                    value={formData.locationName}
                                    onChange={e => setFormData({...formData, locationName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Physical Address</label>
                                <Input
                                    placeholder="Industrial Park Str. 44, 10115 Berlin"
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Total Capacity (Units)</label>
                                <Input
                                    type="number"
                                    placeholder="50000"
                                    value={formData.capacity}
                                    onChange={e => setFormData({...formData, capacity: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3 pt-6">
                                <Button type="submit" className="flex-1 bg-blue-600">Save Warehouse</Button>
                                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Warehouse Network</h1>
                {userRole === 'MANAGER' && (
                    <Button className="bg-blue-600" onClick={() => setIsAdding(true)}>
                        <Plus size={18} className="mr-2" /> New Warehouse
                    </Button>
                )}
            </div>

            <Card className="shadow-md">
                <CardHeader>
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Search by location or address..."
                            className="pl-10"
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b text-[11px] font-bold uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Location Name</th>
                            <th className="px-6 py-4">Address</th>
                            <th className="px-6 py-4">Capacity</th>
                            <th className="px-6 py-4">Inventory</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="4" className="py-10 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                        ) : (
                            warehouses
                                .filter(w =>
                                    w.locationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    w.address?.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map(w => (
                                    <tr key={w.warehouseId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                                    <WarehouseIcon size={18} />
                                                </div>
                                                <span className="font-bold text-slate-900">{w.locationName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-slate-400" />
                                                {w.address || "No address set"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <BarChart3 size={14} className="text-slate-400" />
                                                {w.capacity?.toLocaleString() || "Unspecified"} units
                                            </div>
                                        </td>
                                        <td>
                                        <td className="px-6 py-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/staff/${w.warehouseId}/inventory`, { state: { name: w.locationName } })}
                                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                >
                                                    <BarChart3 size={16} className="mr-2" /> View Stock
                                                </Button>
                                        </td>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Badge className="bg-emerald-50 text-emerald-700">Online</Badge>
                                        </td>
                                    </tr>
                                ))
                        )}
                        </tbody>
                    </table>
                </CardContent>
                <div className="flex justify-between items-center p-4 border-t">
                    <Button
                        disabled={page === 0}
                        onClick={() => setPage(prev => prev - 1)}
                    >
                        Previous
                    </Button>
                        <span className="text-sm text-slate-500">
                            Page {page + 1} of {totalPages}
                        </span>
                    <Button
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(prev => prev + 1)}
                    >
                        Next
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default WarehouseList;