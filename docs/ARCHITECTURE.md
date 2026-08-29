# Aaspass — Architecture Document

> **Version**: 1.0  
> **Last Updated**: August 2026  
> **Type**: Client-Side SPA with BaaS (Backend-as-a-Service)

---

## 1. System Overview

Aaspass is a **single-page application** (SPA) built with React and backed
entirely by **Supabase** (PostgreSQL + Auth + Edge Functions). There is no
custom backend server — all business logic lives in PostgreSQL functions,
Row Level Security (RLS) policies, and Supabase Edge Functions.

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                             │
│                                                                     │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  React   │  │  Zustand   │  │ TanStack │  │  React Router    │  │
│  │ (Pages + │  │  (Client   │  │  Query   │  │  (Client-side    │  │
│  │  Comp.)  │  │   State)   │  │  (Cache) │  │   Routing)       │  │
│  └────┬─────┘  └──────┬─────┘  └────┬─────┘  └──────────────────┘  │
│       │               │              │                               │
│       └───────────────┴──────────────┘                               │
│                        │                                             │
│              src/lib/api/*.ts                                        │
│              (API Abstraction Layer)                                  │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE CLOUD                              │
│                                                                     │
│  ┌──────────┐  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Auth   │  │ PostgreSQL │  │ Edge Funcs   │  │   Realtime   │  │
│  │ (Email,  │  │ (Tables +  │  │ (Deno/TS)    │  │  (Planned)   │  │
│  │  OAuth)  │  │  RLS + RPC)│  │              │  │              │  │
│  └──────────┘  └────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────┐       ┌──────────────────┐
│   CLOUDINARY     │       │    RAZORPAY      │
│ (Image CDN)      │       │ (Payments)       │
└──────────────────┘       └──────────────────┘
```

---

## 2. Architecture Decisions (ADRs)

### ADR-001: Client-Side SPA over SSR/SSG

**Decision**: Use Vite + React (pure SPA) instead of Next.js.

**Context**: Aaspass is a logged-in marketplace. All meaningful content
requires authentication and location data. There's minimal SEO value in
listing pages since they're user-generated and location-specific.

**Consequences**:
- ✅ Simpler deployment (static hosting)
- ✅ Faster dev iteration (no SSR complexity)
- ✅ Lower hosting cost
- ⚠️ SEO limited to static pages (landing, about, pricing)
- ⚠️ No ISR/SSG for listing pages

**References**: [Remix vs Next.js vs Vite](https://remix.run/blog/remix-vs-next),
[When to use an SPA](https://www.joshwcomeau.com/react/server-components/)

---

### ADR-002: Supabase as Sole Backend

**Decision**: Use Supabase (Auth + PostgreSQL + Edge Functions) with no
custom Node/Express server.

**Context**: For an MVP targeting Indian Tier-2/3 cities, infrastructure
complexity must be minimized. Supabase provides auth, database, RLS, and
serverless functions in one platform with a generous free tier.

**Consequences**:
- ✅ Zero server management
- ✅ Built-in auth (email, Google, phone)
- ✅ Row Level Security eliminates custom middleware
- ✅ Edge Functions for secret operations (payments, image deletion)
- ⚠️ Vendor lock-in to Supabase/PostgreSQL
- ⚠️ Complex business logic must be expressed as SQL functions

**References**: [Supabase Architecture](https://supabase.com/docs/guides/getting-started/architecture)

---

### ADR-003: Cloudinary over Supabase Storage

**Decision**: Use Cloudinary for all image uploads and transformations.

**Context**: User-uploaded images (listing photos, avatars) need
on-the-fly resizing, compression, and format conversion. Cloudinary
provides this out of the box. Supabase Storage would require manual
image processing pipelines.

**Consequences**:
- ✅ Automatic WebP/AVIF conversion
- ✅ URL-based transformations (resize, crop, quality)
- ✅ CDN delivery worldwide
- ✅ Unsigned uploads for client-side simplicity
- ⚠️ Deletion requires server-side API secret → Edge Function
- ⚠️ Free tier limited to 25K transformations/month

**References**: [Cloudinary React SDK](https://cloudinary.com/documentation/react_integration)

---

### ADR-004: Zustand + TanStack Query (State Split)

**Decision**: Use Zustand for client state and TanStack Query for server
state. Never mix the two.

**Context**: A common anti-pattern is storing fetched API data in a
global store. This leads to stale data, manual cache invalidation, and
complexity. TanStack Query handles caching, refetching, and
optimistic updates. Zustand handles UI state (theme, filters, location).

**Consequences**:
- ✅ Server state is always fresh
- ✅ Automatic background refetch on focus
- ✅ Zustand store stays small and fast
- ✅ Devtools for both (React Query Devtools + Zustand)
- ⚠️ Must remember to invalidate queries after mutations

**References**:
[TanStack Query vs Redux](https://tkdodo.eu/blog/react-query-as-a-state-manager),
[Zustand vs Jotai vs Recoil](https://blog.logrocket.com/zustand-vs-jotai-vs-recoil/)

---

### ADR-005: Row Level Security (RLS) as Authorization Layer

**Decision**: All authorization is enforced at the database level via
PostgreSQL RLS policies.

**Context**: Since there's no custom backend, the Supabase client
connects directly from the browser. Without RLS, any authenticated user
could read/modify any row. RLS policies ensure users can only access
their own data.

**Consequences**:
- ✅ Authorization is impossible to bypass from client
- ✅ No middleware or API route guards needed
- ✅ Policies are auditable in SQL
- ⚠️ Complex policies can be hard to debug
- ⚠️ Must test policies carefully (edge cases)

**References**: [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

### ADR-006: Razorpay for Indian Payments

**Decision**: Use Razorpay (not Stripe) for payment processing.

**Context**: Aaspass targets Indian users paying in INR. Razorpay is the
dominant payment gateway in India with UPI, card, net banking, and wallet
support. Stripe's India support is limited and requires international
entity registration.

**Consequences**:
- ✅ Native UPI support (dominant payment method in India)
- ✅ Lower fees (2% vs Stripe's 2.9% + ₹3)
- ✅ Familiar to Indian users
- ⚠️ India-only (can't support international payments)
- ⚠️ Webhook verification needs server-side secret → Edge Function

**References**: [Razorpay Web Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/)

---

## 3. Data Flow Diagrams

### 3.1 Authentication Flow

```
User → AuthPage.tsx → supabase.auth.signUp() / signInWithOAuth()
  → Supabase Auth → Email verification / Google OAuth
  → onAuthStateChange callback → Zustand setUser()
  → Auto-create profile via PostgreSQL trigger (11_triggers.sql)
```

### 3.2 Listing Creation Flow

```
User → SellerOnboarding.tsx (multi-step form)
  → Step 1: Basic Info (name, category, type)
  → Step 2: Details (description, tags, contact)
  → Step 3: Location (GPS or manual entry)
  → Step 4: Images (Cloudinary upload)
  → Step 5: Plan Selection (free trial / paid)
  → Step 6: Payment (Razorpay checkout)
  → supabase.from('listings').insert(...)
  → activate_listing() RPC after payment
  → Listing appears on map/feed
```

### 3.3 Nearby Discovery Flow

```
User opens /home → use-location.ts requests GPS
  → Browser Geolocation API → coordinates
  → get_listings_nearby(lat, lng, radius_km) RPC
  → PostgreSQL Haversine calculation
  → Returns listings sorted by distance
  → TanStack Query caches result
  → ListingCard grid renders
```

### 3.4 Image Upload Flow

```
User selects image → use-cloudinary-upload.ts
  → Client-side compression (sharp/canvas)
  → POST to Cloudinary (unsigned preset)
  → Returns CDN URL (https://res.cloudinary.com/...)
  → URL stored in listings.image_url or profiles.avatar_url
  
Deletion:
  → Client calls Supabase Edge Function: cloudinary-delete
  → Edge Function uses API Secret to call Cloudinary Admin API
  → Image removed from CDN
```

---

## 4. Database Architecture

### Entity-Relationship Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   profiles   │     │   listings   │     │   payments   │
│──────────────│     │──────────────│     │──────────────│
│ id (PK/FK)   │────▶│ user_id (FK) │     │ user_id (FK) │
│ full_name    │     │ id (PK)      │◀────│ listing_id   │
│ avatar_url   │     │ name         │     │ amount       │
│ phone        │     │ type         │     │ plan         │
│ gender       │     │ category     │     │ status       │
│ is_admin     │     │ area / lat   │     │ razorpay_*   │
└──────────────┘     │ lng          │     └──────────────┘
                     │ image_url    │
                     │ status       │
                     │ plan         │
                     └──────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────▼─────┐ ┌────▼────┐ ┌──────▼──────┐
        │ favorites  │ │ reviews │ │  comments   │
        │────────────│ │─────────│ │─────────────│
        │ user_id    │ │ user_id │ │ user_id     │
        │ listing_id │ │ listing │ │ listing_id  │
        │            │ │ rating  │ │ text        │
        └────────────┘ │ comment │ └─────────────┘
                       └─────────┘
```

### Key Indexes
- `listings_location_idx` — GiST index for spatial queries
- `listings_search_idx` — GIN index on tsvector for full-text search
- `listings_user_status_idx` — Composite for "my listings" queries
- `favorites_unique_idx` — Prevents duplicate bookmarks

### RLS Policy Summary
| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Own row | Auto (trigger) | Own row | Never |
| listings | Live only (public) | Authenticated | Own listings | Own listings |
| favorites | Own only | Authenticated | Never | Own only |
| reviews | All (public) | Authenticated | Own only | Own only |
| payments | Own only | Authenticated | Never | Never |

---

## 5. Security Architecture

### Client-Side (PUBLIC)
```
VITE_SUPABASE_URL         → Supabase project URL
VITE_SUPABASE_ANON_KEY    → Public anon key (RLS-protected)
VITE_CLOUDINARY_CLOUD_NAME → Cloud name (public)
VITE_CLOUDINARY_UPLOAD_PRESET → Unsigned preset name
VITE_RAZORPAY_KEY_ID      → Public key ID (cannot charge without secret)
```

### Server-Side (SECRETS — Edge Functions only)
```
CLOUDINARY_API_KEY         → Required for deletion/admin ops
CLOUDINARY_API_SECRET      → Required for signed operations
RAZORPAY_KEY_SECRET        → Required for order creation + webhook verification
SUPABASE_SERVICE_ROLE_KEY  → Full database access (admin only)
```

### Security Controls
1. **RLS policies** on every table (enforced by PostgreSQL)
2. **Anon key** has limited permissions (can't bypass RLS)
3. **Edge Functions** run server-side for secret operations
4. **Zod validation** on all form inputs (client-side)
5. **HMAC verification** for Razorpay webhook signatures
6. **Location privacy** — Only area name shown, exact coords hidden

---

## 6. Deployment Architecture

```
┌─────────────────────┐
│   GitHub Repository  │
│   (TitanXS75/Aaspass)│
└──────────┬──────────┘
           │ git push
           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Vercel / Netlify   │     │   Supabase Cloud    │
│  (Static Hosting)   │     │   (BaaS)            │
│                     │     │                     │
│  • Vite build →     │     │  • PostgreSQL DB    │
│    dist/ folder     │     │  • Auth service     │
│  • SPA fallback     │     │  • Edge Functions   │
│    (all → index.html)│    │  • Realtime (WS)    │
│  • CDN + HTTPS      │     │                     │
└─────────────────────┘     └─────────────────────┘
           │                          │
           │         ┌────────────────┘
           ▼         ▼
┌──────────────────────────────────────┐
│          END USER BROWSER            │
│  (React SPA loaded from CDN)         │
└──────────────────────────────────────┘
```

---

## 7. Performance Strategy

| Strategy | Implementation |
|----------|---------------|
| **Code Splitting** | `React.lazy()` for route-level pages |
| **Image Optimization** | Cloudinary auto-format (WebP/AVIF) |
| **Query Caching** | TanStack Query with stale-while-revalidate |
| **State Persistence** | Zustand `persist` for location/preferences |
| **Bundle Size** | Vite tree-shaking + SWC for fast transforms |
| **Font Loading** | `display=swap` for Inter (no FOUT) |
| **Smooth Scrolling** | Lenis for 60fps scroll performance |
| **Animation** | Framer Motion with `layout` animations |

---

## References

- [Supabase Architecture Docs](https://supabase.com/docs/guides/getting-started/architecture)
- [Vite Configuration Guide](https://vitejs.dev/config/)
- [TanStack Query Architecture](https://tanstack.com/query/latest/docs/framework/react/overview)
- [PostgreSQL RLS Best Practices](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_images)
- [Razorpay Server Integration](https://razorpay.com/docs/payments/server-integration/)
- [Clean Architecture for React Apps](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [The Twelve-Factor App](https://12factor.net/)
