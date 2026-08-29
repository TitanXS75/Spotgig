export type ListingType = 'project' | 'freelancer';
export type ListingStatus = 'pending' | 'live' | 'suspended';
export type UserRole = 'client' | 'freelancer';

export interface Listing {
  id: string;
  slug: string;
  user_id: string;
  name: string;
  seller_name: string;
  type: ListingType;
  operating_type: 'solo' | 'team';
  category: string;
  description: string;
  tags: string[];
  whatsapp: string | null;
  instagram: string | null;
  linkedin: string | null;
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
  role?: UserRole;
}

export const CATEGORIES = [
  { name: 'Web Development', emoji: '💻' },
  { name: 'App Development', emoji: '📱' },
  { name: 'UI/UX Design', emoji: '🎨' },
  { name: 'AI / ML', emoji: '🤖' },
  { name: 'Digital Marketing', emoji: '📢' },
  { name: 'Content Writing', emoji: '📝' },
  { name: 'Data Analysis', emoji: '📊' },
  { name: 'Video Editing', emoji: '🎬' },
  { name: 'Graphic Design', emoji: '📐' },
  { name: 'Cybersecurity', emoji: '🛡️' },
  { name: 'QA / Testing', emoji: '🧪' },
  { name: 'IT Support', emoji: '🔧' },
  { name: 'Tutoring / Mentoring', emoji: '🎓' },
  { name: 'Other', emoji: '✨' },
] as const;

export const MOCK_LISTINGS: Listing[] = [];
