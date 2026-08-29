# Changelog

All notable changes to the Aaspass project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### 🔧 In Progress
- Razorpay payment integration (Edge Functions)
- Admin panel migration to live Supabase data
- Forgot password flow with `supabase.auth.resetPasswordForEmail`

### 📋 Planned
- LinkedIn/GitHub profile verification
- Team formation for freelancers
- In-app messaging / chat
- Hindi language support
- Push notifications (PWA)

---

## [1.0.0] — 2026-08-01

### Added
- **Authentication**: Email/password signup + Google OAuth via Supabase Auth
- **Listing CRUD**: Multi-step onboarding form with validation
- **Nearby Discovery**: GPS-based feed sorted by distance (Haversine)
- **Map View**: Interactive Leaflet map with listing markers
- **Categories**: 13 skill categories with emoji icons
- **Search**: Full-text search powered by PostgreSQL tsvector
- **Filters**: Type (product/service), operating type (home/shop), distance slider
- **Favorites**: Toggle bookmarks on listings
- **Reviews & Ratings**: 1–5 star ratings with text comments
- **Comments**: Community discussion threads on listings
- **Upvote/Downvote**: Quality signals for listings
- **View Counter**: Track listing popularity
- **Image Upload**: Cloudinary integration with compression and gallery support
- **Profile Management**: Avatar, name, phone, gender
- **Pricing Page**: Subscription plans (₹100/₹200 monthly, ₹1200/₹2000 yearly)
- **Admin Panel**: User and listing management dashboard
- **Static Pages**: Landing, About, Contact, Privacy, Terms, Safety Tips, FAQ
- **Dark Mode**: System-aware theme toggle (next-themes)
- **PWA Support**: Installable as mobile app
- **Database**: Full PostgreSQL schema with 14 migration files
- **RLS Policies**: Row Level Security on all tables
- **Edge Functions**: Cloudinary delete function (server-side)

### Technical
- React 18 + TypeScript + Vite 5
- Tailwind CSS v3 + shadcn/ui component library
- Zustand for client state (persisted)
- TanStack Query v5 for server state
- Framer Motion + Lenis for animations
- React Hook Form + Zod for form validation
- Vitest + Testing Library + Playwright for testing
