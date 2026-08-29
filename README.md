# Aaspass — Hyperlocal Freelancing Platform

> **Bridge the gap between student talent and real client needs in Tier-2 and Tier-3 Indian cities.**

Aaspass is a **location-aware freelancing marketplace** that connects:

- 🏢 **Clients** — Business owners, entrepreneurs, and coaches who need websites, apps, designs, or tech help
- 🎓 **Freelancers** — College students (B.Tech, MBA, BCA) & vibe coders looking for real project experience and income

---

## 📚 Project Documentation

| Document | Description |
|---|---|
| 📋 [**PRD**](file:///d:/Projects/Aaspass/docs/PRD.md) | Full Product Requirements Document, user personas, roadmap, KPIs |
| 🏛️ [**Architecture**](file:///d:/Projects/Aaspass/docs/ARCHITECTURE.md) | Architecture Decision Records (ADRs), data flows, security model |
| 🗄️ [**Database Guide**](file:///d:/Projects/Aaspass/docs/DATABASE.md) | PostgreSQL schema, ER diagrams, RLS policies, indexing strategy |
| 🔌 [**API Reference**](file:///d:/Projects/Aaspass/docs/API.md) | Complete frontend API abstraction & RPC function reference |
| 🎨 [**Design System**](file:///d:/Projects/Aaspass/docs/DESIGN_SYSTEM.md) | Color palettes, typography, responsive breakpoints, motion design |
| 🧪 [**Testing Guide**](file:///d:/Projects/Aaspass/docs/TESTING.md) | Unit testing, hooks, component tests, and E2E guide |
| 🚀 [**Deployment Guide**](file:///d:/Projects/Aaspass/docs/DEPLOYMENT.md) | Production setup on Vercel, Supabase, Cloudinary, Razorpay |
| 🤖 [**Agent Guidelines**](file:///d:/Projects/Aaspass/.agents/AGENTS.md) | Rules and instructions for AI agents and automated coding |
| 🛠️ [**Agent Skill**](file:///d:/Projects/Aaspass/.agents/SKILL.md) | Technical cheatsheet for agents working on this codebase |
| 🤝 [**Contributing**](file:///d:/Projects/Aaspass/CONTRIBUTING.md) | Git workflow, commit conventions, PR process |
| 🔒 [**Security Policy**](file:///d:/Projects/Aaspass/SECURITY.md) | Vulnerability disclosure, boundaries, best practices |
| 📝 [**Changelog**](file:///d:/Projects/Aaspass/CHANGELOG.md) | Version history & release notes |

---

## 🚀 Key Differentiators

| Feature | Description |
|---|---|
| 📍 **Hyperlocal (GPS)** | Find freelancers & clients in your local area with zero distance guesswork |
| 👥 **Solo or Team** | Freelancers can work individually or assemble student squads for large gigs |
| 🔗 **Trust & Verification** | LinkedIn & GitHub profile links for verified student credibility |
| 💼 **Zero Commission** | Flat subscription only — no 20% commission cuts like traditional platforms |
| 🗺️ **Interactive Map** | Visual discovery of nearby talent and projects using Leaflet maps |
| 📱 **PWA Support** | Install directly onto mobile devices with native-like responsiveness |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript (Strict) |
| **Build & Dev** | Vite 5 (runs on port `7000`) |
| **Styling** | Tailwind CSS v3 + shadcn/ui + Radix UI |
| **Animations** | Framer Motion + Lenis Smooth Scroll |
| **State Management** | Zustand (Client UI state) + TanStack Query v5 (Server state) |
| **Backend & DB** | Supabase (PostgreSQL + RLS + Auth + Edge Functions) |
| **Image CDN** | Cloudinary (unsigned preset + server-side deletion) |
| **Payments** | Razorpay (INR subscriptions via UPI, Cards, Netbanking) |
| **Maps** | React Leaflet + OpenStreetMap |
| **Testing** | Vitest + React Testing Library + Playwright |

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js** 18+
- A **Supabase** project
- A **Cloudinary** account

### 2. Installation
```bash
git clone https://github.com/TitanXS75/Aaspass.git
cd Aaspass
npm install
```

### 3. Set Environment Variables
Copy `.env.example` to `.env.local` and set your credentials:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=aaspass_unsigned
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
```

### 4. Database Setup
Run the SQL files in order from `sqldb/` (`00_enums.sql` through `13_admin_setup.sql`) inside your Supabase SQL Editor. See [Database Guide](file:///d:/Projects/Aaspass/docs/DATABASE.md) for details.

### 5. Run Dev Server
```bash
npm run dev
# App will be live at http://localhost:7000
```

---

## 🧭 Routes & Pages

| Path | Description |
|---|---|
| `/` | Landing Page with hero, features, and value props |
| `/home` | Main feed with distance filter, search, category pills |
| `/categories` | Comprehensive category browser (13 skills) |
| `/map` | Interactive map view of nearby freelancers/projects |
| `/listing/:id` | Detailed listing view with reviews, comments, and contact CTA |
| `/seller/onboarding` | Multi-step listing creation & plan selection |
| `/profile` | User profile, active listings & bookmarks |
| `/auth` | Authentication (Email/Password + Google OAuth) |
| `/adminauth75` | Protected administrative moderation portal |
| `/pricing` | Transparent flat subscription plans |

---

## 🧪 Testing

```bash
npm run test          # Run Vitest unit tests
npm run test:watch    # Watch mode
npx playwright test   # Run end-to-end browser tests
```

---

## 📄 License

Distributed under the [MIT License](file:///d:/Projects/Aaspass/LICENSE). © 2024-2026 Aaspass (TitanXS75).
