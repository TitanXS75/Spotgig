# Aaspass — Agent Instructions

> Hyperlocal freelancing platform connecting student talent with local business needs.

## Quick Context

- **Repo**: `TitanXS75/Aaspass`
- **Stack**: React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Supabase
- **Port**: Dev server runs on `7000`
- **Path alias**: `@/` → `src/`

## Before You Code

1. Read `.agents/SKILL.md` for architecture, conventions, and database schema.
2. Read `.agents/rules/code-style.md` for styling and naming rules.
3. Check `todo.txt` for current active work items.
4. Check `docs/PRD.md` for product requirements and roadmap.
5. Check `docs/ARCHITECTURE.md` for system design decisions.

## 🎯 Skill Usage Rule
- **Use skills ONLY when strictly required for the specific task at hand to avoid unnecessary context expansion and token bloat.**
- Dedicated skills available under `.agents/skills/`:
  - `supabase-database`: For DB schema, RLS policies, migrations, and Edge Functions.
  - `frontend-tailwind-shadcn`: For UI styling, shadcn components, and Framer Motion.
  - `state-tanstack-zustand`: For query invalidation, caching, and store separation.
  - `razorpay-payments`: For payment order creation and HMAC verification.
  - `leaflet-maps`: For interactive map pins, popup previews, and geolocation.

## Key Decisions Already Made

- **No SSR** — This is a client-side SPA (Vite, not Next.js).
- **Supabase only** — No custom backend. All logic lives in RLS policies + Edge Functions.
- **Cloudinary** for images — NOT Supabase Storage.
- **Razorpay** for payments — Indian payment gateway (INR only).
- **Zustand** for client state, **TanStack Query** for server state.

## What NOT To Do

- Don't install a new state management library (no Redux, no MobX).
- Don't add SSR or server components.
- Don't store API secrets in `VITE_*` environment variables.
- Don't edit `components/ui/*` shadcn files manually.
- Don't use `supabase.from()` directly in React components — use `lib/api/`.
- Don't preload all skill files at once — invoke them on-demand only.
