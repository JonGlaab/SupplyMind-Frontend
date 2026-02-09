import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
    ClipboardCheck, History, AlertCircle,
    ChevronRight, Loader2, Search, Filter
} from 'lucide-react';
import { Input } from '../../components/ui/input';

const ReturnRequestOversight = () => {
    const navigate = useNavigate();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('PENDING'); // 'PENDING' or 'HISTORY'

    useEffect(() => {
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            // Assuming your backend supports filtering by status or you filter client-side
            const res = await api.get('/api/returns/list'); // Adjust path based on your list endpoint
            setReturns(res.data.content || res.data || []);
        } catch (err) {
            console.error("Failed to fetch returns", err);
        } finally {
            setLoading(false);
        }
    };

    const pendingReturns = returns.filter(r => r.status === 'REQUESTED');
    const historyReturns = returns.filter(r => r.status !== 'REQUESTED');

    const displayList = viewMode === 'PENDING' ? pendingReturns : historyReturns;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Return Authorization</h1>
                    <p className="text-slate-500">Review and approve inventory return requests from staff.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('PENDING')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'PENDING' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        Pending Approval ({pendingReturns.length})
                    </button>
                    <button
                        onClick={() => setViewMode('HISTORY')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'HISTORY' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <Card className="shadow-sm border-slate-200 overflow-hidden">
                <CardHeader className="bg-white border-b py-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input placeholder="Search by PO ID or Reason..." className="pl-9 h-9" />
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter size={16} /> Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b text-[11px] font-bold uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Return ID</th>
                                <th className="px-6 py-4">Purchase Order</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Requested By</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td>
                                </tr>
                            ) : displayList.length > 0 ? (
                                displayList.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">RET-{item.id}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">PO #{item.po?.poId || item.poId}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 truncate max-w-[200px]">{item.reason}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{item.requestedBy || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusVariant(item.status)} className="text-[10px]">
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => navigate(`/manager/returns-inspection/${item.id}`)}
                                            >
                                                {viewMode === 'PENDING' ? 'Review' : 'Details'} <ChevronRight size={14} className="ml-1" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <ClipboardCheck size={32} className="opacity-20" />
                                            <p>No {viewMode.toLowerCase()} return requests found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Helper for Badge styling
const getStatusVariant = (status) => {
    switch (status) {
        case 'REQUESTED': return 'warning';
        case 'APPROVED': return 'info';
        case 'RECEIVED': return 'success';
        case 'REJECTED': return 'destructive';
        default: return 'secondary';
    }
};

export default ReturnRequestOversight;