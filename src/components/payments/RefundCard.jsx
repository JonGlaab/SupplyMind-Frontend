import { useMemo, useState } from "react";
import api from "../../services/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

export default function RefundCard({
  paymentId,
  currency = "CAD",
  maxRefundable, // optional
  onRefunded, // optional callback
}) {
  const [mode, setMode] = useState("FULL"); // "FULL" | "PARTIAL"
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const parsedAmount = useMemo(() => {
    if (amount === "" || amount === null || amount === undefined) return null;
    const n = Number(amount);
    return Number.isFinite(n) ? n : NaN;
  }, [amount]);

  const maxLabel = useMemo(() => {
    if (typeof maxRefundable !== "number") return null;
    return maxRefundable.toLocaleString("en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [maxRefundable]);

  const normalizedCurrency = (currency || "CAD").toUpperCase();

  const handleRefund = async () => {
    setError("");
    setSuccessMsg("");

    if (!paymentId) {
      setError("paymentId is missing.");
      return;
    }

    const isPartial = mode === "PARTIAL";
    const amountToSend = isPartial ? parsedAmount : null; // null => full remaining refund

    if (isPartial) {
      if (parsedAmount === null) {
        setError("Please enter an amount for partial refund.");
        return;
      }
      if (Number.isNaN(parsedAmount)) {
        setError("Refund amount must be a number.");
        return;
      }
      if (parsedAmount <= 0) {
        setError("Refund amount must be greater than 0.");
        return;
      }
      if (typeof maxRefundable === "number" && parsedAmount > maxRefundable) {
        setError(`Refund amount cannot exceed ${maxLabel} ${normalizedCurrency}.`);
        return;
      }
    }

    setIsRefunding(true);

    try {
      await api.post("/api/core/payments/refund", {
        paymentId,
        amount: amountToSend, // null => FULL, number => PARTIAL
        reason: reason?.trim() ? reason.trim() : null,
      });

      setSuccessMsg(
        amountToSend === null
          ? "Full refund requested successfully."
          : `Partial refund (${amountToSend.toFixed(2)} ${normalizedCurrency}) requested successfully.`
      );

      // Reset
      setAmount("");
      setReason("");
      setMode("FULL");

      onRefunded?.();
    } catch (e) {
      console.error(e);
      setError(
        e?.response?.data?.message ||
          e?.response?.data ||
          "Refund failed. Please try again."
      );
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/10 bg-white/5 p-5 backdrop-blur">
      <div className="mb-4 space-y-1">
        <h3 className="text-lg font-semibold text-white">Refund</h3>
        <p className="text-sm text-slate-300">
          Choose <span className="font-semibold">Full</span> or{" "}
          <span className="font-semibold">Partial</span> refund.
        </p>

        {typeof maxRefundable === "number" ? (
          <p className="text-xs text-slate-400">
            Refundable balance: <span className="text-slate-200">{maxLabel} {normalizedCurrency}</span>
          </p>
        ) : null}
      </div>

      {/* Mode toggle */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("FULL")}
          className={[
            "rounded-xl px-3 py-2 text-sm font-semibold transition border",
            mode === "FULL"
              ? "bg-white/15 border-white/20 text-white"
              : "bg-transparent border-white/10 text-slate-300 hover:bg-white/10",
          ].join(" ")}
        >
          Full refund
        </button>

        <button
          type="button"
          onClick={() => setMode("PARTIAL")}
          className={[
            "rounded-xl px-3 py-2 text-sm font-semibold transition border",
            mode === "PARTIAL"
              ? "bg-white/15 border-white/20 text-white"
              : "bg-transparent border-white/10 text-slate-300 hover:bg-white/10",
          ].join(" ")}
        >
          Partial refund
        </button>
      </div>

      {successMsg ? (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          {successMsg}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-200 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        {/* Amount shown only for PARTIAL */}
        {mode === "PARTIAL" ? (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Amount ({normalizedCurrency})
            </label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 25.00"
              inputMode="decimal"
              className="bg-white/10 border-white/10 text-white placeholder:text-slate-400"
            />
            {typeof maxRefundable === "number" ? (
              <p className="mt-1 text-[11px] text-slate-400">
                Max: {maxLabel} {normalizedCurrency}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
            This will refund the <span className="font-semibold text-white">remaining refundable balance</span>.
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Reason (optional)
          </label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Damaged item / Wrong quantity / etc."
            className="bg-white/10 border-white/10 text-white placeholder:text-slate-400"
          />
        </div>

        <Button
          type="button"
          onClick={handleRefund}
          className="w-full"
          disabled={isRefunding}
        >
          {isRefunding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {mode === "FULL" ? "Request Full Refund" : "Request Partial Refund"}
        </Button>

        <div className="pt-1 text-[10px] text-slate-400 text-center uppercase tracking-widest flex items-center justify-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-300" />
          Secure Handshake Active
        </div>
      </div>
    </div>
  );
}
