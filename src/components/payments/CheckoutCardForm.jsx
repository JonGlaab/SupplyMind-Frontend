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
    setError("");

    if (!stripe || !elements) return;

    setIsPaying(true);

    // Stripe confirms the PaymentIntent created by your backend
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // you can redirect to a “success page” if you want
        return_url: `${window.location.origin}/payments/success?poId=${poId}`,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed. Please try again.");
      setIsPaying(false);
      return;
    }

    // If no redirect required -> success
    setSuccess(true);
    setIsPaying(false);
  };

  return (
    <div className="space-y-4">
      {success ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Payment successful for {amountLabel} CAD
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement />

        <Button type="submit" className="w-full" disabled={!stripe || isPaying}>
          {isPaying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Pay {amountLabel} CAD
        </Button>

        <p className="text-xs text-slate-400 text-center uppercase tracking-widest">
          Secure Handshake Active
        </p>
      </form>
    </div>
  );
}
