import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/db-types';

type Listing = Database['public']['Tables']['listings']['Row'];
type ListingInsert = Database['public']['Tables']['listings']['Insert'];
type ListingUpdate = Database['public']['Tables']['listings']['Update'];

/** Fetch all live listings. Optionally filter by category. */
export async function getListings(options?: {
  category?: string;
  type?: 'product' | 'service';
  limit?: number;
}) {
  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'live')
    .order('created_at', { ascending: false });

  if (options?.category) query = query.eq('category', options.category);
  if (options?.type) query = query.eq('type', options.type);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data as Listing[];
}

/** Fetch a single listing by ID and increment its view count. */
export async function getListingById(id: string) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;

  // Increment view count (fire and forget)
  supabase
    .from('listings')
    .update({ views: (data.views ?? 0) + 1 })
    .eq('id', id)
    .then(() => {});

  return data as Listing;
}

/** Fetch all listings for the currently authenticated seller. */
export async function getMyListings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Listing[];
}

/** Create a new listing for the current user. Returns the created listing. */
export async function createListing(listing: Omit<ListingInsert, 'user_id'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('listings')
    .insert({ ...listing, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as Listing;
}

/** Update a listing — only the seller can update their own listing. */
export async function updateListing(id: string, update: ListingUpdate) {
  const { data, error } = await supabase
    .from('listings')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Listing;
}

/** Delete / suspend a listing by setting status to 'suspended'. */
export async function suspendListing(id: string) {
  return updateListing(id, { status: 'suspended' });
}

/** Search listings by keyword across name, description, tags. */
export async function searchListings(query: string) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'live')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  if (error) throw error;
  return data as Listing[];
}
