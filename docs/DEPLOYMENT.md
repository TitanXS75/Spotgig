# Aaspass — Deployment Guide

> How to deploy Aaspass to production with Vercel + Supabase + Cloudinary.

---

## Prerequisites

- [Vercel](https://vercel.com/) account (free tier works)
- [Supabase](https://supabase.com/) project (free tier works)
- [Cloudinary](https://cloudinary.com/) account (free tier works)
- [Razorpay](https://razorpay.com/) account (test or live keys)
- [Node.js](https://nodejs.org/) 18+ locally

---

## 1. Supabase Setup

### 1.1 Create Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Choose region closest to your users (e.g., `Mumbai` for India)
4. Save the **project URL** and **anon key** from Settings → API

### 1.2 Run Database Migrations

1. Open **SQL Editor** in Supabase Dashboard
2. Run each file from `sqldb/` in order: `00_enums.sql` → `13_admin_setup.sql`
3. Skip `12_storage_policies.sql` (not needed — Cloudinary handles images)

### 1.3 Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_ID

# Set secrets for Edge Functions
npx supabase secrets set CLOUDINARY_CLOUD_NAME=your_cloud_name
npx supabase secrets set CLOUDINARY_API_KEY=your_api_key
npx supabase secrets set CLOUDINARY_API_SECRET=your_api_secret
npx supabase secrets set RAZORPAY_KEY_ID=rzp_live_XXXXXXXXX
npx supabase secrets set RAZORPAY_KEY_SECRET=your_secret

# Deploy functions
npx supabase functions deploy cloudinary-delete
npx supabase functions deploy create-razorpay-order
npx supabase functions deploy verify-razorpay-payment
```

### 1.4 Configure Auth Providers

1. Dashboard → Authentication → Providers
2. Enable **Email** (with email confirmation)
3. Enable **Google** OAuth:
   - Create OAuth client at [console.cloud.google.com](https://console.cloud.google.com/)
   - Set redirect URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Add Client ID and Secret in Supabase

---

## 2. Cloudinary Setup

### 2.1 Create Upload Preset

1. Cloudinary Dashboard → Settings → Upload
2. Add Upload Preset:
   - **Name**: `aaspass_unsigned`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `aaspass` (optional)
3. Save

### 2.2 Note Your Credentials

- **Cloud Name**: Shown on dashboard home
- **Upload Preset**: `aaspass_unsigned`
- **API Key** and **API Secret**: Settings → Access Keys (for Edge Functions only)

---

## 3. Vercel Deployment

### 3.1 Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository (`TitanXS75/Aaspass`)
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`

### 3.2 Set Environment Variables

In Vercel → Project Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | All |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | All |
| `VITE_CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | All |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `aaspass_unsigned` | All |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_XXXXXXXXX` | Production |

> ⚠️ Use `rzp_test_` prefix for staging/preview deployments.

### 3.3 Configure SPA Routing

Create `vercel.json` in the project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures all routes are handled by the React Router (SPA fallback).

### 3.4 Deploy

```bash
# Automatic: Push to main branch triggers deployment
git push origin main

# Manual: Use Vercel CLI
npx vercel --prod
```

---

## 4. Alternative: Netlify Deployment

### 4.1 Connect Repository

1. Go to [app.netlify.com](https://app.netlify.com/)
2. Add New Site → Import from Git
3. Build Command: `npm run build`
4. Publish Directory: `dist`

### 4.2 SPA Routing

Create `public/_redirects`:

```
/*    /index.html   200
```

### 4.3 Environment Variables

Same as Vercel — add in Netlify → Site Settings → Build & Deploy → Environment.

---

## 5. Domain Setup

### Custom Domain on Vercel

1. Vercel → Project → Settings → Domains
2. Add your domain (e.g., `aaspass.in`)
3. Update DNS records:
   - **A Record**: `76.76.21.21`
   - **CNAME**: `cname.vercel-dns.com` (for `www`)

### Update Supabase Auth Redirect

1. Supabase → Authentication → URL Configuration
2. Set **Site URL**: `https://aaspass.in`
3. Add **Redirect URLs**:
   - `https://aaspass.in/**`
   - `https://www.aaspass.in/**`

---

## 6. Post-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Database migrations applied
- [ ] Edge Functions deployed and responding
- [ ] Auth email templates customized (Supabase → Auth → Email Templates)
- [ ] Google OAuth redirect URL updated for production domain
- [ ] Cloudinary upload preset is working
- [ ] Razorpay is using **live** keys (not test)
- [ ] Custom domain configured with HTTPS
- [ ] SPA fallback routing works (direct URL access)
- [ ] Admin account created via `13_admin_setup.sql`
- [ ] Test full user flow: signup → create listing → payment → listing live

---

## 7. Monitoring & Maintenance

### Supabase Dashboard
- **Database**: Monitor query performance, storage usage
- **Auth**: Track signups, active sessions
- **Edge Functions**: View logs and invocation counts
- **Realtime**: Monitor WebSocket connections (future)

### Vercel Dashboard
- **Deployments**: Build logs, preview URLs
- **Analytics**: Page views, Web Vitals
- **Logs**: Function invocation logs

### Cloudinary Dashboard
- **Usage**: Transformations, bandwidth, storage
- **Media Library**: Browse uploaded images

---

## References

- [Vercel + Vite Deployment](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Supabase Self-Hosting](https://supabase.com/docs/guides/self-hosting)
- [Netlify SPA Routing](https://docs.netlify.com/routing/redirects/rewrites-proxies/)
- [Razorpay Go-Live Checklist](https://razorpay.com/docs/payments/go-live-checklist/)
