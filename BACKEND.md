# Aaspass Backend API Documentation

Complete backend API setup for the Aaspass hyperlocal marketplace platform.

## 📚 API Modules

### Authentication (`src/lib/api/auth.ts`)
User authentication and profile management using Supabase Auth.

**Functions:**
- `signUp(email, password, fullName)` - Register new user
- `signIn(email, password)` - Email/password login
- `signInWithPhone(phone)` - OTP-based phone authentication
- `verifyOtp(phone, token)` - Verify phone OTP
- `signOut()` - Logout current user
- `getMyProfile()` - Fetch current user's profile
- `updateProfile(updates)` - Update profile information
- `onAuthStateChange(callback)` - Listen to auth state changes

**Example:**
```typescript
import { signUp, getMyProfile } from '@/lib/api/auth';

// Sign up
const user = await signUp('user@example.com', 'password123', 'John Doe');

// Get profile
const profile = await getMyProfile();
```

---

### Listings (`src/lib/api/listings.ts`)
Browse, create, and manage listings.

**Functions:**
- `getListings(options)` - Fetch all live listings with optional filters
- `getListingById(id)` - Get single listing (increments view count)
- `getMyListings()` - Fetch current user's listings
- `createListing(listing)` - Create new listing
- `updateListing(id, update)` - Update listing details
- `suspendListing(id)` - Suspend a listing
- `searchListings(query)` - Full-text search listings

**Example:**
```typescript
import { getListings, createListing } from '@/lib/api/listings';

// Get listings by category
const listings = await getListings({ category: 'Food', limit: 10 });

// Create listing
const listing = await createListing({
  name: 'Homemade Cookies',
  category: 'Food',
  type: 'product',
  description: 'Fresh baked cookies...',
  whatsapp: '+919876543210',
  area: 'Whitefield, Bangalore',
  lat: 12.9698,
  lng: 77.7499,
  emoji: '🍪',
});
```

---

### Favorites (`src/lib/api/favorites.ts`)
Manage user's favorite listings.

**Functions:**
- `toggleFavorite(listingId)` - Add/remove from favorites (returns boolean)
- `getMyFavorites()` - Get all favorited listings
- `isFavorited(listingId)` - Check if listing is favorited

**Example:**
```typescript
import { toggleFavorite, getMyFavorites } from '@/lib/api/favorites';

// Toggle favorite
const isAdded = await toggleFavorite('listing_123'); // true if added

// Get all favorites
const favorites = await getMyFavorites();
```

---

### Reviews (`src/lib/api/reviews.ts`)
User reviews and ratings for listings.

**Functions:**
- `getListingReviews(listingId)` - Get all reviews for a listing
- `getListingAverageRating(listingId)` - Get average star rating
- `getListingReviewCount(listingId)` - Get review count
- `createReview(review)` - Post a review
- `updateReview(id, update)` - Edit your review
- `deleteReview(id)` - Delete your review
- `getMyReview(listingId)` - Get your review for a listing

**Example:**
```typescript
import { createReview, getListingAverageRating } from '@/lib/api/reviews';

// Post review
const review = await createReview({
  listing_id: 'listing_123',
  rating: 4,
  comment: 'Great quality!'
});

// Get average rating
const avgRating = await getListingAverageRating('listing_123'); // 4.2
```

---

### Payments (`src/lib/api/payments.ts`)
Razorpay payment integration for seller listing subscriptions.

**Functions:**
- `createPaymentOrder(listingId, plan)` - Create Razorpay order
- `verifyPayment(params)` - Verify and confirm payment
- `getMyPayments()` - Get payment history

**Pricing:**
- Monthly: ₹100 (10,000 paise)
- Yearly: ₹1,200 (120,000 paise)

**Example:**
```typescript
import { createPaymentOrder, verifyPayment } from '@/lib/api/payments';

// Create payment order
const order = await createPaymentOrder('listing_123', 'monthly');
// Returns: { orderId: 'order_xxx', amount: 10000, currency: 'INR' }

// Verify after payment (from Razorpay webhook)
const result = await verifyPayment({
  razorpayOrderId: 'order_xxx',
  razorpayPaymentId: 'pay_xxx',
  razorpaySignature: 'sig_xxx',
  listingId: 'listing_123'
});
```

---

### Image Storage (`src/lib/api/storage.ts`)
Upload and manage listing images in Supabase Storage.

**Functions:**
- `uploadListingImage(file, listingId)` - Upload and return public URL
- `deleteListingImage(imageUrl)` - Delete image from storage
- `optimizeImage(file, options)` - Optimize image before upload

**Configuration:**
- Max file size: 5MB
- Allowed types: JPEG, PNG, WebP, GIF
- Bucket: `listing-images`

**Example:**
```typescript
import { uploadListingImage, optimizeImage } from '@/lib/api/storage';

// Upload image
const imageUrl = await uploadListingImage(file, 'listing_123');

// Upload with optimization
const optimized = await optimizeImage(file, {
  maxWidth: 1200,
  maxHeight: 900,
  quality: 0.85
});
```

---

### Location Services (`src/lib/api/location.ts`)
Geolocation, distance calculations, and address services.

