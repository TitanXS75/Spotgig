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
3. Read `.agents/rules/prompt-upgrade-and-skills.md` for prompt enhancement & skill selection workflows.
4. Check `todo.txt` for current active work items.
5. Check `docs/PRD.md` for product requirements and roadmap.
6. Check `docs/ARCHITECTURE.md` for system design decisions.

## 🎯 Prompt Upgrading & Skill Selection
- **Autonomous Prompt Upgrading**: Elevate every user request into a comprehensive, production-grade technical specification covering edge cases, type safety, UX, performance, and security.
- **Proactive Skill Activation**: For every task, analyze matching domain skills from workspace (`.agents/skills/`) and global configuration (`C:\Users\Dell\.gemini\config\skills/`), read their `SKILL.md` when needed, and apply expert patterns.

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
