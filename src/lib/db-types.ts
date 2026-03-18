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
          name: string;
          seller_name: string;
          type: 'product' | 'service';
          category: string;
          description: string;
          tags: string[];
          whatsapp: string | null;
          instagram: string | null;
          area: string;
          lat: number;
          lng: number;
          emoji: string;
          image_url: string | null;
          price: number | null;
          price_unit: string | null; // e.g. 'per month', 'per kg', 'fixed'
          status: 'pending' | 'live' | 'suspended';
          created_at: string;
          updated_at: string;
          views: number;
          plan: 'monthly' | 'yearly';
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
      payments: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          amount: number; // in paise (INR)
          plan: 'monthly' | 'yearly';
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          status: 'pending' | 'paid' | 'failed';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Pick<Database['public']['Tables']['payments']['Row'], 'razorpay_payment_id' | 'status'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_listings_nearby: {
        Args: { user_lat: number; user_lng: number; radius_km: number };
        Returns: Database['public']['Tables']['listings']['Row'][];
      };
    };
    Enums: {
      listing_type: 'product' | 'service';
      listing_status: 'pending' | 'live' | 'suspended';
      payment_plan: 'monthly' | 'yearly';
    };
  };
};
