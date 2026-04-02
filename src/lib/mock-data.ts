export type ListingType = 'product' | 'service';
export type ListingStatus = 'pending' | 'live' | 'suspended';

export interface Listing {
  id: string;
  slug: string;
  user_id: string;
  name: string;
  seller_name: string;
  type: ListingType;
  operating_type: 'home' | 'shop';
  category: string;
  description: string;
  tags: string[];
  whatsapp: string | null;
  instagram: string | null;
  other_handle: string | null;
  area: string;
  lat: number;
  lng: number;
  emoji: string;
  image_url: string | null;
  supportive_images?: string[];
  website?: string | null;
  status: ListingStatus;
  created_at: string; // ISO string
  views: number;
  hide_location?: boolean;
  plan_expires_at?: string; // ISO string
  plan?: 'free_trial' | 'monthly' | 'yearly';
}

export const CATEGORIES = [
  { name: 'Food & Snacks', emoji: '🍱' },
  { name: 'Crafts', emoji: '🎨' },
  { name: 'Clothing', emoji: '👗' },
  { name: 'Electronics', emoji: '📱' },
  { name: 'Tutoring', emoji: '📐' },
  { name: 'Beauty', emoji: '💄' },
  { name: 'Repair', emoji: '🔧' },
  { name: 'Photography', emoji: '📷' },
  { name: 'Fitness', emoji: '🧘' },
  { name: 'Other', emoji: '✨' },
] as const;

export const MOCK_LISTINGS: Listing[] = [];
