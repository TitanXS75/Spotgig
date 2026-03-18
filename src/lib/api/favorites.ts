import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/db-types';

type Favorite = Database['public']['Tables']['favorites']['Row'];

/**
 * Toggle a listing as favorite for the current user.
 * Returns true if added, false if removed.
 */
export async function toggleFavorite(listingId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .maybeSingle();

  if (existing) {
    // Remove
    await supabase.from('favorites').delete().eq('id', existing.id);
    return false;
  } else {
    // Add
    await supabase.from('favorites').insert({ user_id: user.id, listing_id: listingId });
    return true;
  }
}

/** Get all favorited listings for the current user. */
export async function getMyFavorites() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('favorites')
    .select('listing_id, listings(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((f) => f.listings);
}

/** Check if a listing is favorited by the current user. */
export async function isFavorited(listingId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .maybeSingle();
  return !!data;
}
