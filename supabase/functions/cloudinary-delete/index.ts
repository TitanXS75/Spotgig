// ============================================================
// supabase/functions/cloudinary-delete/index.ts
// Supabase Edge Function — runs server-side.
// Deletes an image from Cloudinary using the Admin API.
// The CLOUDINARY_API_SECRET is NEVER sent to the browser.
//
// Deploy with:
//   npx supabase functions deploy cloudinary-delete
//
// Set secrets with:
//   npx supabase secrets set CLOUDINARY_CLOUD_NAME=your_cloud
//   npx supabase secrets set CLOUDINARY_API_KEY=your_key
//   npx supabase secrets set CLOUDINARY_API_SECRET=your_secret
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CLOUD_NAME  = Deno.env.get('CLOUDINARY_CLOUD_NAME')!;
const API_KEY     = Deno.env.get('CLOUDINARY_API_KEY')!;
const API_SECRET  = Deno.env.get('CLOUDINARY_API_SECRET')!;

// ── CORS headers ─────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

// ── SHA-1 helper (Web Crypto API — available in Deno) ────────

async function sha1Hex(message: string): Promise<string> {
  const msgBuffer  = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray  = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Build Cloudinary signed params ───────────────────────────

async function buildSignature(
  publicId:  string,
  timestamp: number
): Promise<string> {
  // String to sign: param=value pairs sorted alphabetically + API secret
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
  return sha1Hex(stringToSign);
}

// ── Main handler ─────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: CORS_HEADERS }
    );
  }

  try {
    // ── 1. Authenticate the caller ───────────────────────────
    // The client must send its Supabase JWT so only logged-in
    // users can delete images.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized — invalid token' }),
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // ── 2. Parse request body ────────────────────────────────
    const body = await req.json() as { publicId?: string };
    const { publicId } = body;

    if (!publicId || typeof publicId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing publicId in request body' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // ── 3. Security: ensure the publicId belongs to this user ─
    // All Aaspass images are stored under aaspass/listings/{userId}/...
    // or aaspass/avatars/{userId}/...
    // This prevents a user from deleting another user's images.
    const ownershipCheck =
      publicId.startsWith(`aaspass/listings/${user.id}/`) ||
      publicId.startsWith(`aaspass/avatars/${user.id}/`);

    if (!ownershipCheck) {
      return new Response(
        JSON.stringify({ error: 'Forbidden — you do not own this image' }),
        { status: 403, headers: CORS_HEADERS }
      );
    }

    // ── 4. Build Cloudinary signed delete request ────────────
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await buildSignature(publicId, timestamp);

    const form = new URLSearchParams();
    form.append('public_id',  publicId);
    form.append('timestamp',  timestamp.toString());
    form.append('api_key',    API_KEY);
    form.append('signature',  signature);

    // ── 5. Call Cloudinary Admin API ─────────────────────────
    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    form.toString(),
      }
    );

    const cloudinaryData = await cloudinaryRes.json() as { result?: string; error?: { message: string } };

    if (!cloudinaryRes.ok || cloudinaryData.error) {
      throw new Error(cloudinaryData.error?.message || 'Cloudinary delete failed');
    }

    if (cloudinaryData.result !== 'ok') {
      // 'not found' means already deleted — treat as success
      if (cloudinaryData.result !== 'not found') {
        throw new Error(`Unexpected result from Cloudinary: ${cloudinaryData.result}`);
      }
    }

    // ── 6. Return success ────────────────────────────────────
    return new Response(
      JSON.stringify({ success: true, result: cloudinaryData.result }),
      { status: 200, headers: CORS_HEADERS }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[cloudinary-delete]', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
