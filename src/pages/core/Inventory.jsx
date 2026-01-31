import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StaffInventoryPortal = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedWarehouse, setSelectedWarehouse] = useState(1); // Defaulting for now
    const [recentActions, setRecentActions] = useState([]);

    // 1. Fetch current inventory levels
    const fetchInventory = async () => {
        try {
            // Adjust this URL to match your backend endpoint
            const response = await axios.get(`/api/inventory/warehouse/${selectedWarehouse}`);
            setInventory(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching inventory", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [selectedWarehouse]);

    // 2. Handle Receiving Stock
    const handleReceive = async (productId, productName, amount) => {
        if (!amount || amount <= 0) return;

        try {
            await axios.post('/api/inventory/receive', {
                warehouseId: selectedWarehouse,
                productId: productId,
                amount: parseInt(amount)
            });

            // Update local activity log (The "No-DB" log for this session)
            const logEntry = `${new Date().toLocaleTimeString()}: Received ${amount} of ${productName}`;
            setRecentActions(prev => [logEntry, ...prev].slice(0, 5));

            // Refresh the list to see new quantity
            fetchInventory();
        } catch (err) {
            alert("Failed to update inventory. Check console.");
        }
    };

    // Filter results based on search
    const filteredInventory = inventory.filter(item =>
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
            <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800">Warehouse Staff Portal</h1>
                <div className="flex gap-4">
                    <select
                        className="border p-2 rounded"
                        value={selectedWarehouse}
                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                    >
                        <option value={1}>Main Warehouse (W1)</option>
                        <option value={2}>East Distribution (W2)</option>
                    </select>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Action Area */}
                <div className="lg:col-span-2 space-y-4">
                    <input
                        type="text"
                        placeholder="Search by SKU or Product Name..."
                        className="w-full p-3 border rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="p-4">Product</th>
                                <th className="p-4">SKU</th>
                                <th className="p-4">On Hand</th>
                                <th className="p-4 text-center">Receive Shipment</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredInventory.map(item => (
                                <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium">{item.product.name}</td>
                                    <td className="p-4 text-gray-600">{item.product.sku}</td>
                                    <td className="p-4 font-bold text-blue-600">{item.qtyOnHand}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2 justify-center">
                                            <input
                                                type="number"
                                                id={`input-${item.product.id}`}
                                                className="w-16 border rounded px-2"
                                                placeholder="Qty"
                                            />
                                            <button
                                                onClick={() => {
                                                    const val = document.getElementById(`input-${item.product.id}`).value;
                                                    handleReceive(item.product.id, item.product.name, val);
                                                    document.getElementById(`input-${item.product.id}`).value = '';
                                                }}
                                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar: Recent Logs for Admin/Staff feedback */}
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="font-bold text-gray-700 mb-4 uppercase text-xs tracking-wider">Recent Local Activity</h2>
                        {recentActions.length === 0 ? (
                            <p className="text-gray-400 text-sm">No activity in this session.</p>
                        ) : (
                            <ul className="space-y-2">
                                {recentActions.map((action, i) => (
                                    <li key={i} className="text-sm p-2 bg-blue-50 text-blue-800 rounded border-l-4 border-blue-500">
                                        {action}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffInventoryPortal;