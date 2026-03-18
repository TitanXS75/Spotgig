# Setup & Configuration Guide

Complete guide to set up and configure the Aaspass backend.

## 🔧 Prerequisites

- **Node.js** 18+ (verify with `node --version`)
- **Bun** or **npm** (project uses npm)
- **Git** for version control
- **Supabase account** (free tier available at supabase.com)
- **Razorpay account** (for payments, test mode available)

---

## 📦 Installation

### 1. Clone Repository
```bash
cd c:\Users\Dell\Documents\Aaspass
git init
git add .
git commit -m "Initial commit"
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
```

### 3. Start Development Server
```bash
npm run dev
# App runs at http://localhost:5173
```

---

## 🗄️ Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Select region (e.g., Singapore for India)
4. Wait for project to be ready

### 2. Create Database Tables

Go to SQL Editor and run:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Auth trigger for profiles (auto-create profile on signup)
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
begin
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  return new;
end;
$$;

-- Profiles Table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone text UNIQUE,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Listings Table
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  seller_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('product', 'service')),
  category text NOT NULL,
  description text,
  tags text[] DEFAULT ARRAY[]::text[],
  whatsapp text,
  instagram text,
  area text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  emoji text DEFAULT '🏪',
  image_url text,
  price numeric,
  price_unit text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'live', 'suspended')),
  plan text DEFAULT 'monthly' CHECK (plan IN ('monthly', 'yearly')),
  plan_expires_at timestamp,
  views integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  CONSTRAINT valid_coordinates CHECK (lat >= -90 AND lat <= 90 AND lng >= -180 AND lng <= 180)
);

-- Favorites Table
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Reviews Table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Payments Table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  plan text NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  razorpay_order_id text,
  razorpay_payment_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at timestamp DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_listings_user_id ON public.listings(user_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_lat_lng ON public.listings(lat, lng);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_reviews_listing_id ON public.reviews(listing_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);

-- Row-level security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Listings: Published listings viewable by all
CREATE POLICY "Live listings are viewable by everyone" ON public.listings FOR SELECT USING (status = 'live');
CREATE POLICY "Users can see their own listings" ON public.listings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own listings" ON public.listings FOR UPDATE USING (auth.uid() = user_id);

-- Favorites: Private to user
CREATE POLICY "Users can manage their own favorites" ON public.favorites USING (auth.uid() = user_id);

-- Reviews: Public read, own write
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- Payments: Private to user
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- Trigger for profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_listings_timestamp BEFORE UPDATE ON public.listings 
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
```

### 3. Set Up Storage

1. Go to **Storage** in Supabase dashboard
2. Create new bucket: `listing-images`
3. Set to **Public**
4. Add CORS policy:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "HEAD", "PUT", "POST"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

### 4. Get API Keys

In **Project Settings → API**:
- Copy `Project URL` → `VITE_SUPABASE_URL`
- Copy `anon` key → `VITE_SUPABASE_ANON_KEY`

---

## 💳 Razorpay Setup

### 1. Create Account
1. Go to [razorpay.com](https://razorpay.com)
2. Sign up and verify email
3. Go to **Settings → API Keys**
4. Under **Key ID**, copy your test key

### 2. Environment Variable
```env
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
```

### 3. Test Credentials
For testing payments:
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits

---

## 🌍 Environment Variables

Create `.env.local` in project root:

```env
# Supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX

# Optional: API endpoints (for backend integration)
# VITE_API_URL=http://localhost:3000
```

**⚠️ Never commit `.env.local` to git!** It's in `.gitignore`.

---

## 📝 TypeScript Types

Generate types from your Supabase schema:

```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Generate types
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/db-types.ts
```

Or in `.env` add:
```env
SUPABASE_ACCESS_TOKEN=your_access_token
```

Then run:
```bash
npm run types:generate  # Add this script to package.json
```

---

## 🧪 Running Tests

### Unit & Integration Tests
```bash
# Run once
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test -- --coverage
```

Test files:
- `src/test/location.test.ts` - Location calculations
- `src/test/api.test.ts` - API structure validation
- `src/test/hooks.test.ts` - Custom hooks
- `src/test/e2e.test.ts` - E2E scenarios

### E2E Tests (Playwright)
```bash
# Install Playwright
npm install --save-dev @playwright/test
npx playwright install

# Create playwright.config.ts (see BACKEND.md for full config)

# Run E2E tests
npx playwright test

# View results
npx playwright show-report
```

---

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── api/              # API layer
│   │   ├── auth.ts       # Authentication
│   │   ├── listings.ts   # Listings
│   │   ├── favorites.ts  # Favorites
│   │   ├── reviews.ts    # Reviews
│   │   ├── payments.ts   # Payments
│   │   ├── storage.ts    # Image upload
│   │   ├── location.ts   # Geolocation
│   │   └── supabase.ts   # Supabase client
│   ├── db-types.ts       # Auto-generated types
│   ├── distance.ts       # Distance utilities
│   ├── utils.ts          # Helpers
│   └── mock-data.ts      # Mock data
├── hooks/                # Custom React hooks
│   ├── use-favorites.ts
│   ├── use-reviews.ts
│   ├── use-location.ts
│   ├── use-image-upload.ts
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── components/           # React components
├── pages/                # Page components
├── store/                # Global state (Zustand)
├── test/                 # Unit & E2E tests
└── App.tsx               # Main component
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in production
- [ ] Database backups enabled in Supabase
- [ ] RLS policies reviewed and tested
- [ ] Error handling and logging reviewed
- [ ] Tests passing (`npm run test`)
- [ ] Build succeeding (`npm run build`)
- [ ] API keys rotated if exposed
- [ ] CORS configured correctly
- [ ] Rate limiting implemented for APIs
- [ ] Monitoring and analytics set up

---

## 🐛 Troubleshooting

### Supabase Connection Issues

Check if connection works:
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.auth.getUser();
console.log(data, error);
```

### Authentication Errors

- Confirm email is verified
- Check RLS policies are correct
- Verify JWT token is sent in headers (automatic with client)

### Image Upload Fails

- Check bucket exists and is public
- Verify CORS policy in storage
- Check file size < 5MB
- Check file type is JPEG/PNG/WebP/GIF

### Tests Failing

```bash
# Clear test cache
rm -rf node_modules/.vitest

# Re-run
npm run test
```

---

## 📚 Additional Resources

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand Store Pattern](https://github.com/pmndrs/zustand)
- [Vitest Testing Guide](https://vitest.dev/guide/)
- [Playwright E2E Testing](https://playwright.dev/docs/intro)

---

## 💬 Support

For issues:
1. Check console for error messages
2. Verify environment variables
3. Check Supabase dashboard for data
4. Review test output for hints
5. Check BACKEND.md for API documentation

---

**Happy coding! 🚀**
