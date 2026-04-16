// Auto-generated Supabase database types
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/db-types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          name: string;
          seller_name: string;
          type: 'product' | 'service';
          operating_type: 'shop' | 'home';
          category: string;
          description: string;
          tags: string[];
          whatsapp: string | null;
          instagram: string | null;
          other_handle: string | null;
          area: string;
          lat: number;
          lng: number;
          hide_location: boolean;
          emoji: string;
          image_url: string | null;
          supportive_images: string[] | null;
          website: string | null;
          price: number | null;
          price_unit: string | null;
          status: 'pending' | 'live' | 'suspended';
          created_at: string;
          updated_at: string;
          views: number;
          plan: 'free_trial' | 'monthly' | 'yearly';
          plan_expires_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['listings']['Row'], 'id' | 'created_at' | 'updated_at' | 'views'>;
        Update: Partial<Database['public']['Tables']['listings']['Insert']>;
      };
      profiles: {
        Row: {
          id: string; // same as auth.users.id
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          gender: 'male' | 'female' | 'other' | null; // gender_type enum in SQL
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['favorites']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          rating: number; // 1-5
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>;
        Update: Partial<Pick<Database['public']['Tables']['reviews']['Row'], 'rating' | 'comment'>>;
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          text: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          amount: number; // in paise (INR) — ₹100 = 10000, ₹1200 = 120000
          plan: 'free_trial' | 'monthly' | 'yearly'; // matches subscription_plan enum
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null; // HMAC signature from Razorpay
          status: 'pending' | 'paid' | 'failed'; // matches payment_status enum
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Pick<Database['public']['Tables']['payments']['Row'], 'razorpay_payment_id' | 'razorpay_signature' | 'status'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_listings_nearby: {
        Args: { user_lat: number; user_lng: number; radius_km: number };
        Returns: (Database['public']['Tables']['listings']['Row'] & { distance_km: number })[];
      };
      search_listings: {
        Args: { query: string };
        Returns: Database['public']['Tables']['listings']['Row'][];
      };
      get_vote_counts: {
        Args: { p_listing_id: string };
        Returns: { ups: number; downs: number }[];
      };
      get_listing_rating: {
        Args: { p_listing_id: string };
        Returns: { average_rating: number; review_count: number }[];
      };
      activate_listing: {
        Args: { p_listing_id: string; p_plan: 'free_trial' | 'monthly' | 'yearly'; p_payment_id: string };
        Returns: void;
      };
      toggle_favorite: {
        Args: { p_listing_id: string };
        Returns: boolean;
      };
      increment_listing_views: {
        Args: { p_listing_id: string };
        Returns: void;
      };
    };
    Enums: {
      listing_type: 'product' | 'service';
      listing_status: 'pending' | 'live' | 'suspended';
      operating_type: 'home' | 'shop';
      subscription_plan: 'free_trial' | 'monthly' | 'yearly';
      payment_status: 'pending' | 'paid' | 'failed';
      gender_type: 'male' | 'female' | 'other';
      vote_type: 'up' | 'down';
    };
  };
};
