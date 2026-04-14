export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      artist_profiles: {
        Row: {
          artist_name: string | null
          artist_user_id: string
          city: string | null
          created_at: string | null
          first_name: string | null
          id: string
          instagram_handle: string | null
          music_link: string | null
          neighborhood: string | null
          profile_image_url: string | null
          short_bio: string | null
          updated_at: string | null
        }
        Insert: {
          artist_name?: string | null
          artist_user_id: string
          city?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          instagram_handle?: string | null
          music_link?: string | null
          neighborhood?: string | null
          profile_image_url?: string | null
          short_bio?: string | null
          updated_at?: string | null
        }
        Update: {
          artist_name?: string | null
          artist_user_id?: string
          city?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          instagram_handle?: string | null
          music_link?: string | null
          neighborhood?: string | null
          profile_image_url?: string | null
          short_bio?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          artist_id: string | null
          badge: Database["public"]["Enums"]["badge_type"]
          count: number
          created_at: string | null
          id: string
          milestone_name: string | null
          partner_store: string | null
          points_required: number | null
          reward_description: string | null
        }
        Insert: {
          artist_id?: string | null
          badge: Database["public"]["Enums"]["badge_type"]
          count?: number
          created_at?: string | null
          id?: string
          milestone_name?: string | null
          partner_store?: string | null
          points_required?: number | null
          reward_description?: string | null
        }
        Update: {
          artist_id?: string | null
          badge?: Database["public"]["Enums"]["badge_type"]
          count?: number
          created_at?: string | null
          id?: string
          milestone_name?: string | null
          partner_store?: string | null
          points_required?: number | null
          reward_description?: string | null
        }
        Relationships: []
      }
      email_optins: {
        Row: {
          created_at: string
          email: string
          event_id: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          event_id: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: string
          id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      fan_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          fan_user_id: string
          id: string
          submission_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          fan_user_id: string
          id?: string
          submission_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          fan_user_id?: string
          id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_comments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_profiles: {
        Row: {
          city: string | null
          created_at: string | null
          daily_points_date: string | null
          daily_points_earned: number | null
          email: string | null
          fan_user_id: string
          id: string
          lokol_points: number | null
          name: string | null
          qr_code_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          daily_points_date?: string | null
          daily_points_earned?: number | null
          email?: string | null
          fan_user_id: string
          id?: string
          lokol_points?: number | null
          name?: string | null
          qr_code_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          daily_points_date?: string | null
          daily_points_earned?: number | null
          email?: string | null
          fan_user_id?: string
          id?: string
          lokol_points?: number | null
          name?: string | null
          qr_code_id?: string | null
        }
        Relationships: []
      }
      fan_saves: {
        Row: {
          artist_choice: string
          created_at: string
          email: string
          id: string
          name: string
          notify: boolean
          session: string
        }
        Insert: {
          artist_choice: string
          created_at?: string
          email: string
          id?: string
          name: string
          notify?: boolean
          session?: string
        }
        Update: {
          artist_choice?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          notify?: boolean
          session?: string
        }
        Relationships: []
      }
      fan_store_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          fan_user_id: string | null
          id: string
          points_earned: number | null
          store_slug: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          fan_user_id?: string | null
          id?: string
          points_earned?: number | null
          store_slug: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          fan_user_id?: string | null
          id?: string
          points_earned?: number | null
          store_slug?: string
        }
        Relationships: []
      }
      lls_artist_submissions: {
        Row: {
          account_freeze_confirmed: boolean
          admin_status: string | null
          artist_name: string
          artist_neighborhood: string | null
          artist_slug: string | null
          artist_user_id: string | null
          city_market: string
          claim_code: string | null
          contact_email: string
          created_at: string
          genre_style: string
          how_heard: string | null
          id: string
          instagram_handle: string | null
          mp3_path: string | null
          mp3_url: string | null
          music_link: string | null
          no_royalties_confirmed: boolean
          original_filename: string | null
          payment_status: string | null
          physical_product: string | null
          rejection_reason: string | null
          rights_confirmed: boolean
          short_bio: string | null
          song_image_url: string | null
          song_title: string | null
          stripe_session_id: string | null
          terms_confirmed: boolean
          youtube_url: string | null
        }
        Insert: {
          account_freeze_confirmed?: boolean
          admin_status?: string | null
          artist_name: string
          artist_neighborhood?: string | null
          artist_slug?: string | null
          artist_user_id?: string | null
          city_market?: string
          claim_code?: string | null
          contact_email: string
          created_at?: string
          genre_style: string
          how_heard?: string | null
          id?: string
          instagram_handle?: string | null
          mp3_path?: string | null
          mp3_url?: string | null
          music_link?: string | null
          no_royalties_confirmed?: boolean
          original_filename?: string | null
          payment_status?: string | null
          physical_product?: string | null
          rejection_reason?: string | null
          rights_confirmed?: boolean
          short_bio?: string | null
          song_image_url?: string | null
          song_title?: string | null
          stripe_session_id?: string | null
          terms_confirmed?: boolean
          youtube_url?: string | null
        }
        Update: {
          account_freeze_confirmed?: boolean
          admin_status?: string | null
          artist_name?: string
          artist_neighborhood?: string | null
          artist_slug?: string | null
          artist_user_id?: string | null
          city_market?: string
          claim_code?: string | null
          contact_email?: string
          created_at?: string
          genre_style?: string
          how_heard?: string | null
          id?: string
          instagram_handle?: string | null
          mp3_path?: string | null
          mp3_url?: string | null
          music_link?: string | null
          no_royalties_confirmed?: boolean
          original_filename?: string | null
          payment_status?: string | null
          physical_product?: string | null
          rejection_reason?: string | null
          rights_confirmed?: boolean
          short_bio?: string | null
          song_image_url?: string | null
          song_title?: string | null
          stripe_session_id?: string | null
          terms_confirmed?: boolean
          youtube_url?: string | null
        }
        Relationships: []
      }
      lls_kiosk_agreement_signatures: {
        Row: {
          agreement_text: string
          agreement_version: string
          city: string
          contact_name: string
          created_at: string
          email: string
          id: string
          ip_address: string | null
          retail_signup_id: string | null
          signature_name: string
          signer_title: string | null
          store_name: string
          user_agent: string | null
        }
        Insert: {
          agreement_text: string
          agreement_version?: string
          city: string
          contact_name: string
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          retail_signup_id?: string | null
          signature_name: string
          signer_title?: string | null
          store_name: string
          user_agent?: string | null
        }
        Update: {
          agreement_text?: string
          agreement_version?: string
          city?: string
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          retail_signup_id?: string | null
          signature_name?: string
          signer_title?: string | null
          store_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lls_kiosk_agreement_signatures_retail_signup_id_fkey"
            columns: ["retail_signup_id"]
            isOneToOne: false
            referencedRelation: "lls_retail_signups"
            referencedColumns: ["id"]
          },
        ]
      }
      lls_music_release_signatures: {
        Row: {
          agreement_text: string
          agreement_version: string
          artist_name: string
          created_at: string
          email: string
          event_id: string | null
          id: string
          ip_address: string | null
          legal_name: string
          release_confirmed: boolean
          role: string | null
          signature_name: string
          submission_id: string | null
          user_agent: string | null
        }
        Insert: {
          agreement_text: string
          agreement_version?: string
          artist_name: string
          created_at?: string
          email: string
          event_id?: string | null
          id?: string
          ip_address?: string | null
          legal_name: string
          release_confirmed?: boolean
          role?: string | null
          signature_name: string
          submission_id?: string | null
          user_agent?: string | null
        }
        Update: {
          agreement_text?: string
          agreement_version?: string
          artist_name?: string
          created_at?: string
          email?: string
          event_id?: string | null
          id?: string
          ip_address?: string | null
          legal_name?: string
          release_confirmed?: boolean
          role?: string | null
          signature_name?: string
          submission_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      lls_retail_signups: {
        Row: {
          city_location: string
          contact_email: string
          contact_name: string
          created_at: string
          has_listening_station: string
          id: string
          notes: string | null
          signage_preference: string[] | null
          store_logo_url: string | null
          store_name: string
          store_slug: string | null
          store_type: string
          terms_accepted: boolean | null
        }
        Insert: {
          city_location: string
          contact_email: string
          contact_name: string
          created_at?: string
          has_listening_station: string
          id?: string
          notes?: string | null
          signage_preference?: string[] | null
          store_logo_url?: string | null
          store_name: string
          store_slug?: string | null
          store_type: string
          terms_accepted?: boolean | null
        }
        Update: {
          city_location?: string
          contact_email?: string
          contact_name?: string
          created_at?: string
          has_listening_station?: string
          id?: string
          notes?: string | null
          signage_preference?: string[] | null
          store_logo_url?: string | null
          store_name?: string
          store_slug?: string | null
          store_type?: string
          terms_accepted?: boolean | null
        }
        Relationships: []
      }
      lokol_points_ledger: {
        Row: {
          action_type: string
          created_at: string | null
          fan_user_id: string
          id: string
          points_earned: number
          submission_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          fan_user_id: string
          id?: string
          points_earned: number
          submission_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          fan_user_id?: string
          id?: string
          points_earned?: number
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lokol_points_ledger_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      show_listings: {
        Row: {
          artist_user_id: string
          city: string | null
          created_at: string | null
          event_name: string
          id: string
          show_date: string
          show_time: string | null
          ticket_url: string | null
          venue_name: string
        }
        Insert: {
          artist_user_id: string
          city?: string | null
          created_at?: string | null
          event_name: string
          id?: string
          show_date: string
          show_time?: string | null
          ticket_url?: string | null
          venue_name: string
        }
        Update: {
          artist_user_id?: string
          city?: string | null
          created_at?: string | null
          event_name?: string
          id?: string
          show_date?: string
          show_time?: string | null
          ticket_url?: string | null
          venue_name?: string
        }
        Relationships: []
      }
      show_notifications: {
        Row: {
          artist_user_id: string
          created_at: string | null
          fan_user_id: string
          id: string
        }
        Insert: {
          artist_user_id: string
          created_at?: string | null
          fan_user_id: string
          id?: string
        }
        Update: {
          artist_user_id?: string
          created_at?: string | null
          fan_user_id?: string
          id?: string
        }
        Relationships: []
      }
      song_listens: {
        Row: {
          completed_50_percent: boolean | null
          fan_user_id: string
          id: string
          last_listened_at: string | null
          listen_count: number | null
          submission_id: string
        }
        Insert: {
          completed_50_percent?: boolean | null
          fan_user_id: string
          id?: string
          last_listened_at?: string | null
          listen_count?: number | null
          submission_id: string
        }
        Update: {
          completed_50_percent?: boolean | null
          fan_user_id?: string
          id?: string
          last_listened_at?: string | null
          listen_count?: number | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_listens_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          admin_notes: string | null
          admin_status: string | null
          artist_name: string
          artist_slug: string | null
          artist_user_id: string | null
          city_market: string | null
          contact_email: string
          created_at: string
          genre_style: string | null
          how_heard: string | null
          id: string
          instagram_handle: string | null
          mp3_path: string | null
          mp3_url: string | null
          music_release_agreed: boolean
          music_release_agreed_at: string | null
          notes: string | null
          original_filename: string | null
          payment_status: string | null
          phone: string | null
          physical_product: string | null
          promo_code: string | null
          short_bio: string | null
          song_image_url: string | null
          song_title: string
          spotify_url: string
          status: string
          stripe_session_id: string | null
          youtube_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          admin_status?: string | null
          artist_name: string
          artist_slug?: string | null
          artist_user_id?: string | null
          city_market?: string | null
          contact_email: string
          created_at?: string
          genre_style?: string | null
          how_heard?: string | null
          id?: string
          instagram_handle?: string | null
          mp3_path?: string | null
          mp3_url?: string | null
          music_release_agreed?: boolean
          music_release_agreed_at?: string | null
          notes?: string | null
          original_filename?: string | null
          payment_status?: string | null
          phone?: string | null
          physical_product?: string | null
          promo_code?: string | null
          short_bio?: string | null
          song_image_url?: string | null
          song_title: string
          spotify_url: string
          status?: string
          stripe_session_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          admin_status?: string | null
          artist_name?: string
          artist_slug?: string | null
          artist_user_id?: string | null
          city_market?: string | null
          contact_email?: string
          created_at?: string
          genre_style?: string | null
          how_heard?: string | null
          id?: string
          instagram_handle?: string | null
          mp3_path?: string | null
          mp3_url?: string | null
          music_release_agreed?: boolean
          music_release_agreed_at?: string | null
          notes?: string | null
          original_filename?: string | null
          payment_status?: string | null
          phone?: string | null
          physical_product?: string | null
          promo_code?: string | null
          short_bio?: string | null
          song_image_url?: string | null
          song_title?: string
          spotify_url?: string
          status?: string
          stripe_session_id?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
    }
    Views: {
      lls_vote_counts: {
        Row: {
          artist_choice: string | null
          session: string | null
          total_votes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      validate_and_redeem_promo_code: {
        Args: { p_code: string }
        Returns: {
          error_message: string
          promo_kind: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      badge_type: "first_show" | "repeat_show"
      checkin_method: "qr"
      event_status: "upcoming" | "live" | "ended"
      event_type: "lls" | "after_party"
      message_role: "fan" | "artist"
      partner_type: "curator" | "venue"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      badge_type: ["first_show", "repeat_show"],
      checkin_method: ["qr"],
      event_status: ["upcoming", "live", "ended"],
      event_type: ["lls", "after_party"],
      message_role: ["fan", "artist"],
      partner_type: ["curator", "venue"],
    },
  },
} as const
