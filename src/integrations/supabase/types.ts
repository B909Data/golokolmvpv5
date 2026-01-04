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
      after_party_messages: {
        Row: {
          attendee_id: string
          created_at: string | null
          event_id: string
          id: string
          message: string | null
          role: Database["public"]["Enums"]["message_role"]
        }
        Insert: {
          attendee_id: string
          created_at?: string | null
          event_id: string
          id?: string
          message?: string | null
          role?: Database["public"]["Enums"]["message_role"]
        }
        Update: {
          attendee_id?: string
          created_at?: string | null
          event_id?: string
          id?: string
          message?: string | null
          role?: Database["public"]["Enums"]["message_role"]
        }
        Relationships: [
          {
            foreignKeyName: "after_party_messages_attendee_id_fkey"
            columns: ["attendee_id"]
            isOneToOne: false
            referencedRelation: "attendees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "after_party_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      attendees: {
        Row: {
          checked_in_at: string | null
          checkin_method: Database["public"]["Enums"]["checkin_method"]
          created_at: string | null
          display_name: string | null
          event_id: string
          id: string
          phone: string | null
          qr_token: string | null
        }
        Insert: {
          checked_in_at?: string | null
          checkin_method?: Database["public"]["Enums"]["checkin_method"]
          created_at?: string | null
          display_name?: string | null
          event_id: string
          id?: string
          phone?: string | null
          qr_token?: string | null
        }
        Update: {
          checked_in_at?: string | null
          checkin_method?: Database["public"]["Enums"]["checkin_method"]
          created_at?: string | null
          display_name?: string | null
          event_id?: string
          id?: string
          phone?: string | null
          qr_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          artist_id: string | null
          attendee_id: string
          badge: Database["public"]["Enums"]["badge_type"]
          count: number
          created_at: string | null
          id: string
        }
        Insert: {
          artist_id?: string | null
          attendee_id: string
          badge: Database["public"]["Enums"]["badge_type"]
          count?: number
          created_at?: string | null
          id?: string
        }
        Update: {
          artist_id?: string | null
          attendee_id?: string
          badge?: Database["public"]["Enums"]["badge_type"]
          count?: number
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_attendee_id_fkey"
            columns: ["attendee_id"]
            isOneToOne: false
            referencedRelation: "attendees"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          after_party_enabled: boolean
          after_party_opens_at: string | null
          artist_access_token: string | null
          artist_name: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          ends_at: string | null
          genres: string[] | null
          id: string
          image_url: string | null
          livestream_url: string | null
          pinned_message: string | null
          start_at: string
          status: Database["public"]["Enums"]["event_status"]
          ticket_url: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          venue_name: string | null
          youtube_url: string | null
        }
        Insert: {
          after_party_enabled?: boolean
          after_party_opens_at?: string | null
          artist_access_token?: string | null
          artist_name?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          ends_at?: string | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          livestream_url?: string | null
          pinned_message?: string | null
          start_at: string
          status?: Database["public"]["Enums"]["event_status"]
          ticket_url?: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          venue_name?: string | null
          youtube_url?: string | null
        }
        Update: {
          after_party_enabled?: boolean
          after_party_opens_at?: string | null
          artist_access_token?: string | null
          artist_name?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          ends_at?: string | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          livestream_url?: string | null
          pinned_message?: string | null
          start_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          ticket_url?: string | null
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
          venue_name?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      recaps: {
        Row: {
          content: string | null
          created_at: string | null
          event_id: string
          generated_at: string | null
          id: string
          share_token: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          event_id: string
          generated_at?: string | null
          id?: string
          share_token?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          event_id?: string
          generated_at?: string | null
          id?: string
          share_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recaps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      short_links: {
        Row: {
          code: string
          created_at: string
          target_url: string
        }
        Insert: {
          code: string
          created_at?: string
          target_url: string
        }
        Update: {
          code?: string
          created_at?: string
          target_url?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          admin_notes: string | null
          artist_name: string
          contact_email: string
          created_at: string
          id: string
          notes: string | null
          song_title: string
          spotify_url: string
          status: string
          stripe_session_id: string | null
          youtube_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          artist_name: string
          contact_email: string
          created_at?: string
          id?: string
          notes?: string | null
          song_title: string
          spotify_url: string
          status?: string
          stripe_session_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          artist_name?: string
          contact_email?: string
          created_at?: string
          id?: string
          notes?: string | null
          song_title?: string
          spotify_url?: string
          status?: string
          stripe_session_id?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      badge_type: "first_show" | "repeat_show"
      checkin_method: "qr"
      event_status: "upcoming" | "live" | "ended"
      event_type: "lls" | "after_party"
      message_role: "fan" | "artist"
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
    },
  },
} as const
