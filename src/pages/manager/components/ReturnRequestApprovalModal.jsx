import { useState } from 'react';
import api from '../../../services/api.js';
import { Button } from '../../../components/ui/button.jsx';
import { Textarea } from '../../../components/ui/textarea.jsx';

const ReturnRequestApprovalModal = ({ isOpen, onClose, onSuccess, returnId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleConfirm = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // payload matches your ApproveReturnDTO
            await api.post(`/api/returns/${returnId}/approve`, {
                notes: notes,
                approvedBy: localStorage.getItem('userName') || 'Manager'
            });

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to approve return. Ensure you have MANAGER permissions.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
                <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Authorize Return</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <form onSubmit={handleConfirm} className="p-6 space-y-4">
                    {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

                    <div className="space-y-2">
                        <p className="text-slate-600 text-sm">
                            You are approving **Return Request #{returnId}**.
                            This will notify the warehouse staff that they are authorized to receive these items into stock.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Approval Notes (Optional)</label>
                        <Textarea
                            placeholder="e.g. Verified with supplier, proceed with restock."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-3">
                        <div className="text-amber-600 pt-0.5">⚠️</div>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            Approval will update the status to **APPROVED**. Staff will then be able to perform the physical "Receive" action.
                        </p>
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Confirm Authorization'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReturnRequestApprovalModal;