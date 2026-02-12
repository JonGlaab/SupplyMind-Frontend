import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';

const WarehouseTransferHistory = () => {
    // Static data for now to guarantee it loads
    const [transactions] = useState([
        { id: 1, type: 'IN', productName: 'Sample Item A', quantity: 50, timestamp: '2026-02-10 14:30', reference: 'PO-1001' },
        { id: 2, type: 'OUT', productName: 'Sample Item B', quantity: 12, timestamp: '2026-02-10 15:45', reference: 'SO-5002' },
    ]);

    return (
        <div className="p-8 text-foreground">
            <header className="mb-10 flex justify-between items-center max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight">Warehouse History</h1>
                <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-sm">
                    LOGS
                </div>
            </header>

            <div className="max-w-7xl mx-auto">
                <Card className="shadow-lg border-none overflow-hidden">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="text-xl">Inventory Movement Log</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase text-center">Type</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Product</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase text-center">Qty</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Date</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Reference</th>
                            </tr>
                            </thead>
                            <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="border-b hover:bg-muted/30 transition">
                                    <td className="p-4 text-center">
                                        <Badge variant={tx.type === 'IN' ? 'default' : 'destructive'}>
                                            {tx.type}
                                        </Badge>
                                    </td>
                                    <td className="p-4 font-medium">{tx.productName}</td>
                                    <td className={`p-4 text-center font-bold ${tx.type === 'OUT' ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.type === 'OUT' ? `-${tx.quantity}` : `+${tx.quantity}`}
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">{tx.timestamp}</td>
                                    <td className="p-4 text-xs font-mono">{tx.reference}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default WarehouseTransferHistory;