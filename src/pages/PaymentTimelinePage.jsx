import { useParams, useLocation, useNavigate } from "react-router-dom";
import PaymentTimeline from "../components/PaymentTimeline";

export default function PaymentTimelinePage() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const qs = new URLSearchParams(location.search);
  const supplierName = qs.get("name") || "";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Payment Timeline</h1>
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
