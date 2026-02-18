import { useParams, useLocation, useNavigate } from "react-router-dom";
import PaymentTimeline from "../components/PaymentTimeline";

export default function PaymentTimelinePage() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const supplierName = location.state?.supplierName || null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl font-bold">Payment Timeline</div>
          <div className="text-sm text-gray-600">
            Supplier: <span className="font-medium">{supplierName || supplierId}</span>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
        >
          Back
        </button>
      </div>

      <PaymentTimeline supplierId={Number(supplierId)} supplierName={supplierName} />
    </div>
  );
}
