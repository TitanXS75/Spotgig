// Supabase database types for Spotgig Trusted Real-World Project Marketplace

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProjectRole = 'project_owner' | 'developer' | 'admin';
export type ProjectDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ProjectStatus = 'draft' | 'published' | 'in_progress' | 'completed' | 'archived';
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';
export type CompensationType = 'paid' | 'stipend' | 'unpaid';
export type LocationPreference = 'remote' | 'on_site' | 'hybrid';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; // same as auth.users.id
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          gender: 'male' | 'female' | 'other' | null;
          is_admin: boolean;
          role: ProjectRole;
          headline: string | null;
          bio: string | null;
          skills: string[];
          technologies: string[];
          experience_level: ProjectDifficulty;
          github_url: string | null;
          portfolio_url: string | null;
          linkedin_url: string | null;
          education: string | null;
          availability: string;
          organization: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          is_admin?: boolean;
          role?: ProjectRole;
          headline?: string | null;
          bio?: string | null;
          skills?: string[];
          technologies?: string[];
          experience_level?: ProjectDifficulty;
          github_url?: string | null;
          portfolio_url?: string | null;
          linkedin_url?: string | null;
          education?: string | null;
          availability?: string;
          organization?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          slug: string;
          category: string;
          industry: string;
          project_type: string;
          public_summary: string;
          required_skills: string[];
          technologies: string[];
          difficulty: ProjectDifficulty;
          duration: string;
          team_size: number;
          compensation_type: CompensationType;
          compensation_amount: number | null;
          location_type: LocationPreference;
          area: string | null;
          status: ProjectStatus;
          views: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at' | 'views'> & {
          views?: number;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      project_requirements: {
        Row: {
          project_id: string;
          detailed_requirements: string;
          feature_list: string | null;
          confidential_notes: string | null;
          attachments: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['project_requirements']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['project_requirements']['Insert']>;
      };
      project_requests: {
        Row: {
          id: string;
          project_id: string;
          developer_id: string;
          message: string;
          status: RequestStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['project_requests']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          status?: RequestStatus;
        };
        Update: Partial<Pick<Database['public']['Tables']['project_requests']['Row'], 'status' | 'message'>>;
      };
      project_access: {
        Row: {
          id: string;
          project_id: string;
          developer_id: string;
          access_level: 'view_requirements' | 'collaborator';
          granted_by: string;
          granted_at: string;
          revoked_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['project_access']['Row'], 'id' | 'granted_at'>;
        Update: Partial<Pick<Database['public']['Tables']['project_access']['Row'], 'access_level' | 'revoked_at'>>;
      };
      // Retained legacy tables for backward compatibility and transition
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
          rating: number;
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
          listing_id: string | null;
          project_id?: string | null;
          amount: number;
          plan: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          status: 'pending' | 'paid' | 'failed';
          notes?: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id?: string | null;
          project_id?: string | null;
          amount: number;
          plan?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          status?: 'pending' | 'paid' | 'failed';
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      platform_settings: {
        Row: {
          id: string;
          payment_gateway_enabled: boolean;
          free_client_limit: number;
          platform_fee_percent: number;
          monthly_plan_price: number;
          yearly_plan_price: number;
          announcement_banner: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          payment_gateway_enabled?: boolean;
          free_client_limit?: number;
          platform_fee_percent?: number;
          monthly_plan_price?: number;
          yearly_plan_price?: number;
          announcement_banner?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['platform_settings']['Insert']>;
      };
      project_tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: 'todo' | 'in_progress' | 'completed';
          is_completed: boolean;
          completed_by: string | null;
          assigned_to: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'completed';
          is_completed?: boolean;
          completed_by?: string | null;
          assigned_to?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['project_tasks']['Insert']>;
      };
      project_messages: {
        Row: {
          id: string;
          project_id: string;
          sender_id: string;
          message: string;
          attachments: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          sender_id: string;
          message: string;
          attachments?: string[] | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['project_messages']['Insert']>;
      };
      project_deliverables: {
        Row: {
          id: string;
          project_id: string;
          developer_id: string;
          title: string | null;
          github_url: string | null;
          github_repo_url: string | null;
          demo_url: string | null;
          live_demo_url: string | null;
          notes: string | null;
          feedback: string | null;
          reviewer_notes: string | null;
          reviewed_at: string | null;
          status: 'submitted' | 'accepted' | 'revision_requested';
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          developer_id: string;
          title?: string | null;
          github_url?: string | null;
          github_repo_url?: string | null;
          demo_url?: string | null;
          live_demo_url?: string | null;
          notes?: string | null;
          feedback?: string | null;
          reviewer_notes?: string | null;
          reviewed_at?: string | null;
          status?: 'submitted' | 'accepted' | 'revision_requested';
          submitted_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['project_deliverables']['Insert']>;
      };
      project_reviews: {
        Row: {
          id: string;
          project_id: string;
          reviewer_id: string;
          reviewee_id: string;
          reviewer_role: 'project_owner' | 'developer';
          rating: number;
          technical_rating: number | null;
          communication_rating: number | null;
          reliability_rating: number | null;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          reviewer_id: string;
          reviewee_id: string;
          reviewer_role: 'project_owner' | 'developer';
          rating: number;
          technical_rating?: number | null;
          communication_rating?: number | null;
          reliability_rating?: number | null;
          comment: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['project_reviews']['Insert']>;
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
      project_role: ProjectRole;
      project_difficulty: ProjectDifficulty;
      project_status: ProjectStatus;
      request_status: RequestStatus;
      compensation_type: CompensationType;
      location_preference: LocationPreference;
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

// Domain helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
export type ProjectRequirements = Database['public']['Tables']['project_requirements']['Row'];
export type ProjectRequest = Database['public']['Tables']['project_requests']['Row'];
export type ProjectAccess = Database['public']['Tables']['project_access']['Row'];
export type ProjectTask = Database['public']['Tables']['project_tasks']['Row'];
export type ProjectTaskInsert = Database['public']['Tables']['project_tasks']['Insert'];
export type ProjectTaskUpdate = Database['public']['Tables']['project_tasks']['Update'];
export type ProjectMessage = Database['public']['Tables']['project_messages']['Row'];
export type ProjectMessageInsert = Database['public']['Tables']['project_messages']['Insert'];
export type ProjectDeliverable = Database['public']['Tables']['project_deliverables']['Row'];
export type ProjectDeliverableInsert = Database['public']['Tables']['project_deliverables']['Insert'];
export type ProjectReview = Database['public']['Tables']['project_reviews']['Row'];
export type ProjectReviewInsert = Database['public']['Tables']['project_reviews']['Insert'];
