import { useState } from "react";
import {
  generateConnectOnboarding,
  getConnectStatus,
  mockEnableConnect
} from "../api/supplierConnectApi";

export default function SupplierConnectCard({ supplier }) {

  const [status, setStatus] = useState(
    supplier.connectStatus || "NOT_STARTED"
  );

  const [loading, setLoading] = useState(false);

  const handleGenerateLink = async () => {
    try {
      setLoading(true);

      const res = await generateConnectOnboarding(supplier.supplierId);

      setStatus(res.connectStatus);

      window.open(res.url, "_blank");

    } catch (e) {
      alert("Failed to generate onboarding link");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);

      const res = await getConnectStatus(supplier.supplierId);

      setStatus(res.connectStatus);

    } catch (e) {
      alert("Failed to refresh status");
    } finally {
      setLoading(false);
    }
  };

  const handleMock = async () => {
    try {
      setLoading(true);

      await mockEnableConnect(supplier.supplierId);

      setStatus("ENABLED");

    } catch (e) {
      alert("Mock enable failed");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    NOT_STARTED: "bg-gray-400",
    PENDING: "bg-yellow-500",
    ENABLED: "bg-green-500"
  }[status];

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">

      <div className="flex justify-between items-center">

        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {supplier.name}
          </h3>

          <div className="flex items-center mt-2">

            <span className="text-sm text-gray-600 mr-2">
              Connect Status:
            </span>

            <span
              className={`text-white text-xs px-2 py-1 rounded ${statusColor}`}
            >
              {status}
            </span>

          </div>
        </div>

        {status === "ENABLED" && (
          <span className="text-green-600 font-medium">
            Ready to receive payments
          </span>
        )}

      </div>

      <div className="mt-4 flex gap-2">

        <button
          onClick={handleGenerateLink}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Generate Onboarding Link
        </button>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Refresh Status
        </button>

        <button
          onClick={handleMock}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Demo Enable
        </button>

      </div>

    </div>
  );
}
