---
name: supabase-database
description: Expert patterns for Supabase backend development in Aaspass, including PostgreSQL schema, RLS policies, RPC functions, Haversine geospatial calculations, and Deno Edge Functions.
---

# Supabase & PostgreSQL Skill — Aaspass

## When to Use
Load this skill when writing SQL migrations, creating PostgreSQL RPC functions, configuring Row Level Security (RLS) policies, or developing Supabase Edge Functions.

---

## 1. Schema & Migration Rules

- All migrations live in `sqldb/` named with two-digit prefixes (`00_` to `99_`).
- Every table MUST have:
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())` (for mutable tables)
- Always use `CASCADE` on `FOREIGN KEY (user_id) REFERENCES auth.users(id)` or appropriate parent tables where appropriate.

---

## 2. Row Level Security (RLS) Patterns

Every table MUST have RLS enabled:
```sql
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;
```

### Standard Policy Patterns

#### Public Read (e.g. Live Listings / Reviews)
```sql
CREATE POLICY "Public can view live listings"
ON public.listings FOR SELECT
USING (status = 'live' OR auth.uid() = user_id);
```

#### Owner CRUD (e.g. Listings, Profiles, Favorites)
```sql
-- Insert
CREATE POLICY "Users can create their own listings"
ON public.listings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update
CREATE POLICY "Users can update their own listings"
ON public.listings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Delete
CREATE POLICY "Users can delete their own listings"
ON public.listings FOR DELETE
USING (auth.uid() = user_id);
```

#### Admin Override
```sql
CREATE POLICY "Admins have full access"
ON public.listings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);
```

---

## 3. Geospatial & Haversine Search

Use indexed Haversine distance in PostgreSQL RPC functions for fast radius queries without heavy GIS dependencies:

```sql
CREATE OR REPLACE FUNCTION get_listings_nearby(
  user_lat FLOAT8,
  user_lng FLOAT8,
  radius_km FLOAT8 DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category TEXT,
  area TEXT,
  lat FLOAT8,
  lng FLOAT8,
  distance_km FLOAT8
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    l.id,
    l.name,
    l.category,
    l.area,
    l.lat,
    l.lng,
    (
      6371 * acos(
        least(1.0, greatest(-1.0,
          cos(radians(user_lat)) * cos(radians(l.lat)) *
          cos(radians(l.lng) - radians(user_lng)) +
          sin(radians(user_lat)) * sin(radians(l.lat))
        ))
      )
    ) AS distance_km
  FROM public.listings l
  WHERE l.status = 'live'
    AND (
      radius_km = 0 OR
      (
        6371 * acos(
          least(1.0, greatest(-1.0,
            cos(radians(user_lat)) * cos(radians(l.lat)) *
            cos(radians(l.lng) - radians(user_lng)) +
            sin(radians(user_lat)) * sin(radians(l.lat))
          ))
        )
      ) <= radius_km
    )
  ORDER BY distance_km ASC;
$$;
```

---

## 4. Deno Edge Functions (Server-Side Secrets)

- Edge Functions run in Deno runtime under `supabase/functions/`.
- Handle CORS headers on every response (OPTIONS preflight support).
- Retrieve secrets securely via `Deno.env.get('SECRET_KEY')`.
- Validate caller JWT token when user context is required:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // Business logic with server secrets...

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
```
