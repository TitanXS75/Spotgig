# Aaspass — Supabase SQL Files

Run these files **in order** in the Supabase SQL Editor.
Each file is safe to re-run (idempotent).

## Run Order

| # | File | Description |
|---|------|-------------|
| 1 | `00_enums.sql` | Custom PostgreSQL types/enums |
| 2 | `01_profiles.sql` | Profiles table (mirrors auth.users) |
| 3 | `02_listings.sql` | Listings table (core table) |
| 4 | `03_favorites.sql` | Favorites table |
| 5 | `04_reviews.sql` | Reviews & star ratings table |
| 6 | `05_comments.sql` | Community comments table |
| 7 | `06_votes.sql` | Votes (thumbs up/down) table |
| 8 | `07_payments.sql` | Razorpay payments table |
| 9 | `08_indexes.sql` | Performance indexes + full-text search |
| 10 | `09_rls_policies.sql` | Row Level Security policies |
| 11 | `10_functions.sql` | PostgreSQL functions (nearby, search, etc.) |
| 12 | `11_triggers.sql` | Auto triggers (profile creation, updated_at) |

> **Note:** `12_storage_policies.sql` is **NOT needed**.
> Image uploads use **Cloudinary** — Supabase Storage is not used.

---

## Image Uploads — Cloudinary Setup

All images (listing logos, gallery, profile pictures) are stored in
**Cloudinary**, not Supabase Storage.

### Step 1 — Create Cloudinary Account
Sign up free at [cloudinary.com](https://cloudinary.com).

### Step 2 — Create an Unsigned Upload Preset
1. Cloudinary Dashboard → **Settings** → **Upload**
2. Scroll to **Upload Presets** → **Add upload preset**
3. Set **Signing mode** to `Unsigned`
4. Set preset name to `aaspass_unsigned`
5. (Optional) Under **Folder**, set `aaspass` as default folder
6. Click **Save**

### Step 3 — Set Environment Variables
Copy `.env.example` to `.env.local` and fill in:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=aaspass_unsigned
```

### Step 4 — Deploy the Delete Edge Function
The **Cloudinary API Secret** is never exposed to the browser.
Deletions go through a Supabase Edge Function:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
npx supabase login

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_ID

# Set the secret environment variables (server-side only)
npx supabase secrets set CLOUDINARY_CLOUD_NAME=your_cloud_name
npx supabase secrets set CLOUDINARY_API_KEY=your_api_key
npx supabase secrets set CLOUDINARY_API_SECRET=your_api_secret

# Deploy the function
npx supabase functions deploy cloudinary-delete
```

---

## After Running SQL Files

Generate TypeScript types:
```bash
npx supabase login
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/db-types.ts
```

---

## Cloudinary Folder Structure

```
aaspass/
  listings/
    {userId}/
      {listingId}/
        logo         ← main image / banner
        gallery_0    ← supportive image 1
        gallery_1    ← supportive image 2
        gallery_2    ← supportive image 3
  avatars/
    {userId}/
      profile        ← profile picture
```

Each slot overwrites the previous image (no accumulation of orphaned files).
