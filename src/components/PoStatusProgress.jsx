import { Progress } from '/ui/progress';


export const getStatusColor = (status) => {
    if (!status) return 'bg-slate-500';
    if (status === 'DELAY_EXPECTED') return 'bg-red-500';
    if (status === 'RECEIVED' || status === 'PAID') return 'bg-green-500';
    return 'bg-blue-600';
};

export const getStatusPercentage = (status) => {
    const map = {
        'DRAFT': 10,
        'EMAIL_SENT': 30,
        'SUPPLIER_REPLIED': 35,
        'DELAY_EXPECTED': 35,
        'CONFIRMED': 60,
        'PENDING_PAYMENT': 80,
        'PAID': 90,
        'RECEIVED': 100
    };
    return map[status] || 5;
};


export default function PoStatusProgress({ status, showLabel = true, className = "" }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Progress
                value={getStatusPercentage(status)}
                className="h-1.5 flex-1"
            />
            {showLabel && (
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                    {status?.replace(/_/g, ' ')}
                </span>
            )}
        </div>
    );
}