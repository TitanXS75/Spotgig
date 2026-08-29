# Aaspass — Product Requirements Document (PRD)

> **Version**: 1.0  
> **Last Updated**: August 2026  
> **Owner**: TitanXS75  
> **Status**: Active Development

---

## 1. Executive Summary

Aaspass is a **hyperlocal freelancing marketplace** designed for Tier-2 and Tier-3 Indian cities. It connects college students and early-career freelancers with local business owners and professionals who need tech/creative work done — websites, apps, design, marketing, and more.

Unlike global platforms (Upwork, Fiverr), Aaspass emphasizes **geographic proximity**, making it possible to meet in person, build trust, and collaborate on local projects.

### Vision
> *Every student with a skill should be able to earn from it within their own city.*

### Mission
Build the simplest, most trustworthy way for local businesses to discover and hire nearby student freelancers.

---

## 2. Problem Statement

### For Students / Freelancers
- **No portfolio, no credibility** — Fresh graduates can't compete on global platforms
- **No local discovery** — Clients in their own city don't know they exist
- **Commission cuts** — Platforms like Fiverr take 20% of earnings
- **Remote-only bias** — Most platforms ignore the value of physical proximity

### For Clients / Business Owners
- **Can't find affordable talent** — Agencies charge ₹50K+ for a basic website
- **Trust issues** — Hiring strangers online feels risky
- **No tech literacy** — Business owners in small cities don't know how to use Upwork
- **Want someone nearby** — Prefer meeting face-to-face before committing

---

## 3. Target Users

### Persona 1: Freelancer ("Raj")
- **Age**: 19–25
- **Profile**: B.Tech 2nd year, knows React, wants real project experience
- **Pain**: Zero portfolio, can't get hired on Upwork
- **Goal**: Land local projects, build portfolio, earn ₹5K–15K/month part-time

### Persona 2: Client ("Sharma Ji")
- **Age**: 35–55
- **Profile**: Runs a coaching center, needs a website and social media presence
- **Pain**: Agencies quoted ₹80K, doesn't trust remote freelancers
- **Goal**: Get a clean website for ₹10K from a trustworthy, nearby student

---

## 4. Core Features

### 4.1 Authentication & Profiles
| Feature | Description | Status |
|---------|-------------|--------|
| Email/Password Auth | Supabase Auth with email verification | ✅ Done |
| Google OAuth | One-click social login | ✅ Done |
| Role Selection | Client vs Freelancer at signup | ✅ Done |
| Profile Management | Name, phone, avatar, gender | ✅ Done |
| LinkedIn/GitHub Linking | Social proof for trust | 📋 Planned |
| Forgot Password | Email-based password recovery | 🔧 In Progress |

### 4.2 Listings (Products & Services)
| Feature | Description | Status |
|---------|-------------|--------|
| Create Listing | Multi-step onboarding with validation | ✅ Done |
| Edit Listing | Full edit with image management | ✅ Done |
| Categories | 13 skill categories with icons | ✅ Done |
| Type Toggle | Product vs Service filter | ✅ Done |
| Operating Type | Home-based vs Shop-based filter | ✅ Done |
| Image Upload | Cloudinary with compression + cropping | ✅ Done |
| Gallery Images | Up to 3 supportive images | ✅ Done |
| Tags | Free-form skill tags | ✅ Done |
| Pricing Display | Price + unit (per hour, per project, etc.) | ✅ Done |
| Listing Status | Pending → Live → Suspended lifecycle | ✅ Done |

### 4.3 Discovery & Search
| Feature | Description | Status |
|---------|-------------|--------|
| Nearby Feed | Distance-sorted listing cards | ✅ Done |
| Map View | Interactive Leaflet map with markers | ✅ Done |
| Full-Text Search | PostgreSQL tsvector search | ✅ Done |
| Category Filter | Filter by skill category | ✅ Done |
| Distance Filter | Slider-based radius filter (km) | ✅ Done |
| Sort Options | Distance vs Newest | ✅ Done |

### 4.4 Engagement
| Feature | Description | Status |
|---------|-------------|--------|
| Favorites | Toggle bookmarks on listings | ✅ Done |
| Reviews & Ratings | 1–5 star ratings with text | ✅ Done |
| Comments | Community discussion on listings | ✅ Done |
| Upvote/Downvote | Community quality signal | ✅ Done |
| View Counter | Track listing popularity | ✅ Done |

### 4.5 Payments & Monetization
| Feature | Description | Status |
|---------|-------------|--------|
| Subscription Plans | Monthly (₹100/200) and Yearly (₹1200/2000) | ✅ Done (UI) |
| Free Trial | 7-day no-card trial | ✅ Done (UI) |
| Razorpay Integration | Payment processing | 🔧 In Progress |
| Payment Verification | Server-side HMAC verification | 📋 Planned |
| Zero Commission | No cut from project payments | ✅ Policy |