**Functions:**
- `getUserLocation(defaultCity)` - Get user's current coordinates
- `watchUserLocation(onSuccess, onError)` - Real-time location tracking
- `clearLocationWatch(watchId)` - Stop watching location
- `calculateDistance(lat1, lng1, lat2, lng2)` - Distance in km (Haversine)
- `formatDistance(distanceKm)` - Format for display ("2.5 km" or "500 m")
- `reverseGeocode(lat, lng)` - Coordinates → Address (OpenStreetMap)
- `forwardGeocode(address)` - Address → Coordinates (OpenStreetMap)

**Default Cities (Fallback Locations):**
- Bangalore, Mumbai, Delhi, Pune, Hyderabad, Kolkata, Chennai, Ahmedabad

**Example:**
```typescript
import { getUserLocation, calculateDistance, formatDistance } from '@/lib/api/location';

// Get user location
const { lat, lng } = await getUserLocation('bangalore');

// Calculate distance
const distance = calculateDistance(12.9716, 77.5946, 18.5204, 73.8567);
console.log(formatDistance(distance)); // "560.2 km"

// Watch location in real-time
const watchId = watchUserLocation(
  (coords) => console.log(coords),
  (error) => console.error(error)
);

// Stop watching
clearLocationWatch(watchId);
```

---

## 🎣 Custom Hooks

### useFavorites (`src/hooks/use-favorites.ts`)
Manage favorites with React Query integration.

```typescript
import { useFavorites } from '@/hooks/use-favorites';

const {
  favorites,
  toggle,
  isToggling,
  isFav,
  isLoading,
  isError
} = useFavorites();

// Check if favorited
if (isFav('listing_123')) { /* ... */ }

// Toggle
toggle('listing_123');
```

### useReviews (`src/hooks/use-reviews.ts`)
Query and mutate reviews with automatic cache updates.

```typescript
import { 
  useListingReviews,
  useListingAverageRating,
  useReviewMutations
} from '@/hooks/use-reviews';

const reviews = useListingReviews('listing_123');
const rating = useListingAverageRating('listing_123');
const { create, update, delete: deleteReview } = useReviewMutations();

// Create review
create.mutate({
  listing_id: 'listing_123',
  rating: 5,
  comment: 'Amazing!'
});
```

### useLocation (`src/hooks/use-location.ts`)
Location-based features with geolocation API.

```typescript
import { useUserLocation, useDistance, useReverseGeocode } from '@/hooks/use-location';

const { location, loading } = useUserLocation('bangalore');
const { distance } = useDistance(18.5204, 73.8567);
const { address } = useReverseGeocode(12.9716, 77.5946);
```

### useImageUpload (`src/hooks/use-image-upload.ts`)
Image upload with progress tracking and optimization.

```typescript
import { useImageUpload, useImagePreview } from '@/hooks/use-image-upload';

const { upload, isUploading, uploadProgress, uploadedUrl } = useImageUpload();
const { preview } = useImagePreview(file);

// Upload
upload({ file, listingId: 'listing_123' });
```

---

## 🗄️ Database Types (`src/lib/db-types.ts`)

Auto-generated from Supabase. To update:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/db-types.ts
```

**Tables:**
- `listings` - Seller listings with location and metadata
- `profiles` - User profiles
- `favorites` - User's favorite listings
- `reviews` - Reviews and ratings
- `payments` - Payment history and status

---

## 🏪 Global State (`src/store/app-store.ts`)

Zustand store for app-wide state.

```typescript
import { useAppStore } from '@/store/app-store';

const {
  userLat, userLng,
  searchQuery,
  selectedCategory,
  typeFilter,
  distanceFilter,
  sortBy,
  favoritedIds,
  theme,
  setUserLocation,
  setSearchQuery,
  setSelectedCategory,
  setTypeFilter,
  setDistanceFilter,
  setSortBy,
  setTheme,
  toggleFavorite,
  isFavorited,
  resetFilters
} = useAppStore();
```

---

## 🧪 Testing

### Unit Tests
```bash
npm run test          # Run once
npm run test:watch   # Watch mode
```

Test files:
- `src/test/location.test.ts` - Distance calculations
- `src/test/api.test.ts` - API function exports
- `src/test/hooks.test.ts` - Custom hooks
- `src/test/e2e.test.ts` - E2E test examples

### E2E Tests (Playwright)

To enable E2E testing:

```bash
npm install --save-dev @playwright/test
npx playwright install
npx playwright test
```

---

## 🔐 Environment Variables

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
```

Do NOT commit `.env.local` to git.

---

## 📝 Error Handling

All API functions throw errors that should be caught:

```typescript
try {
  const listing = await getListingById('123');
} catch (error) {
  console.error(error.message);
  // Show toast notification to user
}
```

---

## 🚀 Getting Started

1. **Set up Supabase:** https://supabase.com
2. **Copy environment variables** from Supabase dashboard
3. **Install dependencies:** `npm install`
4. **Start dev server:** `npm run dev`
5. **Run tests:** `npm run test`

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Vitest Docs](https://vitest.dev)
- [Playwright Docs](https://playwright.dev)
