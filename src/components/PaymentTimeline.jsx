import { useEffect, useMemo, useState } from "react";
import { getSupplierPaymentTimeline } from "../api/financeApi";

function badgeClass(status) {
  if (status === "PAID") return "bg-green-600";
  if (status === "SCHEDULED") return "bg-yellow-600";
  if (status === "FAILED") return "bg-red-600";
  if (status === "PROCESSING") return "bg-blue-600";
  return "bg-gray-500";
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

export default function PaymentTimeline({ supplierId, supplierName }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supplierId) return;

    (async () => {
      setLoading(true);
      try {
        const data = await getSupplierPaymentTimeline(supplierId);
        setItems(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [supplierId]);

  const groups = useMemo(() => {
    // group by day (YYYY-MM-DD)
    const g = {};
    for (const it of items) {
      const key = it.createdAt ? new Date(it.createdAt).toISOString().slice(0, 10) : "unknown";
      if (!g[key]) g[key] = [];
      g[key].push(it);
    }
    return Object.entries(g).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [items]);

  return (
    <div className="bg-white border rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-lg font-semibold">Stripe Payment Timeline</div>
          <div className="text-sm text-gray-600">
            Supplier: <span className="font-medium">{supplierName || supplierId}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">{loading ? "Loading..." : `${items.length} events`}</div>
      </div>

      {items.length === 0 && !loading ? (
        <div className="text-sm text-gray-600">No payments found for this supplier.</div>
      ) : (
        <div className="relative pl-6">
          {/* vertical line */}
          <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />

          {groups.map(([day, list]) => (
            <div key={day} className="mb-6">
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                {day === "unknown" ? "Unknown date" : day}
              </div>

              <div className="space-y-3">
                {list.map((it) => (
                  <div key={it.supplierPaymentId} className="relative">
                    {/* dot */}
                    <div className="absolute -left-[22px] top-3 h-3 w-3 rounded-full bg-gray-400" />

                    <div className="border rounded-lg p-4">
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-white text-xs ${badgeClass(it.status)}`}>
                            {it.status}
                          </span>
                          <span className="text-sm font-medium">
                            {String(it.currency || "cad").toUpperCase()} {it.amount}
                          </span>
                          <span className="text-xs text-gray-500">
                            Payment #{it.supplierPaymentId}
                          </span>
                        </div>

                        <div className="text-xs text-gray-500">
                          Created: {formatDate(it.createdAt)}
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700">
                        <div>
                          PO: <span className="font-medium">#{it.poId}</span>
                        </div>
                        <div>
                          Invoice: <span className="font-medium">#{it.invoiceId}</span>
                        </div>
                        <div>
                          Retry: <span className="font-medium">{it.retryCount ?? 0}</span>
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500">
                        <div>Scheduled: {formatDate(it.scheduledFor)}</div>
                        <div>Executed: {formatDate(it.executedAt)}</div>
                        <div>Completed: {formatDate(it.completedAt)}</div>
                      </div>

                      {it.failureReason && (
                        <div className="mt-2 text-xs text-red-600">
                          Failure: {it.failureReason}
                        </div>
                      )}

                      {it.stripePaymentIntentId && (
                        <div className="mt-2 text-xs text-gray-500">
                          Stripe PI: <span className="font-mono">{it.stripePaymentIntentId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
