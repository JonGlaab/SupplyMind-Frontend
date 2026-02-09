import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { ArrowLeft, History, Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const WarehouseTransactions = () => {
    const { warehouseId } = useParams();
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchTransactions();
    }, [warehouseId, page]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/core/inventory/transactions`, {
                params: { warehouseId, page, size: 15 }
            });
            setTransactions(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load transactions", err);
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <History className="text-slate-400" /> Transaction Log
                    </h1>
                    <p className="text-sm text-slate-500">History of stock movements for this facility</p>
                </div>
            </div>

            <Card className="shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b text-[11px] font-bold uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4 text-center">Quantity</th>
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Reference</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan="5" className="py-20 text-center text-slate-400">No transactions recorded.</td></tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr key={tx.transactionId} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4">
                                        <Badge className={
                                            tx.transactionType === 'RECEIVING' ? 'bg-green-50 text-green-700' :
                                                tx.transactionType === 'ADJUSTMENT' ? 'bg-amber-50 text-amber-700' :
                                                    'bg-blue-50 text-blue-700'
                                        }>
                                            {tx.transactionType === 'RECEIVING' ? <ArrowDownLeft size={12} className="mr-1"/> : <ArrowUpRight size={12} className="mr-1"/>}
                                            {tx.transactionType}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{tx.productName}</div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">{tx.sku}</div>
                                    </td>
                                    <td className={`px-6 py-4 text-center font-bold ${tx.qtyChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.qtyChange > 0 ? `+${tx.qtyChange}` : tx.qtyChange}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(tx.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                                        {tx.referenceId || 'N/A'}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>

                    {/* Pagination Footer */}
                    <div className="flex justify-between items-center p-4 border-t bg-slate-50/50">
                        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                            Previous
                        </Button>
                        <span className="text-xs text-slate-500 font-medium">
                                Page {page + 1} of {totalPages}
                            </span>
                        <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WarehouseTransactions;