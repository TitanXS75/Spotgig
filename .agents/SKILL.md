---
name: aaspass
description: >
  Hyperlocal freelancing platform connecting students/freelancers with local
  clients. Use this skill when working on any Aaspass feature, bug fix, or
  architectural change.
---

# Aaspass — Agent Skill

## Project Identity

Aaspass (Spotgig) is a **freelancing and real-world project collaboration platform**. It connects college students and emerging developers with clients and business owners anywhere (remote-first, hybrid, or local) for real projects, verified experience, and fair compensation.

## Tech Stack — Quick Reference

| Concern           | Technology                              |
| ----------------- | --------------------------------------- |
| Language          | TypeScript 5.x (strict)                |
| Framework         | React 18 + Vite 5                       |
| Styling           | Tailwind CSS v3 + shadcn/ui            |
| Animations        | Framer Motion + Lenis scroll            |
| State             | Zustand (persisted via `zustand/middleware`) |
| Data Fetching     | TanStack Query v5                       |
| Routing           | React Router DOM v6                     |
| Backend           | Supabase (Auth + PostgreSQL + Edge Fn)  |
| Maps              | React Leaflet (OpenStreetMap tiles)     |
| Image Uploads     | Cloudinary (unsigned preset)            |
| Payments          | Razorpay                                |
| Forms             | React Hook Form + Zod validation        |
| Icons             | Lucide React                            |
| Testing           | Vitest + Testing Library + Playwright   |
| Dev Server Port   | `7000`                                  |

## Architecture Rules

1. **No SSR** — Pure client-side SPA. Vite serves static files.
2. **Supabase is the entire backend** — No custom Express/Node server.
3. **RLS is mandatory** — Every table has Row Level Security policies.
   Never bypass with `service_role` key on the client.
4. **Edge Functions for secrets** — Razorpay secret key and Cloudinary
   API secret live ONLY in Supabase Edge Functions (Deno), never in
   `VITE_*` env vars.
5. **Cloudinary for media** — Supabase Storage is NOT used.
6. **Path alias** — Use `@/` for imports (maps to `src/`).

## File Structure Conventions

```
src/
├── components/        # Reusable UI (TopBar, BottomNav, ListingCard …)
│   └── ui/            # shadcn/ui primitives — DO NOT edit manually
├── pages/             # Route-level page components
├── lib/               # Pure logic, API clients, utilities
│   ├── api/           # Supabase API wrappers (listings, auth, etc.)
│   ├── db-types.ts    # Auto-generated Supabase types
│   ├── supabase.ts    # Supabase client singleton
│   └── utils.ts       # cn() and common helpers
├── hooks/             # Custom React hooks (use-*.ts)
├── store/             # Zustand store (app-store.ts)
└── test/              # Unit + integration tests
sqldb/                 # Numbered SQL migration files (run in order)
supabase/functions/    # Deno Edge Functions
```

## Naming Conventions

- **Files**: `kebab-case.ts` for modules, `PascalCase.tsx` for React
  components/pages.
- **Hooks**: Always prefixed `use-` (e.g., `use-favorites.ts`).
- **API modules**: Named after the resource (e.g., `listings.ts`,
  `auth.ts`).
- **SQL files**: Numbered `00_` → `13_` for ordered execution.

## Database Schema — Key Tables

| Table        | Purpose                                  |
| ------------ | ---------------------------------------- |
| `profiles`   | Mirrors `auth.users` (trigger-created)   |
| `listings`   | Products/services posted by freelancers  |
| `favorites`  | User ↔ listing bookmarks                |
| `reviews`    | Star ratings (1–5) + text               |
| `comments`   | Discussion threads on listings           |
| `payments`   | Razorpay transaction log                 |

## Key Supabase RPC Functions

- `get_listings_nearby(lat, lng, radius_km)` — Haversine distance query
- `search_listings(query)` — Full-text search with `tsvector`
- `toggle_favorite(listing_id)` — Atomic toggle returning new state
- `activate_listing(listing_id, plan, payment_id)` — Post-payment activation
- `increment_listing_views(listing_id)` — Fire-and-forget view counter

## Common Patterns

### Adding a New Page
1. Create `src/pages/MyPage.tsx`
2. Add route in `App.tsx` under `<Routes>`
3. If it's a "static" page (no TopBar/BottomNav), add path to `staticPages` array

### Adding a New API Call
1. Create function in `src/lib/api/<resource>.ts`
2. Wrap with TanStack Query hook if needed
3. Always type with `Database['public']['Tables'][...]`

### Zustand Store
- Persist only essentials (user, location, preferences)
- Use `partialize` to exclude transient UI state
- Access via `useAppStore()` hook

## Environment Variables

All client-side vars MUST be prefixed `VITE_`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`
- `VITE_RAZORPAY_KEY_ID`

Server-side secrets (Edge Functions only):
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_SECRET`

## Testing

```bash
npm run test          # Vitest unit tests
npm run test:watch    # Watch mode
npx playwright test   # E2E tests
```

## Build & Deploy

```bash
npm run dev           # http://localhost:7000
npm run build         # Production bundle → dist/
npm run preview       # Preview production build
```

## Current TODOs (Active Work)

1. **Razorpay integration** — Wire Edge Functions for order creation + webhook verification
2. **Admin panel** — Migrate from hardcoded data to live Supabase queries
3. **Forgot password** — Implement `supabase.auth.resetPasswordForEmail`
