# Aaspass — API Reference

> Internal API documentation for all Supabase interactions.  
> All functions are in `src/lib/api/`.

---

## Authentication (`auth.ts`)

### `signUp(email, password, fullName)`
Create a new user account with email verification.

```typescript
import { signUp } from '@/lib/api/auth';

const { data, error } = await signUp('raj@college.edu', 'pass123', 'Raj Kumar');
```

### `signIn(email, password)`
Sign in with email and password.

### `signInWithGoogle()`
OAuth sign-in with Google. Redirects to Google consent screen.

### `signOut()`
Sign out the current user and clear session.

### `resetPassword(email)`
Send a password reset email via Supabase Auth.

---

## Listings (`listings.ts`)

### `fetchListings(filters)`
Fetch listings with optional filters.

| Parameter | Type | Description |
|-----------|------|-------------|
| `lat` | `number` | User's latitude |
| `lng` | `number` | User's longitude |
| `radius_km` | `number` | Search radius (0 = anywhere) |
| `category` | `string?` | Category filter |
| `type` | `'product' \| 'service'?` | Type filter |
| `operating_type` | `'home' \| 'shop'?` | Operating type filter |
| `query` | `string?` | Search query (full-text) |

### `fetchListingById(id)`
Fetch a single listing by UUID. Also increments view counter.

### `createListing(data)`
Create a new listing. Requires authenticated user.

### `updateListing(id, data)`
Update an existing listing. Must be the listing owner.

### `deleteListing(id)`
Delete a listing. Must be the listing owner. Also deletes Cloudinary images.

---

## Favorites (`favorites.ts`)

### `toggleFavorite(listingId)`
Toggle a favorite. Returns `true` if now favorited, `false` if removed.
Uses the `toggle_favorite` RPC function (atomic operation).

### `fetchFavorites()`
Fetch all favorites for the current user. Returns listing objects.

### `isFavorited(listingId)`
Check if a specific listing is favorited by the current user.

---

## Reviews (`reviews.ts`)

### `fetchReviews(listingId)`
Fetch all reviews for a listing, ordered by newest first.

### `createReview(listingId, rating, comment?)`
Submit a review (1–5 stars + optional text). One review per user per listing.

### `updateReview(reviewId, rating, comment?)`
Update an existing review. Must be the review author.

### `deleteReview(reviewId)`
Delete a review. Must be the review author.

### `getListingRating(listingId)`
Get aggregated rating stats. Returns `{ average_rating, review_count }`.

---

## Location (`location.ts`)

### `getCurrentPosition()`
Request the user's GPS coordinates via the browser Geolocation API.
Returns `{ lat, lng }`.

### `reverseGeocode(lat, lng)`
Convert coordinates to a human-readable area name using OpenStreetMap
Nominatim API.

### `getListingsNearby(lat, lng, radius_km)`
Call the `get_listings_nearby` RPC function. Returns listings sorted by
distance with a `distance_km` field.

---

## Cloudinary (`cloudinary.ts`)

### `uploadImage(file, folder, publicId)`
Upload an image to Cloudinary with compression.

| Parameter | Type | Description |
|-----------|------|-------------|
| `file` | `File` | Image file from input |
| `folder` | `string` | Cloudinary folder path |
| `publicId` | `string` | Unique identifier |

Returns the CDN URL: `https://res.cloudinary.com/...`

### `deleteImage(publicId)`
Delete an image via the Supabase Edge Function `cloudinary-delete`.
The API secret is never exposed to the client.

---

## Payments (`payments.ts`)

### `createOrder(listingId, plan)`
Create a Razorpay order via the Supabase Edge Function `create-razorpay-order`.

Returns `{ order_id, amount, currency }`.

### `verifyPayment(orderId, paymentId, signature)`
Verify a Razorpay payment signature via the Edge Function
`verify-razorpay-payment`. On success, activates the listing.

---

## Supabase RPC Functions

These are PostgreSQL functions called via `supabase.rpc()`:

| Function | Args | Returns | Description |
|----------|------|---------|-------------|
| `get_listings_nearby` | `user_lat, user_lng, radius_km` | `Listing[] + distance_km` | Haversine distance query |
| `search_listings` | `query` | `Listing[]` | Full-text search |
| `toggle_favorite` | `p_listing_id` | `boolean` | Atomic favorite toggle |
| `get_vote_counts` | `p_listing_id` | `{ ups, downs }` | Vote aggregation |
| `get_listing_rating` | `p_listing_id` | `{ average_rating, review_count }` | Rating stats |
| `activate_listing` | `p_listing_id, p_plan, p_payment_id` | `void` | Post-payment activation |
| `increment_listing_views` | `p_listing_id` | `void` | View counter increment |

---

## Error Handling

All API functions return Supabase's standard response format:

```typescript
const { data, error } = await supabase.from('listings').select();

if (error) {
  // error.message — Human-readable error
  // error.code — PostgreSQL error code
  // error.details — Additional context
  toast.error(error.message);
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| `PGRST301` | Row not found |
| `42501` | RLS permission denied |
| `23505` | Unique constraint violation |
| `23503` | Foreign key violation |
| `PGRST116` | Multiple rows returned (expected one) |
