import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {Card, CardContent, CardHeader, CardTitle} from "../../components/ui/card.jsx";
import {Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import { Badge } from '../../components/ui/badge';
import AdminDashboard from "../admin/AdminDashboard.jsx";

export function ManagerDashboard() {
    const [forecastData, setForecastData] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [kpis, setKpis] = useState({ stockouts: 0, recommendations: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };

                // Attempt to fetch
                const responses = await Promise.allSettled([
                    fetch('/api/intel/forecast?warehouseId=1', { headers }),
                    fetch('/api/intel/anomalies?warehouseId=1', { headers })
                ]);

                // Process Forecast
                if (responses[0].status === 'fulfilled' && responses[0].value.ok) {
                    const data = await responses[0].value.json();
                    setForecastData(data);
                } else {
                    // FALLBACK MOCK DATA
                    setForecastData([
                        { date: 'Feb 1', forecastValue: 400, actualValue: 380 },
                        { date: 'Feb 2', forecastValue: 420, actualValue: 450 },
                    ]);
                }

                // Process Alerts
                if (responses[1].status === 'fulfilled' && responses[1].value.ok) {
                    const data = await responses[1].value.json();
                    setAlerts(data);
                } else {
                    setAlerts([{ id: 1, description: "System: API placeholder detected. Using mock alerts.", timestamp: "Just now" }]);
                }

            } catch (error) {
                console.error("Fetch failed, using local fallback:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center">Synchronizing Intelligence Data...</div>;

    const KPICard = ({ title, value, trend, trendValue, status }) => {
        const statusColors = {
            good: 'bg-green-500/10 text-green-600',
            warning: 'bg-yellow-500/10 text-yellow-600',
            error: 'bg-red-500/10 text-red-600',
        }

        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
                    <div className="flex items-end justify-between">
                        <div className="flex-1">
                            <p className="text-3xl font-bold text-foreground">{value}</p>
                            {trend && (
                                <div className="flex items-center gap-1 mt-2">
                                <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                                  {trendValue}
                                </span>
                                </div>
                            )}
                        </div>
                        {status && (
                            <Badge className={`${statusColors[status]}`}>
                                {status === 'good' ? '✓' : status === 'warning' ? '!' : '✕'}
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/*  KPI Cards */}
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
            </div>

            {/* Forecast Chart using live forecastData */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>AI Demand Forecast</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={forecastData}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="forecastValue" stroke="#8b5cf6" name="AI Forecast" />
                                <Line type="monotone" dataKey="actualValue" stroke="#3b82f6" name="Actuals" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Real Alert Feed */}
                <Card>
                    <CardHeader><CardTitle>Anomaly Alerts</CardTitle></CardHeader>
                    <CardContent>
                        {alerts.map(alert => (
                            <div key={alert.id} className="p-3 border-b">
                                <p className="text-sm font-medium">{alert.description}</p>
                                <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default ManagerDashboard;