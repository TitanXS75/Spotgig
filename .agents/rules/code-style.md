# Code Style & Workflow Rules — Aaspass

## 🎯 Agent & Skill Efficiency
- **Token Conservation**: Load specialized skills in `.agents/skills/` ONLY when required for that specific task domain (database, UI, payments, state, or maps) to prevent token bloat.
- Read only relevant file ranges instead of dumping entire large directories into context.

## TypeScript

- **Strict mode** is enabled. Never use `any` — prefer `unknown` + type guards.
- Import types with `import type { ... }` when not used at runtime.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Use exhaustive switch-case with `never` for enums.

## React

- Functional components only. No class components.
- Use named exports for components, default export for page-level components.
- Props interfaces named `<Component>Props` (e.g., `ListingCardProps`).
- Prefer composition over prop drilling — use Zustand or context for deep state.
- Use `React.lazy()` + `Suspense` for code-splitting large pages.

## Imports

- Always use the `@/` path alias (never relative `../../`).
- Order: React → third-party → `@/lib` → `@/hooks` → `@/store` → `@/components` → local.
- No barrel exports (`index.ts`) — import directly from the module file.

## Styling

- Use Tailwind utility classes. No inline `style={{}}` unless dynamic values.
- Use `cn()` from `@/lib/utils` to merge conditional classes.
- Design tokens live in `index.css` as CSS custom properties.
- shadcn/ui components in `components/ui/` are auto-generated — do NOT edit.

## State Management

- Zustand for global UI state only.
- TanStack Query for all server data. Never store API data in Zustand.
- Mutations must invalidate relevant query keys.

## API Layer

- All Supabase calls go through `src/lib/api/*.ts`.
- Never call `supabase.from(...)` directly in components.
- Always handle errors — show toast via `sonner` on failure.
- Use RPC functions for complex queries (nearby, search).

## Security

- NEVER expose `service_role` key or any API secret in client code.
- All `VITE_*` vars are PUBLIC — treat them as such.
- Server-side secrets go in Supabase Edge Function environment.
- Always validate user input with Zod on the client AND RLS on the server.
