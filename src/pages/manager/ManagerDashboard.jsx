import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Badge } from '../../components/ui/badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select.jsx";

export function ManagerDashboard() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [forecastData, setForecastData] = useState([]);
    const [forecastError, setForecastError] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [kpis, setKpis] = useState({ stockouts: 0, recommendations: 0, trend: 'STABLE' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/api/core/products?size=200');
                const productList = res.data.content;
                setProducts(productList);
                if (productList && productList.length > 0) {
                    setSelectedProduct(productList[0]);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (!selectedProduct) {
            return;
        }

        const fetchData = async (product) => {
            setLoading(true);
            setForecastError(null);
            setForecastData([]);
            try {
                const forecastRes = await api.get(`/api/intel/demand/${product.productId}`);
                const { history, predictedDemandNext30Days, trend } = forecastRes.data;

                const currentStock = product.qtyOnHand || 0;
                const minLevel = product.minStockLevel || 0;

                const historicalData = history.map(p => ({
                    date: p.date,
                    actualValue: p.quantity,
                    forecastValue: null
                }));

                setForecastData([
                    ...historicalData,
                    {
                        date: 'Next 30 Days',
                        actualValue: null,
                        forecastValue: predictedDemandNext30Days
                    }
                ]);

                const stockoutRisk = currentStock <= minLevel ? 1 : 0;
                setKpis({
                    stockouts: stockoutRisk,
                    recommendations: predictedDemandNext30Days > currentStock ? 1 : 0,
                    trend: trend
                });

                if (stockoutRisk > 0) {
                    setAlerts([{
                        id: Date.now(),
                        description: `Critical: SKU ${product.sku} is below minimum level (${currentStock}/${minLevel})`,
                        timestamp: "Urgent"
                    }]);
                } else {
                    setAlerts([{ id: 1, description: "All stock levels healthy.", timestamp: "System Clear" }]);
                }

            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setForecastError(`Forecast not available for ${product.name} (SKU: ${product.sku})`);
                } else {
                    console.error(`Dashboard synchronization failed for product ${product.productId}:`, error);
                    setForecastError("An error occurred while fetching forecast data.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData(selectedProduct);
    }, [selectedProduct]);

    const handleProductChange = (productId) => {
        const product = products.find(p => p.productId.toString() === productId);
        setSelectedProduct(product);
    };

    const KPICard = ({ title, value, status }) => {
        const statusColors = {
            good: 'bg-green-500/10 text-green-600',
            warning: 'bg-yellow-500/10 text-yellow-600',
            error: 'bg-red-500/10 text-red-600',
        };

        return (
            <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                    <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
                    <div className="flex items-center justify-between">
                        <p className="text-3xl font-bold text-slate-900">{value}</p>
                        <Badge className={`${statusColors[status]} border-none shadow-none`}>
                            {status === 'good' ? '✓' : status === 'warning' ? '!' : '✕'}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Manager Dashboard</h1>
                <div className="w-72">
                    <Select
                        onValueChange={handleProductChange}
                        value={selectedProduct ? selectedProduct.productId.toString() : ''}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a Product..." />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map(p => (
                                <SelectItem key={p.productId} value={p.productId.toString()}>
                                    {p.name} ({p.sku})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="p-10 text-center">Synchronizing Intelligence Data...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICard
                            title="Stockout Risk"
                            value={`${kpis.stockouts} SKUs`}
                            status={kpis.stockouts > 0 ? "error" : "good"}
                        />
                        <KPICard
                            title="Reorder Suggestions"
                            value={kpis.recommendations}
                            status={kpis.recommendations > 0 ? "warning" : "good"}
                        />
                        <KPICard
                            title="30-Day Market Trend"
                            value={kpis.trend}
                            status={kpis.trend === 'DECLINING' ? "error" : "good"}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Demand Forecast: {selectedProduct ? `${selectedProduct.name} (${selectedProduct.sku})` : 'N/A'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {forecastError ? (
                                    <div className="flex items-center justify-center h-96 text-center text-red-500">
                                        <p>{forecastError}</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart
                                            data={forecastData}
                                            margin={{ bottom: 20, left: 10, right: 40, top: 10 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="date"
                                                interval={0}
                                                fontSize={12}
                                                tick={{ fill: '#64748b' }}
                                                dy={10}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis tick={{ fill: '#64748b' }} fontSize={11} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="forecastValue"
                                                stroke="#8b5cf6"
                                                name="30-day Forecast"
                                                connectNulls={true}
                                                strokeDasharray="5 5"
                                                dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 0 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="actualValue"
                                                stroke="#3b82f6"
                                                name="Monthly Sales"
                                                connectNulls={true}
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardHeader><CardTitle className="text-lg">Operational Alerts</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {alerts.map((alert, idx) => (
                                    <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                        <p className="text-sm font-semibold text-slate-900">{alert.description}</p>
                                        <p className="text-xs text-slate-500 mt-1">{alert.timestamp}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}

export default ManagerDashboard;