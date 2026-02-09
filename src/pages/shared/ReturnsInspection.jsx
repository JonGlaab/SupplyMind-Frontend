import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import api from '../../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Label } from '../../components/ui/label'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { Checkbox } from '../../components/ui/checkbox'

const getStatusBadge = (status) => {
    const statusConfig = {
        'REQUESTED': { label: 'Pending Inspection', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
        'APPROVED': { label: 'Approved', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
        'RECEIVED': { label: 'Received', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
    }
    const config = statusConfig[status] || { label: status, className: '' }
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>
}

export function ReturnsInspection() {
    const { returnId } = useParams()
    const navigate = useNavigate()
    const [returns, setReturns] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [condition, setCondition] = useState('')
    const [action, setAction] = useState('')
    const [issueRefund, setIssueRefund] = useState(false)

    useEffect(() => {
        fetchData()
    }, [returnId])

    const fetchData = async () => {
        try {
            setLoading(true)
            const endpoint = returnId ? `/api/returns/${returnId}` : '/api/returns/list'
            const res = await api.get(endpoint)

            const data = res.data.content || res.data
            setReturns(Array.isArray(data) ? data : [data])

            if (!Array.isArray(data)) {
                setCondition(data.itemCondition || '')
                setAction(data.action || '')
            }
        } catch (err) {
            console.error("Database connection failed", err)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveInspection = async (id) => {
        setSubmitting(true)
        try {
            await api.post(`/api/returns/${id}/receive`, {
                itemCondition: condition,
                recommendedAction: action,
                triggerRefund: issueRefund,
                receivedBy: localStorage.getItem('userName') || 'Staff'
            })

            alert("Inspection saved to database.")
            fetchData() // Refresh list
        } catch (err) {
            alert("Save failed: " + (err.response?.data?.message || "Check connection"))
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-blue-600" /></div>

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Returns & Inspection</h1>
                    <p className="text-muted-foreground mt-1">Direct database access for reverse logistics</p>
                </div>
                {returnId && (
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Oversight
                    </Button>
                )}
            </div>

            {/* Metrics from Real Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Active Requests</p><p className="text-2xl font-bold">{returns.length}</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Pending Action</p><p className="text-2xl font-bold text-yellow-600">{returns.filter(r => r.status === 'REQUESTED').length}</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold text-green-600">{returns.filter(r => r.status === 'RECEIVED').length}</p></CardContent></Card>
            </div>

            <div className="space-y-4">
                {returns.map(item => (
                    <Card key={item.id} className="overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Return #{item.id}</CardTitle>
                                    <p className="text-sm text-slate-500">PO Ref: #{item.poId || item.po?.poId}</p>
                                </div>
                                {getStatusBadge(item.status)}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <div><Label className="text-xs font-bold uppercase text-slate-400">Reason</Label><p className="mt-1">{item.reason}</p></div>
                                    <div><Label className="text-xs font-bold uppercase text-slate-400">Items</Label>
                                        <ul className="mt-2 space-y-1">
                                            {item.items?.map(li => (
                                                <li key={li.id} className="text-sm flex justify-between border-b pb-1">
                                                    <span>{li.productName || 'Product'}</span>
                                                    <span className="font-bold">x{li.qtyReturnRequested}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="space-y-6 bg-slate-50/50 p-4 rounded-xl border">
                                    <h3 className="font-bold text-sm">Inspection Form</h3>
                                    <div className="space-y-3">
                                        <Label className="text-sm">Condition</Label>
                                        <RadioGroup value={condition} onValueChange={setCondition} className="flex gap-4">
                                            <div className="flex items-center gap-1"><RadioGroupItem value="NEW" id="n" /><Label htmlFor="n">New</Label></div>
                                            <div className="flex items-center gap-1"><RadioGroupItem value="DAMAGED" id="d" /><Label htmlFor="d">Damaged</Label></div>
                                        </RadioGroup>
                                    </div>

                                    <div className="flex items-center gap-2 p-3 bg-white border rounded-lg">
                                        <Checkbox id="refund" checked={issueRefund} onCheckedChange={setIssueRefund} />
                                        <Label htmlFor="refund" className="text-sm">Approve Stripe Refund</Label>
                                    </div>

                                    <Button
                                        onClick={() => handleSaveInspection(item.id)}
                                        className="w-full bg-blue-600"
                                        disabled={submitting || item.status === 'RECEIVED'}
                                    >
                                        {submitting ? "Syncing..." : "Submit Inspection"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default ReturnsInspection;