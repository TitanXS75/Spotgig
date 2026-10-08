# Spotgig (Aaspass) — Project Overview & Architecture Guide

> **Tagline:** Freelancing & project collaboration platform connecting student talent with clients and businesses anywhere (remote, nationwide, or local).

---

## 1. Executive Summary & Identity

**Spotgig (Aaspass)** is a talent marketplace engineered to bridge the gap between skilled college students/emerging developers and businesses that need real projects built.

It empowers businesses, startups, and clients anywhere to discover and work with verified, affordable student talent, enabling transparent collaboration, verified experience, and zero-commission transactions.

---

## 2. Problem Statement & Value Proposition

### The Problem
* **For College Students & Early-Career Freelancers:**
  * Inability to compete on saturated global platforms without an established international track record.
  * Steep commission cuts (up to 20% on Fiverr/Upwork).
  * Lack of discovery: Local businesses right next door do not know student talent is available.
* **For Local Business Owners & Small Enterprises:**
  * Traditional software agencies charge steep fees (often ₹50,000+) for straightforward websites, design work, or social media management.
  * Hesitation and mistrust around hiring completely anonymous, remote freelancers.
  * Complex, dollar-denominated interfaces that are intimidating for small business owners.

### The Spotgig Solution
* **Work From Anywhere:** Talent & projects can connect remotely across any city, with optional local meeting preferences.
* **Zero Commission:** Spotgig charges 0% commission on client-to-freelancer transactions. Freelancers keep 100% of their earnings.
* **Direct Communication:** Seamless WhatsApp and messaging integration for direct, low-friction client inquiries.
* **Affordable & Fair Monetization:** Free at start; configurable client limits and flat pricing when monetization is activated.

---

## 3. Target User Personas

| Persona | Demographics | Core Need | Platform Role |
|---|---|---|---|
| **Raj (The Student Freelancer)** | 19–25 yrs old; B.Tech/BCA/Design student | Build a portfolio, gain real-world industry experience, and earn ₹5,000–₹15,000/month part-time. | Posts listings (products/services), joins student squads, connects social profiles (GitHub/LinkedIn). |
| **Sharma Ji (The Local Client)** | 35–55 yrs old; Coaching institute, clinic, or local shop owner | Needs an affordable website, digital flyers, or social media marketing from a nearby person he can meet and trust. | Browses nearby listings via feed or interactive map, filters by radius/category, contacts directly via WhatsApp. |

---

## 4. Key Platform Features

1. **Location-Based Discovery (Haversine Formula):**
   * Real-time GPS distance calculation via PostgreSQL RPC function `get_listings_nearby(lat, lng, radius_km)`.
   * Distance slider allowing users to filter talent within 1 km, 5 km, 15 km, 50 km, etc.
2. **Interactive Map Exploration:**
   * Leaflet & OpenStreetMap integration with custom markers and instant popup previews.
3. **13 Curated Skill Categories:**
   * Web Development, App Development, Graphic Design, Video Editing, UI/UX Design, Social Media Marketing, Content Writing, SEO, AI Tools & Automation, Hardware/IT Support, Tutoring, Photo & Videography, and Consulting.
4. **Solo & Squad Listings:**
   * Freelancers can list as individual creators or form student squads to take on larger agency-scale projects.
5. **Engagement & Social Proof:**
   * 1–5 star ratings and reviews.
   * Community comment threads on listings.
   * Favorite bookmarks and upvote/downvote signals.
   * View counter for listing analytics.
6. **Authentication & Trust:**
   * Email/Password authentication + Google OAuth powered by Supabase Auth.
   * Role selection on onboarding (`Client` vs `Freelancer`).
   * GitHub and LinkedIn verification for student credibility.

---

## 5. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | React 18 + Vite 5 | Strict TypeScript; runs on port `7000` |
| **Styling & UI** | Tailwind CSS v3 + shadcn/ui + Radix UI | Mobile-first responsive design (down to 320px) |
| **Animations & FX** | Framer Motion + Lenis | Micro-interactions and smooth scrolling |
| **Client State** | Zustand | Lightweight client UI state with local storage persistence |
| **Server State / Cache** | TanStack Query v5 | Auto-caching, optimistic updates, and background refetching |
| **Backend & Database** | Supabase | Managed PostgreSQL, Row Level Security (RLS), Supabase Auth |
| **Serverless Secrets** | Supabase Deno Edge Functions | Razorpay order creation and webhook verification |
| **Media & Assets** | Cloudinary | Unsigned uploads, auto-compression, and responsive cropping |
| **Payments** | Razorpay | Subscriptions in INR (Cards, UPI, Netbanking) |
| **Mapping Engine** | React Leaflet + OpenStreetMap | GPS map pins and interactive radius searches |
| **Testing** | Vitest + React Testing Library + Playwright | Unit, integration, and end-to-end tests |

---

## 6. Architecture & System Design Rules

