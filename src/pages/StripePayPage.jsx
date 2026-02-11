import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutCardForm from "../components/payments/CheckoutCardForm";
import "./StripePayPage.css";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function StripePayPage() {
  const { poId } = useParams();
  const navigate = useNavigate();

  const [po, setPo] = useState(null);

  const [clientSecret, setClientSecret] = useState("");
  const [paymentId, setPaymentId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("PENDING");

  const [loading, setLoading] = useState(true);
  const [creatingIntent, setCreatingIntent] = useState(true);
  const [err, setErr] = useState("");

  // Format amount
  const amountLabel = useMemo(() => {
    if (!po?.totalAmount) return "";
    const n = Number(po.totalAmount);
    return n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
  }, [po]);

  // Status text formatting
  const statusLabel = (s) => {
    if (!s) return "PENDING";
    const t = String(s).toUpperCase();
    if (t === "PARTIALLY_REFUNDED") return "PARTIALLY REFUNDED";
    return t;
  };

  // Status badge color
  const statusClass = (s) => {
    const t = String(s || "PENDING").toUpperCase();

    if (t === "PAID") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    if (t === "FAILED") return "bg-red-500/15 text-red-300 border-red-500/30";
    if (t === "REFUNDED" || t === "PARTIALLY_REFUNDED") {
      return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    }
    return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  };

  // Load PO + Create PaymentIntent
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setErr("");

        const poRes = await api.get(`/api/core/purchase-orders/${poId}`);
        setPo(poRes.data);

        setCreatingIntent(true);
        const payRes = await api.post(`/api/core/payments/create-intent`, {
          poId: Number(poId),
          currency: "cad",
          paymentType: "CARD",
        });

        setClientSecret(payRes.data.clientSecret);
        setPaymentId(payRes.data.paymentId);
        setPaymentStatus("PENDING");
      } catch (e) {
        console.error(e);
        setErr("Could not load payment page");
      } finally {
        setLoading(false);
        setCreatingIntent(false);
      }
    };

    run();
  }, [poId]);

  // Poll backend for payment status (updated by Stripe webhook)
  useEffect(() => {
    if (!paymentId) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await api.get(`/api/core/payments/${paymentId}`);

        if (cancelled) return;

        const status = res.data.status;
        setPaymentStatus(status);

        if (["PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"].includes(status)) return;

        setTimeout(poll, 2000);
      } catch (e) {
        console.error("Polling error:", e);
        setTimeout(poll, 3000);
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  // ✅ Bright Stripe Elements UI
  const options = useMemo(() => {
    return {
      clientSecret,
      appearance: {
        theme: "stripe",
      },
    };
  }, [clientSecret]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pay-page min-h-screen w-full">
      <div className="pay-bg" />

      <div className="pay-shell">
        {/* HEADER */}
        <header className="pay-header">
          {/* ✅ Center logo like login page */}
          <div className="pay-logo-wrapper">
            <img
              src="/images/supplymind-logo.png"
              alt="SupplyMind"
              className="pay-logo"
            />
          </div>

          <Button className="pay-back-btn" variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </header>

        {err && <div className="pay-error">{err}</div>}

        <div className="pay-grid">
          {/* LEFT CARD */}
          <Card className="pay-card pay-card--glass">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Payment for Purchase Order</CardTitle>
            </CardHeader>

            <CardContent className="text-slate-200 space-y-4">
              <div className="pay-row">
                <span className="pay-label">PO #</span>
                <span className="pay-value">{po?.poId}</span>
              </div>

              <div className="pay-row">
                <span className="pay-label">Amount</span>
                <span className="pay-value">{amountLabel}</span>
              </div>

              <div className="pay-row">
                <span className="pay-label">Status</span>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${statusClass(
                    paymentStatus
                  )}`}
                >
                  {statusLabel(paymentStatus)}
                </span>
              </div>

              <div className="pay-note">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                <span>Secure payment powered by Stripe. Card details never touch our servers.</span>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT CARD */}
          <Card className="pay-card pay-card--dark">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Card Payment</CardTitle>
            </CardHeader>

            <CardContent>
              {!clientSecret || creatingIntent ? (
                <div className="flex items-center gap-2 text-slate-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing secure payment…
                </div>
              ) : (
                <Elements stripe={stripePromise} options={options}>
                  <CheckoutCardForm poId={poId} amountLabel={amountLabel} />
                </Elements>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
