import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api.js';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Clock, Search, FileSearch } from 'lucide-react';

const TransferHistory = () => {
    const { warehouseId } = useParams();
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [warehouseName, setWarehouseName] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchHistory = useCallback(async () => {
        if (!warehouseId) return;
        try {
            setLoading(true);
            const [txRes, whRes] = await Promise.allSettled([
                api.get(`/api/core/inventory/transactions`, { params: { warehouseId } }),
                api.get(`/api/core/warehouses/${warehouseId}`)
            ]);

            if (txRes.status === 'fulfilled') {
                setTransactions(txRes.value.data.content || txRes.value.data || []);
            }
            if (whRes.status === 'fulfilled') {
                setWarehouseName(whRes.value.data.locationName);
            }
        } catch (err) {
            console.error("Error loading history", err);
        } finally {
            setLoading(false);
        }
    }, [warehouseId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const filteredTransactions = transactions.filter(tx =>
        (tx.productName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 text-foreground">
            <header className="mb-10 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full shadow-sm">
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Warehouse History</h1>
                        <p className="text-sm font-medium text-muted-foreground">{warehouseName || `Location ID: ${warehouseId}`}</p>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-end">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            className="pl-10"
                            placeholder="Filter by product or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="shadow-lg border-none overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="text-xl">Inventory Movement Log</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase text-center w-24">Type</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Product Info</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase text-center">Adjustment</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Date</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Reference</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center text-muted-foreground animate-pulse">Syncing logs...</td></tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-24 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <FileSearch size={48} />
                                            <p className="font-medium">No movement recorded for this location.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.transactionId || tx.id} className="border-b hover:bg-muted/30 transition">
                                        <td className="p-4 text-center">
                                            {/* Inline logic for the Badge */}
                                            <Badge
                                                variant={tx.type === 'OUT' ? 'destructive' : 'default'}
                                                className={`uppercase text-[10px] ${
                                                    tx.type === 'OUT' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                                }`}
                                            >
                                                {tx.type}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-sm">{tx.productName}</div>
                                            <div className="text-[10px] text-muted-foreground font-mono">{tx.sku}</div>
                                        </td>
                                        <td className={`p-4 text-center font-bold ${tx.type === 'OUT' ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {tx.type === 'OUT' ? `-${tx.quantity}` : `+${tx.quantity}`}
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">
                                            {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="p-4 text-xs font-mono">
                                            {tx.referenceId ? `#${tx.referenceId}` : 'Manual'}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TransferHistory;