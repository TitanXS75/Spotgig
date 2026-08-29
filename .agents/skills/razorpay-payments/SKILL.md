---
name: razorpay-payments
description: Secure Razorpay payment integration patterns for Aaspass subscriptions, Edge Function order generation, client SDK checkout modal, and HMAC signature verification.
---

# Razorpay Payments Skill — Aaspass

## When to Use
Load this skill when integrating, modifying, or testing the subscription billing flow, Razorpay Edge Functions, or payment verification handlers.

---

## 1. Core Architecture & Security Rules

1. **Amount in Paise**: All Razorpay transactions use smallest currency unit (INR Paise). ₹100 = `10000`, ₹1200 = `120000`.
2. **Never expose Key Secret**: `RAZORPAY_KEY_SECRET` must ONLY exist in Supabase Edge Function environment variables. Client only receives public `VITE_RAZORPAY_KEY_ID`.
3. **Order Pre-creation**: Never open Razorpay checkout modal with ad-hoc client amounts. Always generate an official `order_id` on the server before presenting checkout.
4. **Server-Side HMAC Verification**: A payment is ONLY marked `paid` after verifying `crypto.subtle` HMAC SHA256 signature in the Edge Function.

---

## 2. Server Edge Function: `create-razorpay-order`

```typescript
// supabase/functions/create-razorpay-order/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { listingId, plan, amountPaise } = await req.json();

  const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

  const basicAuth = btoa(`${keyId}:${keySecret}`);
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: `rcpt_${listingId.slice(0, 10)}`,
      notes: { listing_id: listingId, plan },
    }),
  });

  const order = await response.json();
  return new Response(JSON.stringify(order), { headers: { "Content-Type": "application/json" } });
});
```

---

## 3. Client Checkout Integration Pattern

```tsx
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export async function initiateRazorpayPayment({
  listingId,
  plan,
  amountInPaise,
  userEmail,
  userName,
  onSuccess,
}: {
  listingId: string;
  plan: 'monthly' | 'yearly';
  amountInPaise: number;
  userEmail: string;
  userName: string;
  onSuccess: () => void;
}) {
  try {
    // 1. Create order on server
    const { data: order, error: orderErr } = await supabase.functions.invoke('create-razorpay-order', {
      body: { listingId, plan, amountPaise: amountInPaise },
    });
    if (orderErr || !order?.id) throw new Error("Could not initialize order");

    // 2. Open Razorpay Checkout Dialog
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Aaspass",
      description: `${plan === 'monthly' ? 'Monthly' : 'Yearly'} Plan Subscription`,
      order_id: order.id,
      prefill: { name: userName, email: userEmail },
      theme: { color: "#22c55e" }, // Aaspass Brand Green
      handler: async (res: RazorpayResponse) => {
        // 3. Verify payment signature on server
        const { data: verifyData, error: verifyErr } = await supabase.functions.invoke('verify-razorpay-payment', {
          body: {
            listingId,
            plan,
            razorpay_order_id: res.razorpay_order_id,
            razorpay_payment_id: res.razorpay_payment_id,
            razorpay_signature: res.razorpay_signature,
          },
        });

        if (verifyErr || !verifyData?.success) {
          toast.error("Payment verification failed. Please contact support.");
          return;
        }

        toast.success("Subscription activated! Your listing is now live.");
        onSuccess();
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  } catch (err: any) {
    toast.error(err.message || "Failed to initiate payment");
  }
}
```