```
┌─────────────────────────────────────────────────────────────┐
│                      Aaspass Frontend                       │
│  React 18 + Vite 5 (Port 7000) + TypeScript (Strict)        │
│  Tailwind CSS v3 + shadcn/ui + Framer Motion + Lenis        │
│  Zustand (Client UI State) + TanStack Query v5 (Server API) │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
        Direct SDK/REST                 Uploads Preset
               ▼                               ▼
┌──────────────────────────────┐    ┌─────────────────────────┐
│     Supabase Platform        │    │    Cloudinary CDN       │
│ • Auth (Email + Google)      │    │ • Image Compression     │
│ • PostgreSQL Database        │    │ • Profile & Gig Media   │
│ • Row-Level Security (RLS)   │    └─────────────────────────┘
│ • RPC Functions (Haversine)  │
│ • Deno Edge Functions        │──────────────┐
└──────────────────────────────┘              │ Edge Invocation
                                              ▼
                                    ┌─────────────────────────┐
                                    │    Razorpay Gateway     │
                                    │ • INR Subscriptions     │
                                    │ • Webhook Verifications │
                                    └─────────────────────────┘
```

### Critical Architecture Boundaries:
1. **Client-Side SPA Only:** No Server-Side Rendering (SSR) and no custom Express/Node server. Vite delivers static production bundles.
2. **Supabase as the Single Source of Truth:** All data access goes through `src/lib/api/` and is guarded by PostgreSQL Row Level Security (RLS).
3. **No Secrets in Client Code:** Razorpay secret keys and Cloudinary secret keys reside only in Supabase Deno Edge Functions, never in client `VITE_*` environment variables.
4. **Cloudinary for Media:** Supabase Storage is not utilized; image uploads and CDN hosting run through Cloudinary.
5. **Path Aliasing:** Use `@/` which strictly maps to `src/`.

---

## 7. Database Model & Core Tables

* **`profiles`**: Linked to `auth.users` via trigger; stores role (`client` or `freelancer`), name, avatar, bio, phone, and social URLs.
* **`listings`**: Core gigs/services posted by freelancers containing title, description, category, tags, pricing, lat/lng coordinates, operating type (home vs shop), and status (`pending`, `live`, `suspended`).
* **`favorites`**: User-to-listing bookmark relations.
* **`reviews`**: 1-to-5 star ratings, feedback text, and timestamps.
* **`comments`**: Community discussions and Q&A on individual listings.
* **`payments`**: Razorpay transaction and subscription logs.

### Key Database RPC Functions:
* `get_listings_nearby(lat, lng, radius_km)`: Distance-filtered search using Haversine calculation.
* `search_listings(query)`: Full-text search with `tsvector`.
* `toggle_favorite(listing_id)`: Atomic toggle returning new bookmark state.
* `increment_listing_views(listing_id)`: Fire-and-forget view count increment.

---

## 8. Application Routes

| Path | Component | Description |
|---|---|---|
| `/` | `LandingPage.tsx` | High-converting landing page with hero, features, and value props |
| `/home` | `HomePage.tsx` | Main talent feed with distance filter, search bar, and category filters |
| `/map` | `MapPage.tsx` | Full-screen interactive Leaflet map with nearby freelancer pins |
| `/categories` | `CategoriesPage.tsx` | 13-category directory browser |
| `/listing/:id` | `ListingDetailPage.tsx` | Complete listing view with photo carousel, reviews, and direct WhatsApp contact |
| `/seller/onboarding` | `SellerOnboarding.tsx` | Multi-step gig creation wizard and plan selection |
| `/profile` | `ProfilePage.tsx` | Personal profile management, active listings, and bookmarks |
| `/pricing` | `PricingPage.tsx` | Subscription pricing breakdown (Trial, Monthly, Yearly) |
| `/auth` | `AuthPage.tsx` | Email/password sign-in/up and Google OAuth |
| `/adminauth75` | `adminauth75.tsx` | Protected admin management and moderation portal |

---

## 9. Monetization Model

Aaspass operates on a **zero-commission, pure subscription model**:

| Plan | Freelancer | Client | Features |
|---|---|---|---|
| **Free Trial** | Free for 7 days | Free for 7 days | Full listing creation and discovery access |
| **Monthly** | ₹100 / month | ₹200 / month | Live listing, map visibility, unlimited leads |
| **Yearly** | ₹1,200 / year (Save 17%) | ₹2,000 / year (Save 17%) | Priority badge, featured placement, top ranking |

---

## 10. Development Status & Next Steps

* [x] Core listing CRUD and multi-step seller onboarding
* [x] Geolocation distance filtering and interactive Leaflet map
* [x] Supabase Auth & Google OAuth integration
* [x] Cloudinary image uploads and transformations
* [x] shadcn/ui design system with dark/light themes
* [ ] **Razorpay Edge Functions:** Deploy Deno functions for server-side order generation and HMAC signature verification (`create-razorpay-order` & `verify-razorpay-payment`).
* [ ] **Admin Panel Live Migration:** Connect `/adminauth75` to real Supabase tables for live listing moderation and user suspension.
* [ ] **Live Forgot Password Flow:** Connect `supabase.auth.resetPasswordForEmail` on the recovery page.
