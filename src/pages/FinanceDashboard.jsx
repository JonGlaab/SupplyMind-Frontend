import { useEffect, useState } from "react";
import {
  getReadyPos,
  createInvoiceFromPo,
  getInvoiceByPo,
  approveInvoice,
  schedulePayment,
  executePayment,
  getPaymentsByInvoice
} from "../api/financeApi";

import { getConnectStatus, mockEnableConnect } from "../api/supplierConnectApi";
import PaymentTimeline from "../components/PaymentTimeline";
import toast from "react-hot-toast";

export default function FinanceDashboard() {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);

  // cache invoices by poId
  const [invoiceMap, setInvoiceMap] = useState({}); // { [poId]: invoice or null }
  const [connectMap, setConnectMap] = useState({}); // { [supplierId]: status }

  // store last scheduled supplierPaymentId per invoiceId
  const [scheduledPaymentMap, setScheduledPaymentMap] = useState({}); // { [invoiceId]: supplierPaymentId }

  // latest payment info per invoice (for badge + executedAt)
  const [paymentInfoMap, setPaymentInfoMap] = useState({});
  // { [invoiceId]: { supplierPaymentId, status, executedAt, amount, currency } }

  // ✅ timeline UI state
  const [openTimelineSupplierId, setOpenTimelineSupplierId] = useState(null);
  const [openTimelineSupplierName, setOpenTimelineSupplierName] = useState(null);

  const load = async () => {
    try {
      setLoading(true);

      const data = await getReadyPos();
      setPos(data);

      // load invoice status for each PO
      const invPairs = await Promise.all(
        data.map(async (po) => {
          const inv = await getInvoiceByPo(po.poId);
          return [po.poId, inv];
        })
      );

      const map = {};
      invPairs.forEach(([poId, inv]) => (map[poId] = inv));
      setInvoiceMap(map);

      // ✅ load latest payment per invoice from DB (survives refresh)
      const invoiceIds = Object.values(map)
        .filter(Boolean)
        .map((inv) => inv.invoiceId);

      const paymentPairs = await Promise.all(
        invoiceIds.map(async (invoiceId) => {
          const payments = await getPaymentsByInvoice(invoiceId);
          const latest = payments?.[0] || null; // ordered DESC in backend repo method
          return [invoiceId, latest];
        })
      );

      const spm = {};
      const pim = {};

      paymentPairs.forEach(([invoiceId, latest]) => {
        if (!latest) return;

        spm[invoiceId] = latest.supplierPaymentId;

        pim[invoiceId] = {
          supplierPaymentId: latest.supplierPaymentId,
          status: latest.status,
          executedAt: latest.executedAt,
          amount: latest.amount,
          currency: latest.currency
        };
      });

      setScheduledPaymentMap(spm);
      setPaymentInfoMap(pim);

      // load connect status for each supplier (DTO mapping)
      const supplierIds = [
        ...new Set(data.map((p) => p.supplierId).filter(Boolean))
      ];

      const statusPairs = await Promise.all(
        supplierIds.map(async (sid) => {
          const st = await getConnectStatus(sid);
          return [sid, st.connectStatus];
        })
      );

      const cm = {};
      statusPairs.forEach(([sid, st]) => (cm[sid] = st));
      setConnectMap(cm);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateInvoice = async (poId) => {
    const res = await createInvoiceFromPo(poId);
    const inv = await getInvoiceByPo(poId);
    setInvoiceMap((prev) => ({ ...prev, [poId]: inv }));
    toast.error(`Invoice created: ${res.invoiceId}`);
  };

  const handleApprove = async (poId, invoiceId) => {
    await approveInvoice(invoiceId);
    const inv = await getInvoiceByPo(poId);
    setInvoiceMap((prev) => ({ ...prev, [poId]: inv }));
    toast.error("Invoice approved");
  };

  const handleSchedule = async (poId, invoiceId, amount) => {
    const payload = {
      invoiceId,
      scheduledFor: null,
      amount: amount ? Number(amount) : null
    };

    // backend returns Long supplierPaymentId
    const supplierPaymentId = await schedulePayment(payload);

    // save so we can execute even before reload
    setScheduledPaymentMap((prev) => ({ ...prev, [invoiceId]: supplierPaymentId }));
    toast.error(`Payment scheduled. id=${supplierPaymentId}`);

    // refresh invoice + latest payment info
    const inv = await getInvoiceByPo(poId);
    setInvoiceMap((prev) => ({ ...prev, [poId]: inv }));

    const payments = await getPaymentsByInvoice(invoiceId);
    const latest = payments?.[0] || null;

    if (latest) {
      setPaymentInfoMap((prev) => ({
        ...prev,
        [invoiceId]: {
          supplierPaymentId: latest.supplierPaymentId,
          status: latest.status,
          executedAt: latest.executedAt,
          amount: latest.amount,
          currency: latest.currency
        }
      }));
    }
  };

  const handleExecute = async (poId, invoiceId) => {
    const supplierPaymentId = scheduledPaymentMap[invoiceId];

    if (!supplierPaymentId) {
      toast.error("No scheduled payment found for this invoice. Please schedule payment first.");
      return;
    }

    await executePayment(supplierPaymentId);
    toast.error("Payment executed");

    // refresh invoice
    const inv = await getInvoiceByPo(poId);
    setInvoiceMap((prev) => ({ ...prev, [poId]: inv }));

    // refresh latest payment info
    const payments = await getPaymentsByInvoice(invoiceId);
    const latest = payments?.[0] || null;

    if (latest) {
      setScheduledPaymentMap((prev) => ({
        ...prev,
        [invoiceId]: latest.supplierPaymentId
      }));

      setPaymentInfoMap((prev) => ({
        ...prev,
        [invoiceId]: {
          supplierPaymentId: latest.supplierPaymentId,
          status: latest.status,
          executedAt: latest.executedAt,
          amount: latest.amount,
          currency: latest.currency
        }
      }));
    }

    await load();
  };

  const handleDemoEnableSupplier = async (supplierId) => {
    await mockEnableConnect(supplierId);
    setConnectMap((prev) => ({ ...prev, [supplierId]: "ENABLED" }));
  };

  const paymentBadgeClass = (status) => {
    if (status === "PAID") return "bg-green-600";
    if (status === "SCHEDULED") return "bg-yellow-600";
    if (status === "FAILED") return "bg-red-600";
    return "bg-gray-500";
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Finance Dashboard</h1>
        <button
          onClick={load}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pos.map((po) => {
          const inv = invoiceMap[po.poId];

          // ✅ DTO mapping
          const supplierId = po.supplierId;

          const connectStatus = supplierId ? connectMap[supplierId] : "UNKNOWN";
          const connectEnabled = connectStatus === "ENABLED";

          const paymentInfo = inv ? paymentInfoMap[inv.invoiceId] : null;

          return (
            <div key={po.poId} className="bg-white border rounded-lg p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">PO #{po.poId}</div>

                  <div className="text-sm text-gray-600 mt-1">
                    Supplier: {po.supplierName} (ID: {supplierId})
                  </div>

                  <div className="text-sm text-gray-600">
                    Status: <span className="font-medium">{po.status}</span>
                  </div>

                  <div className="text-sm text-gray-600">
                    Total: <span className="font-medium">${po.totalAmount}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-600">Connect</div>

                  <div
                    className={`inline-block px-2 py-1 rounded text-white text-xs ${
                      connectEnabled ? "bg-green-600" : "bg-yellow-600"
                    }`}
                  >
                    {connectStatus || "NOT_STARTED"}
                  </div>

                  {!connectEnabled && supplierId && (
                    <button
                      onClick={() => handleDemoEnableSupplier(supplierId)}
                      className="block mt-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Demo Enable
                    </button>
                  )}

                  {supplierId && (
                    <button
                      onClick={() => {
                        setOpenTimelineSupplierId(supplierId);
                        setOpenTimelineSupplierName(po.supplierName);
                      }}
                      className="block mt-2 bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm"
                    >
                      View Payment Timeline
                    </button>
                  )}
                </div>
              </div>

              <hr className="my-4" />

              {!inv ? (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">No invoice yet.</div>

                  <button
                    onClick={() => handleCreateInvoice(po.poId)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Create Invoice
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm">
                    Invoice #{inv.invoiceId} — Status:{" "}
                    <span className="font-semibold">{inv.status}</span>
                  </div>

                  <div className="text-sm text-gray-700">
                    Total: ${inv.totalAmount} | Paid: ${inv.paidAmount} | Remaining: ${inv.remainingAmount}
                  </div>

                  {paymentInfo && (
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-gray-600">Payment Status: </span>
                        <span
                          className={`px-2 py-1 rounded text-white text-xs font-medium ${paymentBadgeClass(
                            paymentInfo.status
                          )}`}
                        >
                          {paymentInfo.status}
                        </span>

                        <span className="text-gray-600 ml-3">
                          Amount:{" "}
                          <span className="font-medium">
                            {paymentInfo.currency?.toUpperCase?.() || "CAD"} {paymentInfo.amount}
                          </span>
                        </span>
                      </div>

                      {paymentInfo.executedAt && (
                        <div className="text-xs text-gray-500">
                          Executed at: {new Date(paymentInfo.executedAt).toLocaleString()}
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Supplier Payment ID: {paymentInfo.supplierPaymentId}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {inv.status === "PENDING_APPROVAL" && (
                      <button
                        onClick={() => handleApprove(po.poId, inv.invoiceId)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                      >
                        Approve Invoice
                      </button>
                    )}

                    <SchedulePaymentInline
                      disabled={!connectEnabled || !(inv.status === "APPROVED" || inv.status === "SCHEDULED")}
                      onSchedule={(amount) => handleSchedule(po.poId, inv.invoiceId, amount)}
                      connectEnabled={connectEnabled}
                    />

                    {scheduledPaymentMap[inv.invoiceId] && (
                      <button
                        onClick={() => handleExecute(po.poId, inv.invoiceId)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded"
                      >
                        Execute Payment
                      </button>
                    )}
                  </div>

                  {!connectEnabled && (
                    <div className="text-xs text-red-600">
                      Supplier is not Connect-enabled. Enable Connect to schedule payments.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ✅ Timeline panel */}
      {openTimelineSupplierId && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">
              Timeline for Supplier:{" "}
              <span className="font-medium">{openTimelineSupplierName || openTimelineSupplierId}</span>
            </div>

            <button
              onClick={() => {
                setOpenTimelineSupplierId(null);
                setOpenTimelineSupplierName(null);
              }}
              className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              Close
            </button>
          </div>

          <PaymentTimeline
            supplierId={openTimelineSupplierId}
            supplierName={openTimelineSupplierName}
          />
        </div>
      )}
    </div>
  );
}

function SchedulePaymentInline({ disabled, onSchedule, connectEnabled }) {
  const [amount, setAmount] = useState("");

  return (
    <div className="flex items-center gap-2">
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Partial amount (optional)"
        className="border rounded px-3 py-2 text-sm w-52"
        disabled={!connectEnabled}
      />
      <button
        disabled={disabled}
        onClick={() => onSchedule(amount)}
        className={`px-4 py-2 rounded text-white ${
          disabled ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        Schedule Payment
      </button>
    </div>
  );
}
