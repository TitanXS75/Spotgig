import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/db-types';

type Payment = Database['public']['Tables']['payments']['Row'];

// Pricing constants
export const PRICING = {
  monthly: { amount: 10000, label: '₹100 / month' },   // in paise
  yearly:  { amount: 120000, label: '₹1,200 / year' }, // in paise
} as const;

/**
 * Create a Razorpay order via your backend/edge function.
 * TODO: Call your Edge Function / Express endpoint that creates the order.
 */
export async function createPaymentOrder(
  listingId: string,
  plan: 'monthly' | 'yearly'
) {
  // TODO: Replace with your actual backend endpoint URL
  // The backend should:
  //   1. Create a Razorpay order (via Razorpay Node SDK)
  //   2. Insert a 'pending' payments row in Supabase
  //   3. Return { orderId, amount, currency }
  const response = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listingId, plan, amount: PRICING[plan].amount }),
  });
  if (!response.ok) throw new Error('Failed to create payment order');
  return response.json() as Promise<{ orderId: string; amount: number; currency: string }>;
}

/**
 * Verify and confirm a Razorpay payment via your backend/edge function.
 * On success, the backend sets payment status → 'paid' and listing status → 'live'.
 */
export async function verifyPayment(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  listingId: string;
}) {
  // TODO: Replace with your actual backend endpoint URL
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error('Payment verification failed');
  return response.json() as Promise<{ success: boolean }>;
}

/** Get payment history for the current user. */
export async function getMyPayments(): Promise<Payment[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Payment[];
}
