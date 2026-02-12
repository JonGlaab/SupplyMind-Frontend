import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "../ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function CheckoutCardForm({ poId, amountLabel }) {
  const stripe = useStripe();
  const elements = useElements();

  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsPaying(true);
    setError("");

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setError(error.message || "Payment failed. Please try again.");
      setIsPaying(false);
      return;
    }

    setSuccess(true);
    setIsPaying(false);
  };

  return (
    <div className="space-y-4">
      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Payment submitted for {amountLabel}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement />

        <Button type="submit" disabled={!stripe || isPaying} className="w-full">
          {isPaying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pay {amountLabel}
        </Button>

        <p className="text-xs text-slate-500 text-center uppercase tracking-widest">
          Secure Handshake Active
        </p>
      </form>
    </div>
  );
}
