import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'

const forecastData = [
    { date: 'Jan 1', forecast: 45000, actual: 40000 },
    { date: 'Jan 8', forecast: 52000, actual: 48000 },
    { date: 'Jan 15', forecast: 58000, actual: 62000 },
    { date: 'Jan 22', forecast: 51000, actual: 54000 },
    { date: 'Jan 29', forecast: 68000, actual: 65000 },
]

const recentActivity = [
    { id: 1, type: 'anomaly', message: 'Anomaly Detected: SKU-992 spike in Returns', time: '2 hours ago' },
    { id: 2, type: 'shipment', message: 'Shipment #442 arrived at Warehouse A', time: '4 hours ago' },
    { id: 3, type: 'order', message: 'PO #1284 payment received', time: '6 hours ago' },
    { id: 4, type: 'stock', message: 'SKU-445 low stock warning triggered', time: '8 hours ago' },
    { id: 5, type: 'receipt', message: 'Receipt #5823 finalized with 500 units', time: '1 day ago' },
]

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
                                {trend === 'up' ? (
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                )}
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

export function CommandCenter() {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Inventory Value"
                    value="$452K"
                    trend="up"
                    trendValue="+2.4% vs last month"
                    status="good"
                />
                <KPICard title="Stockout Risk" value="12 SKUs" status="error" />
                <KPICard title="Active POs" value="8 Pending" status="warning" />
                <KPICard
                    title="Monthly Return Rate"
                    value="3.2%"
                    trend="down"
                    trendValue="-0.5% vs last month"
                    status="good"
                />
            </div>

            {/* Main Section - Forecast Chart and Alert Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Forecast Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Demand Forecast vs. Actual Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={forecastData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="forecast"
                                    stroke="#8b5cf6"
                                    strokeDasharray="5 5"
                                    name="AI Forecast"
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="#3b82f6"
                                    name="Actual Sales"
                                    strokeWidth={2}
                                    dot={true}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Alert Feed */}
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg">Alert Feed</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="space-y-3 max-h-[350px] overflow-auto">
                            {recentActivity.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="flex gap-3 px-6 py-3 border-b border-border hover:bg-muted/50 transition-colors"
                                >
                                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                        alert.type === 'anomaly'
                                            ? 'text-red-600'
                                            : alert.type === 'stock'
                                                ? 'text-yellow-600'
                                                : 'text-blue-600'
                                    }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{alert.message}</p>
                                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Recent Activity History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-border text-left">
                                <th className="py-3 px-4 font-semibold">Time</th>
                                <th className="py-3 px-4 font-semibold">Event</th>
                                <th className="py-3 px-4 font-semibold">User</th>
                                <th className="py-3 px-4 font-semibold">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {recentActivity.map((activity, idx) => (
                                <tr key={idx} className="border-b border-border hover:bg-muted/50">
                                    <td className="py-3 px-4 text-muted-foreground">{activity.time}</td>
                                    <td className="py-3 px-4 text-foreground">{activity.message}</td>
                                    <td className="py-3 px-4 text-foreground">System</td>
                                    <td className="py-3 px-4">
                                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                            Completed
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}