import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import {
    Search, Plus, Truck, Mail, Phone, MapPin, Package,
    MoreVertical, Trash2, X, Save, ArrowLeft
} from 'lucide-react';
import toast from "react-hot-toast";

const SupplierList = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        contactEmail: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await api.get('/api/core/suppliers');
            setSuppliers(res.data.content || []);
        } catch (err) {
            console.error("Fetch error", err);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/core/suppliers', formData);
            setIsAdding(false);
            setFormData({ name: '', contactEmail: '', phone: '', address: '' });
            fetchSuppliers();
        } catch (err) {
            toast.error("Check if phone number is too long (max 20) or name is missing.");
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
                        <CardTitle>Register New Supplier</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Company Name *</label>
                                <Input
                                    required
                                    placeholder="e.g. Global Logistics Inc."
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Contact Email</label>
                                    <Input
                                        type="email"
                                        placeholder="contact@company.com"
                                        value={formData.contactEmail}
                                        onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                                    <Input
                                        placeholder="+1 555-0123"
                                        maxLength={20}
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Office Address</label>
                                <Input
                                    placeholder="123 Supply Lane, Suite 100"
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1 bg-blue-600">
                                    <Save size={18} className="mr-2" /> Save Supplier
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                                    Cancel
                                </Button>
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
                <h1 className="text-2xl font-bold">Suppliers</h1>
                <Button className="bg-blue-600" onClick={() => setIsAdding(true)}>
                    <Plus size={18} className="mr-2" /> Add Supplier
                </Button>
            </div>

            <Card className="border-none shadow-md">
                <CardHeader>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                        <Input
                            placeholder="Filter suppliers..."
                            className="pl-10"
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-4 text-xs font-bold uppercase text-slate-500">Name</th>
                                <th className="p-4 text-xs font-bold uppercase text-slate-500">Contact</th>
                                <th className="p-4 text-xs font-bold uppercase text-slate-500">Address</th>
                                <th className="p-4 text-xs font-bold uppercase text-slate-500">Products</th>
                                <th className="p-4 text-xs font-bold uppercase text-slate-500 text-right">Delete</th>
                            </tr>
                            </thead>
                            <tbody>
                            {suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                                <tr key={s.supplierId} className="border-b hover:bg-slate-50/50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Truck size={18} className="text-blue-500" />
                                            <span className="font-semibold">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 space-y-1">
                                        <div className="text-sm flex items-center gap-2"><Mail size={14}/> {s.contactEmail || 'N/A'}</div>
                                        <div className="text-sm flex items-center gap-2"><Phone size={14}/> {s.phone || 'N/A'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-slate-500 flex items-center gap-2">
                                            <MapPin size={14}/> {s.address || '---'}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/procurement/suppliers/${s.supplierId}/products`)}
                                        >
                                            <Package size={16} className="mr-2" /> View Products
                                        </Button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={async () => {
                                                if(confirm("Delete this supplier?")) {
                                                    await api.delete(`/api/core/suppliers/${s.supplierId}`);
                                                    fetchSuppliers();
                                                }
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SupplierList;