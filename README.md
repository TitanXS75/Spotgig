# Aaspass — Hyperlocal Marketplace

**Aaspass** (meaning *nearby* in Hindi) is a mobile-first web app that connects buyers with home-based sellers in their neighbourhood. Think of it as a local discovery feed — buyers can find handmade food, crafts, tailoring, tutoring, and other home-based products or services within walking distance, and contact sellers directly on WhatsApp or Instagram.

---

## What It Does

- 📍 **Location-aware feed** — shows listings sorted by distance from the user's current location (falls back to city centre if permission is denied).
- 🔍 **Search & filter** — search by keyword, filter by category (Food, Fashion, Services, etc.) or type (Product / Service), and set a max distance radius.
- 🃏 **Listing cards** — each card shows the seller's area, distance, contact channels, and tags at a glance.
- 📄 **Listing detail page** — full description, seller info, view count, and one-tap WhatsApp / Instagram contact buttons.
- 🗂️ **Categories page** — browse all available categories with emoji icons.
- 🗺️ **Map view** — placeholder for a future map-based discovery experience.
- 👤 **Profile page** — buyer / seller profile overview.
- 🛍️ **Seller onboarding** — a 3-step flow for home sellers to create a listing (details → contact & location → review & pay). Pricing starts at ₹100/month.

---


## Key Features & Design Decisions

- **Privacy-first** — seller exact addresses are never shown; only the area name and approximate distance are displayed.
- **Dual contact channels** — sellers can list a WhatsApp number and/or Instagram handle; buyers tap once to connect.
- **Emoji-based listing identity** — sellers pick an emoji as their listing avatar, keeping onboarding lightweight with no image upload required.
- **Distance calculated client-side** — the Haversine formula is used in `src/lib/distance.ts` for fast, dependency-free distance sorting.
- **Smooth animations** — Framer Motion drives card entrance, layout transitions, and the step-based onboarding flow.

---

## Target Audience

Home-based sellers (cooks, tailors, tutors, craftspeople) in Indian cities who don't have a formal shopfront, and buyers who prefer supporting local micro-entrepreneurs close to home.
