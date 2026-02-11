import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutCardForm from "../components/payments/CheckoutCardForm";
import "./StripePayPage.css";
import RefundCard from "../components/payments/RefundCard";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export function PaymentsPage() {
  const paymentId = 123; // get this from your backend / payment record
  const poId = 45;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CheckoutCardForm poId={poId} amountLabel="120.00" />
      <RefundCard paymentId={paymentId} currency="CAD" />
    </div>
  );
}

export default function StripePayPage() {
  const { poId } = useParams();
  const navigate = useNavigate();

  const [po, setPo] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingIntent, setCreatingIntent] = useState(true);
  const [err, setErr] = useState("");

  const amountLabel = useMemo(() => {
    if (!po?.totalAmount) return "";
    const n = Number(po.totalAmount);
    return n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
  }, [po]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setErr("");

        // 1) Load PO details (adjust endpoint if yours differs)
        const poRes = await api.get(`/api/core/purchase-orders/${poId}`);
        setPo(poRes.data);

        // 2) Create PaymentIntent in backend and get clientSecret
        // ✅ You must have an endpoint that returns: { clientSecret, paymentId? }
        setCreatingIntent(true);
        const payRes = await api.post(`/api/core/payments/create-intent`, {
          poId: Number(poId),
          currency: "cad",
          paymentType: "CARD"
        });

        setClientSecret(payRes.data.clientSecret);
      } catch (e) {
        console.error(e);
        setErr("Could not load payment page. Please try again.");
      } finally {
        setLoading(false);
        setCreatingIntent(false);
      }
    };

    run();
  }, [poId]);

  const options = useMemo(() => {
    return {
      clientSecret,
      appearance: {
        theme: "night",
        variables: {
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
          colorPrimary: "#3b82f6",
          colorText: "#e5e7eb",
          colorBackground: "#0b1220",
          borderRadius: "12px",
        },
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
      {/* Background layer */}
      <div className="pay-bg" />

      {/* Content */}
      <div className="pay-shell">
        <header className="pay-header">
          <div className="brand">
            <div className="brand-mark">SM</div>
            <div className="brand-text">
              <div className="brand-title">SupplyMind</div>
              <div className="brand-sub">Platform</div>
            </div>
          </div>

          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </header>

        {err && (
          <div className="pay-error">
            {err}
          </div>
        )}

        <div className="pay-grid">
          {/* LEFT: PO Summary */}
          <Card className="pay-card pay-card--glass">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                Payment for Purchase Order
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-200 space-y-4">
              <div className="pay-row">
                <span className="pay-label">PO #</span>
                <span className="pay-value">{po?.poId ?? poId}</span>
              </div>

              <div className="pay-row">
                <span className="pay-label">Supplier</span>
                <span className="pay-value">{po?.supplier?.name ?? "—"}</span>
              </div>

              <div className="pay-row">
                <span className="pay-label">Warehouse</span>
                <span className="pay-value">{po?.warehouse?.locationName ?? "—"}</span>
              </div>

              <div className="pay-divider" />

              <div className="pay-row pay-row--big">
                <span className="pay-label">Amount</span>
                <span className="pay-value">{amountLabel} <span className="pay-currency">CAD</span></span>
              </div>

              <div className="pay-row">
                <span className="pay-label">Status</span>
                <span className="pay-status">Pending Payment</span>
              </div>

              <div className="pay-note">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                <span>
                  Secure payment powered by Stripe. Card details never touch our servers.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: Stripe Card Form */}
          <Card className="pay-card pay-card--dark">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                Card Payment
              </CardTitle>
            </CardHeader>

            <CardContent>
              {!clientSecret || creatingIntent ? (
                <div className="text-slate-300 flex items-center gap-2">
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
