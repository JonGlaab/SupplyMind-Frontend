import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Badge } from '../../components/ui/badge.jsx';

export function ManagerDashboard() {
    const [forecastData, setForecastData] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [kpis, setKpis] = useState({ stockouts: 0, recommendations: 0, trend: 'STABLE' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Aggregated Forecast Data (3 monthly buckets + prediction)
                const forecastRes = await api.get('/api/intel/demand/1');
                const { history, predictedDemandNext30Days, trend } = forecastRes.data;

                // 2. Fetch Real Inventory Data to compare against stock levels
                const invRes = await api.get('/api/core/products/1');
                const product = invRes.data;

                const currentStock = product.qtyOnHand || 0;
                const minLevel = product.minStockLevel || 0;

                // 3. Map the 30-day buckets for the chart
                const historicalData = history.map(p => ({
                    date: p.date, // "Last 30 Days", etc.
                    actualValue: p.quantity,
                    forecastValue: null
                }));

                // 4. Combine history with the future prediction point
                setForecastData([
                    ...historicalData,
                    {
                        date: 'Next 30 Days (AI)',
                        actualValue: null,
                        forecastValue: predictedDemandNext30Days
                    }
                ]);

                // 5. Calculate KPIs based on real inventory thresholds
                const stockoutRisk = currentStock <= minLevel ? 1 : 0;

                setKpis({
                    stockouts: stockoutRisk,
                    recommendations: predictedDemandNext30Days > currentStock ? 1 : 0,
                    trend: trend
                });

                // 6. Alert logic
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
                console.error("Dashboard synchronization failed:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center">Synchronizing Intelligence Data...</div>;

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
                        <CardTitle className="text-lg">Demand Forecast (Monthly Aggregation)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart
                                data={forecastData}
                                margin={{ bottom: 20, left: 10, right: 10, top: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    interval={0} // Shows all 4 buckets clearly
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
                                    name="AI Prediction"
                                    connectNulls={true}
                                    strokeDasharray="5 5"
                                    dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 8 }}
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
        </div>
    );
}

export default ManagerDashboard;