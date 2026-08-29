import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import crypto from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, listing_id } = await req.json();

    const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!key_secret) {
      throw new Error('Razorpay keys missing');
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new Error('Invalid signature');
    }

    // Payment is verified
    // Initialize Supabase admin client to update listing status
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (supabaseUrl && supabaseServiceKey && listing_id) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Update listing to 'live'
      const { error } = await supabase
        .from('listings')
        .update({ status: 'live' })
        .eq('id', listing_id);
        
      if (error) throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
