import { useState } from 'react';
import api from '../../services/api';
import { Button } from '../../components/ui/button';

const PurchaseOrderApprovalModal = ({ isOpen, onClose, onSuccess, poId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setError('');
        setIsLoading(true);
        try {
            await api.post(`/api/core/purchase-orders/${poId}/approve`);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Authorization failed or connection error.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
                <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Approve Purchase Order</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <div className="p-6 space-y-4">
                    {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

                    <p className="text-slate-600 text-sm">
                        You are about to approve <span className="font-bold">Purchase Order #{poId}</span>.
                        This action will notify the procurement team and allow the order to be sent to the supplier.
                    </p>

                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium italic">
                            By clicking confirm, you certify that the quantities and costs in this order have been reviewed and match the procurement guidelines.
                        </p>
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Confirm Approval'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderApprovalModal;