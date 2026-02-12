import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import {
    ArrowLeft,
    FileSearch,
    Search,
    Clock,
    AlertCircle
} from 'lucide-react';

const TransferHistory = () => {
    const { warehouseId } = useParams();
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [warehouseName, setWarehouseName] = useState("");

    useEffect(() => {
        if (!warehouseId) return;

        const fetchTransactionData = async () => {
            try {
                setLoading(true);
                // Fetching transactions and warehouse details in parallel
                const [txRes, whRes] = await Promise.allSettled([
                    api.get(`/api/core/inventory-transactions`, {
                        params: { warehouseId: warehouseId }
                    }),
                    api.get(`/api/core/warehouses/${warehouseId}`)
                ]);

                if (txRes.status === 'fulfilled') {
                    setTransactions(txRes.value.data.content || txRes.value.data || []);
                }

                if (whRes.status === 'fulfilled') {
                    setWarehouseName(whRes.value.data.locationName);
                }
            } catch (err) {
                console.error("Error loading transaction data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactionData();
    }, [warehouseId]);

    // Safety check for missing ID
    if (!warehouseId) {
        return (
            <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-4">
                <AlertCircle size={48} className="text-slate-300" />
                <p className="font-medium">No warehouse location selected.</p>
                <Button onClick={() => navigate('/staff/dashboard')}>Return to Dashboard</Button>
            </div>
        );
    }

    const filteredTransactions = transactions.filter(tx =>
        (tx.productName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Transaction History</h1>
                        <p className="text-sm text-slate-500 font-medium">
                            {warehouseName || `Warehouse ID: ${warehouseId}`}
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        className="w-full md:w-72 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        placeholder="Filter by product or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Timestamp</th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Product Info</th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Type</th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider text-right">Adjustment</th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Reference</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {loading ? (
                        <tr><td colSpan="5" className="py-20 text-center text-slate-400 animate-pulse">Retrieving audit logs...</td></tr>
                    ) : filteredTransactions.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="py-24 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <FileSearch className="text-slate-200" size={48} />
                                    <p className="text-slate-400 font-medium text-sm">No transaction history found for this location.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        filteredTransactions.map((tx) => (
                            <tr key={tx.transactionId} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Clock size={14} className="text-slate-400" />
                                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-slate-800">{tx.productName || 'Unknown Product'}</div>
                                    <div className="text-[10px] text-slate-400 font-mono tracking-widest">{tx.sku || 'NO-SKU'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">
                                        {tx.transactionType?.replace('_', ' ') || 'OTHER'}
                                    </Badge>
                                </td>
                                <td className={`px-6 py-4 text-right font-bold text-sm ${tx.quantityChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {tx.quantityChange >= 0 ? '+' : ''}{tx.quantityChange}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs text-slate-500 font-medium">
                                        {tx.referenceId ? `Ref: #${tx.referenceId}` : 'Manual Entry'}
                                    </div>
                                    <div className="text-[10px] text-slate-400 uppercase">{tx.performedBy || 'System'}</div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransferHistory;