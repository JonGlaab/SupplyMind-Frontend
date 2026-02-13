import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '../../components/ui/dialog.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Package, ArrowRight } from 'lucide-react';

const ViewProcessedOrderModal = ({ order, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!order) {
    return null;
  }

  const handleInitiateReturn = () => {
    navigate(`/staff/return-request/${order.poId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            PO #{order.poId} - {order.supplierName}
          </DialogTitle>
          <DialogDescription>
            This is a summary of the items received for this purchase order.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Received Items</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2">Product</th>
                  <th className="pb-2 text-center">Ordered</th>
                  <th className="pb-2 text-center">Received</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.poItemId} className="border-t">
                    <td className="py-2">
                      <div className="flex items-center gap-3">
                        <Package size={16} className="text-slate-400" />
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{item.productName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-center font-medium">{item.orderedQty}</td>
                    <td className="py-2 text-center font-bold text-emerald-600">{item.receivedQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleInitiateReturn}>
            Initiate Return <ArrowRight size={16} className="ml-2" />
          </Button>
          <DialogClose asChild>
            <Button variant="ghost">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewProcessedOrderModal;
