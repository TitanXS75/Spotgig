import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/db-types';

type Review = Database['public']['Tables']['reviews']['Row'];
type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];

/**
 * Get all reviews for a listing.
 */
export async function getListingReviews(listingId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get the average rating for a listing.
 */
export async function getListingAverageRating(listingId: string): Promise<number> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('listing_id', listingId);

  if (error) throw error;
  if (!data || data.length === 0) return 0;

  const sum = data.reduce((acc, r) => acc + (r.rating || 0), 0);
  return Math.round((sum / data.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Get review count for a listing.
 */
export async function getListingReviewCount(listingId: string): Promise<number> {
  const { count, error } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listingId);

  if (error) throw error;
  return count ?? 0;
}

/**
 * Create a review for a listing.
 */
export async function createReview(review: Omit<ReviewInsert, 'user_id'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user already reviewed this listing
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_id', review.listing_id)
    .maybeSingle();

  if (existing) {
    throw new Error('You have already reviewed this listing');
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      ...review,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

/**
 * Update a review (only author can update).
 */
export async function updateReview(id: string, update: Partial<Pick<Review, 'rating' | 'comment'>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify ownership
  const { data: review } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!review || review.user_id !== user.id) {
    throw new Error('You can only update your own reviews');
  }

  const { data, error } = await supabase
    .from('reviews')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

/**
 * Delete a review (only author can delete).
 */
export async function deleteReview(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify ownership
  const { data: review } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!review || review.user_id !== user.id) {
    throw new Error('You can only delete your own reviews');
  }

  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Get the current user's review for a listing (if any).
 */
export async function getMyReview(listingId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('listing_id', listingId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data as Review | null;
}