### 4.6 Administration
| Feature | Description | Status |
|---------|-------------|--------|
| Admin Dashboard | User/listing management | ✅ Done (UI) |
| Content Moderation | Approve/suspend/delete listings | 🔧 In Progress |
| Admin Auth | Protected admin route (`/adminauth75`) | ✅ Done |
| Live Data Migration | Admin reads real Supabase data | 🔧 In Progress |

---

## 5. User Flows

### 5.1 Freelancer Onboarding
```
Landing Page → Sign Up (select "Freelancer") → Verify Email
→ Create Listing (multi-step form) → Choose Plan / Start Trial
→ Pay via Razorpay → Listing goes Live → Appear on Map
```

### 5.2 Client Discovery
```
Landing Page → Sign Up (select "Client") → Allow Location
→ Browse Nearby Feed → Filter by Category/Distance
→ View Listing Detail → Contact via WhatsApp/Instagram
→ Optionally: Leave Review, Comment, Favorite
```

### 5.3 Map Discovery
```
Home → Map Tab → See Nearby Markers → Tap Marker
→ View Listing Card → Navigate to Detail
```

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Performance** | First Contentful Paint < 1.5s |
| **Mobile-First** | All pages responsive down to 320px |
| **PWA** | Installable as mobile app |
| **Accessibility** | WCAG 2.1 AA compliance |
| **SEO** | Meta tags, OG tags on all public pages |
| **Security** | RLS on all tables, no client-side secrets |
| **Offline** | Graceful degradation (show cached data) |
| **i18n** | English-first, Hindi planned for v2 |

---

## 7. Monetization Strategy

### Revenue Model: Subscription-Only (Zero Commission)

| Plan | Freelancer | Client |
|------|-----------|--------|
| Free Trial | 7 days | 7 days |
| Monthly | ₹100/month | ₹200/month |
| Yearly | ₹1,200/year (save 17%) | ₹2,000/year (save 17%) |

### Why Zero Commission?
- Builds trust with price-sensitive student freelancers
- Differentiator from Fiverr (20% commission) and Upwork (5-20%)
- Simple, predictable pricing for small-town users

---

## 8. Roadmap

### Phase 1 — MVP (Current) ✅
- Core listing CRUD with Supabase
- GPS-based nearby discovery
- Map view with Leaflet
- Auth with email + Google OAuth
- Cloudinary image uploads
- shadcn/ui design system

### Phase 2 — Monetization 🔧
- Razorpay payment integration
- Subscription activation flow
- Admin moderation tools
- Forgot password flow

### Phase 3 — Growth 📋
- LinkedIn/GitHub profile verification
- Team formation (freelancers can group up)
- In-app messaging / chat
- Push notifications (web + PWA)
- Hindi language support
- Referral program

### Phase 4 — Scale 🔮
- Mobile app (React Native or Expo)
- AI-powered skill matching
- Project bidding system
- Escrow payments
- Analytics dashboard for freelancers

---

## 9. Success Metrics (KPIs)

| Metric | Target (6 months) |
|--------|-------------------|
| Registered Users | 5,000 |
| Active Listings | 1,000 |
| Monthly Active Users | 2,000 |
| Paid Subscribers | 200 |
| Average Rating | > 4.0 stars |
| Retention (30-day) | > 40% |

---

## 10. Competitive Analysis

| Feature | Aaspass | Fiverr | Upwork | UrbanClap |
|---------|---------|--------|--------|-----------|
| Hyperlocal (GPS) | ✅ | ❌ | ❌ | ✅ |
| Student-focused | ✅ | ❌ | ❌ | ❌ |
| Zero commission | ✅ | ❌ (20%) | ❌ (5-20%) | ❌ |
| Map discovery | ✅ | ❌ | ❌ | ❌ |
| Tier-2/3 cities | ✅ | ❌ | ❌ | Partial |
| Team formation | 📋 | ❌ | ❌ | ❌ |
| Affordable pricing | ₹100/mo | $5+/gig cut | $49/mo + % | High cut |

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low initial supply (freelancers) | No listings to show | Seed with college partnerships, campus ambassadors |
| Trust issues (new platform) | Users won't transact | LinkedIn verification, reviews, safety guidelines |
| Payment failures (Razorpay) | Revenue loss | Webhook retry logic, manual verification fallback |
| Location privacy concerns | Users won't share GPS | Only show area name publicly, exact coords hidden |
| Competition from big platforms | User acquisition cost | Hyperlocal niche focus, ₹100/month affordability |

---

## References

- [Fiverr Business Model Analysis](https://fourweekmba.com/fiverr-business-model/)
- [Upwork Revenue Model](https://productmint.com/upwork-business-model/)
- [India Freelancing Market Report (NASSCOM)](https://nasscom.in/)
- [Hyperlocal Marketplace Design Patterns](https://www.nngroup.com/articles/marketplace-ux/)
- [Supabase Auth Best Practices](https://supabase.com/docs/guides/auth)
- [Razorpay Integration Guide](https://razorpay.com/docs/payments/server-integration/)
