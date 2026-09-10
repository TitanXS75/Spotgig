# Contributing to Aaspass

Thank you for your interest in contributing to Aaspass! This guide will help
you get set up and submit quality contributions.

---

## 📋 Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **Git** ([download](https://git-scm.com/))
- A **Supabase** project ([supabase.com](https://supabase.com/))
- A **Cloudinary** account ([cloudinary.com](https://cloudinary.com/))
- (Optional) **Razorpay** test keys ([razorpay.com](https://razorpay.com/))

---

## 🚀 Getting Started

### 1. Fork & Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/Aaspass.git
cd Aaspass
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase + Cloudinary credentials
```

### 4. Set Up Database

Run the SQL files from `sqldb/` **in order** (00 → 13) in the
[Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).

See `sqldb/README.md` for detailed instructions.

### 5. Start Development Server

```bash
npm run dev
# Opens at http://localhost:7000
```

---

## 🌿 Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `dev` | Integration branch |
| `feat/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `refactor/<name>` | Code improvements |
| `docs/<name>` | Documentation updates |

### Workflow

```bash
# Always branch from dev
git checkout dev
git pull origin dev
git checkout -b feat/my-feature

# Make changes, commit, push
git add .
git commit -m "feat: add chat messaging UI"
git push origin feat/my-feature

# Open PR: feat/my-feature → dev
```

---

## 📝 Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add listing search autocomplete
fix: correct distance calculation for edge cases
refactor: extract CloudinaryUploader component
docs: update API section in ARCHITECTURE.md
chore: bump TanStack Query to v5.84
test: add unit tests for use-favorites hook
style: fix inconsistent button spacing on mobile
```

---

## 🧪 Testing

### Run Tests

```bash
npm run test          # Unit tests (Vitest)
npm run test:watch    # Watch mode
npx playwright test   # E2E tests (requires browser install)
```

### Writing Tests

- Place unit tests next to their source: `src/hooks/use-favorites.test.ts`
- Place integration tests in: `src/test/`
- Use `@testing-library/react` for component tests
- Use `vitest` mocks for Supabase client

---

## 🎨 Code Style

### Quick Rules

- **TypeScript** — Strict mode, no `any`
- **React** — Functional components only, hooks for logic
- **Imports** — Use `@/` alias, never relative `../../`
- **Styling** — Tailwind CSS only, use `cn()` for conditional classes
- **State** — Zustand for UI state, TanStack Query for server state
- **API** — All Supabase calls in `src/lib/api/*.ts`

See `.agents/rules/code-style.md` for the full style guide.

### Linting

```bash
npm run lint          # ESLint check
```

---

## 📦 Project Structure

```
src/
├── components/        # Reusable UI components
│   └── ui/            # shadcn/ui primitives (auto-generated, don't edit)
├── pages/             # Route-level page components
├── lib/               # Pure logic, utilities, API clients
│   ├── api/           # Supabase API wrappers
│   ├── db-types.ts    # Auto-generated database types
│   └── supabase.ts    # Supabase client singleton
├── hooks/             # Custom React hooks (use-*.ts)
├── store/             # Zustand global store
└── test/              # Integration tests

docs/                  # Project documentation
sqldb/                 # SQL migration files (numbered)
supabase/functions/    # Deno Edge Functions
```

---

## 🔒 Security Checklist

Before submitting a PR, verify:

- [ ] No API secrets in `VITE_*` environment variables
- [ ] No `supabase.from()` calls directly in components (use `lib/api/`)
- [ ] Form inputs validated with Zod
- [ ] New tables have RLS policies
- [ ] No `console.log()` left in production code
- [ ] No hardcoded credentials or URLs

---

## 📮 Pull Request Process

1. **Create a descriptive PR title** using conventional commit format
2. **Fill out the PR template** (description, screenshots, testing)
3. **Ensure all checks pass** (lint, tests, build)
4. **Request review** from maintainers
5. **Address feedback** promptly
6. **Squash and merge** when approved

### PR Template

```markdown
## What does this PR do?
Brief description of the change.

## Screenshots (if UI change)
Before | After

## How to test
1. Step-by-step testing instructions
2. ...

## Checklist
- [ ] Tests pass (`npm run test`)
- [ ] Lint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No new TypeScript errors
- [ ] Security checklist reviewed
```

---

## 🐛 Bug Reports

Use GitHub Issues with the `bug` label. Include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Screenshots / console errors**
5. **Browser & OS version**

---

## 💡 Feature Requests

Use GitHub Issues with the `enhancement` label. Include:

1. **Problem statement** — What user problem does this solve?
2. **Proposed solution** — How should it work?
3. **Alternatives considered** — What else did you consider?

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the
[MIT License](./LICENSE).

---

## 🙏 Thank You!

Every contribution makes Aaspass better for students and local businesses.
We appreciate your time and effort!
