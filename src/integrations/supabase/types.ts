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
          {
            foreignKeyName: "after_party_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "paid_events"
            referencedColumns: ["id"]
          },
        ]
      }
      afterparty_discount_codes: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          event_id: string | null
          expires_at: string | null
          id: string
          month_scope: string | null
          partner_id: string | null
          used_at: string | null
          used_by_email: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          event_id?: string | null
          expires_at?: string | null
          id?: string
          month_scope?: string | null
          partner_id?: string | null
          used_at?: string | null
          used_by_email?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          event_id?: string | null
          expires_at?: string | null
          id?: string
          month_scope?: string | null
          partner_id?: string | null
          used_at?: string | null
          used_by_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "afterparty_discount_codes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "afterparty_discount_codes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "paid_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "afterparty_discount_codes_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      attendees: {
        Row: {
          access_token: string | null
          access_token_expires_at: string | null
          activated_at: string | null
          checked_in_at: string | null
          checkin_method: Database["public"]["Enums"]["checkin_method"]
          created_at: string | null
          display_name: string | null
          event_id: string
          id: string
          paid_amount: number | null
          paid_at: string | null
          payment_status: string | null
          phone: string | null
          purchase_email: string | null
          qr_token: string | null
          sms_opt_in: boolean | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          access_token?: string | null
          access_token_expires_at?: string | null
          activated_at?: string | null
          checked_in_at?: string | null
          checkin_method?: Database["public"]["Enums"]["checkin_method"]
          created_at?: string | null
          display_name?: string | null
          event_id: string
          id?: string
          paid_amount?: number | null
          paid_at?: string | null
          payment_status?: string | null
          phone?: string | null
          purchase_email?: string | null
          qr_token?: string | null
          sms_opt_in?: boolean | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          access_token?: string | null
          access_token_expires_at?: string | null
          activated_at?: string | null
          checked_in_at?: string | null
          checkin_method?: Database["public"]["Enums"]["checkin_method"]
          created_at?: string | null
          display_name?: string | null
          event_id?: string
          id?: string
          paid_amount?: number | null
          paid_at?: string | null
          payment_status?: string | null
          phone?: string | null
          purchase_email?: string | null
          qr_token?: string | null
          sms_opt_in?: boolean | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "paid_events"
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
      cities: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      connect_waitlist: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
        }
        Relationships: []
      }
      curated_submissions: {
        Row: {
          admin_notes: string | null
          admin_status: string | null
          artist_name: string
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
          original_filename: string | null
          phone: string | null
          physical_product: string | null
          short_bio: string | null
          song_image_url: string | null
          song_title: string
          spotify_url: string
          status: string
        }
        Insert: {
          admin_notes?: string | null
          admin_status?: string | null
          artist_name: string
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
          original_filename?: string | null
          phone?: string | null
          physical_product?: string | null
          short_bio?: string | null
          song_image_url?: string | null
          song_title: string
          spotify_url: string
          status?: string
        }
        Update: {
          admin_notes?: string | null
          admin_status?: string | null
          artist_name?: string
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
          original_filename?: string | null
          phone?: string | null
          physical_product?: string | null
          short_bio?: string | null
          song_image_url?: string | null
          song_title?: string
          spotify_url?: string
          status?: string
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
        Relationships: [
          {
            foreignKeyName: "email_optins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_optins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "paid_events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          admin_state: string
          after_party_enabled: boolean
          after_party_expires_at: string | null
          after_party_opens_at: string | null
          after_party_started_at: string | null
          artist_access_token: string | null
          artist_entered_sms_at: string | null
          artist_name: string | null
          artist_user_id: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          curator_id: string | null
          curator_other_name: string | null
          ends_at: string | null
          fixed_price: number | null
          genres: string[] | null
          id: string
          image_url: string | null
          livestream_url: string | null
          merch_link: string | null
          min_price: number | null
          music_link: string | null
          payment_status: string | null
          pinned_message: string | null
          plan: string | null
          pricing_locked_at: string | null
          pricing_mode: string | null
          revenue_cap: number | null
          start_at: string
          status: Database["public"]["Enums"]["event_status"]
          stripe_account_id: string | null
          ticket_url: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          venue_id: string | null
          venue_name: string | null
          venue_other_name: string | null
          youtube_url: string | null
        }
        Insert: {
          admin_state?: string
          after_party_enabled?: boolean
          after_party_expires_at?: string | null
          after_party_opens_at?: string | null
          after_party_started_at?: string | null
          artist_access_token?: string | null
          artist_entered_sms_at?: string | null
          artist_name?: string | null
          artist_user_id?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          curator_id?: string | null
          curator_other_name?: string | null
          ends_at?: string | null
          fixed_price?: number | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          livestream_url?: string | null
          merch_link?: string | null
          min_price?: number | null
          music_link?: string | null
          payment_status?: string | null
          pinned_message?: string | null
          plan?: string | null
          pricing_locked_at?: string | null
          pricing_mode?: string | null
          revenue_cap?: number | null
          start_at: string
          status?: Database["public"]["Enums"]["event_status"]
          stripe_account_id?: string | null
          ticket_url?: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          venue_id?: string | null
          venue_name?: string | null
          venue_other_name?: string | null
          youtube_url?: string | null
        }
        Update: {
          admin_state?: string
          after_party_enabled?: boolean
          after_party_expires_at?: string | null
          after_party_opens_at?: string | null
          after_party_started_at?: string | null
          artist_access_token?: string | null
          artist_entered_sms_at?: string | null
          artist_name?: string | null
          artist_user_id?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          curator_id?: string | null
          curator_other_name?: string | null
          ends_at?: string | null
          fixed_price?: number | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          livestream_url?: string | null
          merch_link?: string | null
          min_price?: number | null
          music_link?: string | null
          payment_status?: string | null
          pinned_message?: string | null
          plan?: string | null
          pricing_locked_at?: string | null
          pricing_mode?: string | null
          revenue_cap?: number | null
          start_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          stripe_account_id?: string | null
          ticket_url?: string | null
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
          venue_id?: string | null
          venue_name?: string | null
          venue_other_name?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_curator_id_fkey"
            columns: ["curator_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      general_submissions: {
        Row: {
          admin_notes: string | null
          admin_status: string | null
          artist_name: string
          contact_email: string
          created_at: string
          id: string
          instagram_handle: string | null
          music_release_agreed: boolean
          music_release_agreed_at: string | null
          notes: string | null
          payment_status: string | null
          phone: string | null
          promo_code: string | null
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
          contact_email: string
          created_at?: string
          id?: string
          instagram_handle?: string | null
          music_release_agreed?: boolean
          music_release_agreed_at?: string | null
          notes?: string | null
          payment_status?: string | null
          phone?: string | null
          promo_code?: string | null
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
          contact_email?: string
          created_at?: string
          id?: string
          instagram_handle?: string | null
          music_release_agreed?: boolean
          music_release_agreed_at?: string | null
          notes?: string | null
          payment_status?: string | null
          phone?: string | null
          promo_code?: string | null
          song_title?: string
          spotify_url?: string
          status?: string
          stripe_session_id?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      lls_artist_submissions: {
        Row: {
          artist_name: string
          city_market: string
          contact_email: string
          created_at: string
          genre_style: string
          how_heard: string | null
          id: string
          instagram_handle: string | null
          music_link: string | null
          physical_product: string
          short_bio: string | null
          song_image_url: string | null
        }
        Insert: {
          artist_name: string
          city_market: string
          contact_email: string
          created_at?: string
          genre_style: string
          how_heard?: string | null
          id?: string
          instagram_handle?: string | null
          music_link?: string | null
          physical_product: string
          short_bio?: string | null
          song_image_url?: string | null
        }
        Update: {
          artist_name?: string
          city_market?: string
          contact_email?: string
          created_at?: string
          genre_style?: string
          how_heard?: string | null
          id?: string
          instagram_handle?: string | null
          music_link?: string | null
          physical_product?: string
          short_bio?: string | null
          song_image_url?: string | null
        }
        Relationships: []
      }
      lls_curated_codes: {
        Row: {
          code: string
          created_at: string
          given_to: string | null
          id: string
          is_used: boolean
          used_at: string | null
          used_by_email: string | null
        }
        Insert: {
          code: string
          created_at?: string
          given_to?: string | null
          id?: string
          is_used?: boolean
          used_at?: string | null
          used_by_email?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          given_to?: string | null
          id?: string
          is_used?: boolean
          used_at?: string | null
          used_by_email?: string | null
        }
        Relationships: []
      }
      lls_guest_claims: {
        Row: {
          artist_name: string
          checked_in_at: string | null
          checked_in_by: string | null
          checkin_status: string
          claimed_at: string
          event_id: string
          guest_email: string
          guest_name: string
          guest_role: string
          id: string
          invite_code_id: string
          qr_image_url: string | null
          qr_token: string
        }
        Insert: {
          artist_name: string
          checked_in_at?: string | null
          checked_in_by?: string | null
          checkin_status?: string
          claimed_at?: string
          event_id: string
          guest_email: string
          guest_name: string
          guest_role: string
          id?: string
          invite_code_id: string
          qr_image_url?: string | null
          qr_token: string
        }
        Update: {
          artist_name?: string
          checked_in_at?: string | null
          checked_in_by?: string | null
          checkin_status?: string
          claimed_at?: string
          event_id?: string
          guest_email?: string
          guest_name?: string
          guest_role?: string
          id?: string
          invite_code_id?: string
          qr_image_url?: string | null
          qr_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "lls_guest_claims_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lls_guest_claims_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "paid_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lls_guest_claims_invite_code_id_fkey"
            columns: ["invite_code_id"]
            isOneToOne: false
            referencedRelation: "lls_invite_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      lls_invite_codes: {
        Row: {
          artist_name: string
          code: string
          created_at: string
          curator_name: string | null
          event_id: string
          expires_at: string | null
          id: string
          is_active: boolean
        }
        Insert: {
          artist_name: string
          code: string
          created_at?: string
          curator_name?: string | null
          event_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
        }
        Update: {
          artist_name?: string
          code?: string
          created_at?: string
          curator_name?: string | null
          event_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "lls_invite_codes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lls_invite_codes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "paid_events"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "lls_music_release_signatures_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lls_music_release_signatures_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "paid_events"
            referencedColumns: ["id"]
          },
        ]
      }
      lls_partners: {
        Row: {
          city: string
          contact_email: string
          contact_name: string
          created_at: string | null
          has_local_music_space: string | null
          id: string
          notes: string | null
          store_name: string
          store_slug: string
          store_type: string
          terms_accepted: boolean | null
        }
        Insert: {
          city: string
          contact_email: string
          contact_name: string
          created_at?: string | null
          has_local_music_space?: string | null
          id?: string
          notes?: string | null
          store_name: string
          store_slug: string
          store_type: string
          terms_accepted?: boolean | null
        }
        Update: {
          city?: string
          contact_email?: string
          contact_name?: string
          created_at?: string | null
          has_local_music_space?: string | null
          id?: string
          notes?: string | null
          store_name?: string
          store_slug?: string
          store_type?: string
          terms_accepted?: boolean | null
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
          store_type?: string
          terms_accepted?: boolean | null
        }
        Relationships: []
      }
      lls_votes: {
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
      partners: {
        Row: {
          active: boolean
          city_id: string | null
          created_at: string
          flyer_image_url: string | null
          flyer_updated_at: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["partner_type"]
        }
        Insert: {
          active?: boolean
          city_id?: string | null
          created_at?: string
          flyer_image_url?: string | null
          flyer_updated_at?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["partner_type"]
        }
        Update: {
          active?: boolean
          city_id?: string | null
          created_at?: string
          flyer_image_url?: string | null
          flyer_updated_at?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["partner_type"]
        }
        Relationships: [
          {
            foreignKeyName: "partners_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean
          kind: string
          max_redemptions: number | null
          redemption_count: number
          starts_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          kind: string
          max_redemptions?: number | null
          redemption_count?: number
          starts_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          max_redemptions?: number | null
          redemption_count?: number
          starts_at?: string | null
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
          {
            foreignKeyName: "recaps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "paid_events"
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
          admin_status: string | null
          artist_name: string
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
      paid_events: {
        Row: {
          admin_state: string | null
          after_party_enabled: boolean | null
          after_party_expires_at: string | null
          after_party_opens_at: string | null
          after_party_started_at: string | null
          artist_access_token: string | null
          artist_entered_sms_at: string | null
          artist_name: string | null
          artist_user_id: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          curator_id: string | null
          curator_other_name: string | null
          ends_at: string | null
          fixed_price: number | null
          genres: string[] | null
          id: string | null
          image_url: string | null
          livestream_url: string | null
          merch_link: string | null
          min_price: number | null
          music_link: string | null
          payment_status: string | null
          pinned_message: string | null
          plan: string | null
          pricing_locked_at: string | null
          pricing_mode: string | null
          revenue_cap: number | null
          start_at: string | null
          status: Database["public"]["Enums"]["event_status"] | null
          stripe_account_id: string | null
          ticket_url: string | null
          title: string | null
          type: Database["public"]["Enums"]["event_type"] | null
          venue_id: string | null
          venue_name: string | null
          venue_other_name: string | null
          youtube_url: string | null
        }
        Insert: {
          admin_state?: string | null
          after_party_enabled?: boolean | null
          after_party_expires_at?: string | null
          after_party_opens_at?: string | null
          after_party_started_at?: string | null
          artist_access_token?: string | null
          artist_entered_sms_at?: string | null
          artist_name?: string | null
          artist_user_id?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          curator_id?: string | null
          curator_other_name?: string | null
          ends_at?: string | null
          fixed_price?: number | null
          genres?: string[] | null
          id?: string | null
          image_url?: string | null
          livestream_url?: string | null
          merch_link?: string | null
          min_price?: number | null
          music_link?: string | null
          payment_status?: string | null
          pinned_message?: string | null
          plan?: string | null
          pricing_locked_at?: string | null
          pricing_mode?: string | null
          revenue_cap?: number | null
          start_at?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          stripe_account_id?: string | null
          ticket_url?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["event_type"] | null
          venue_id?: string | null
          venue_name?: string | null
          venue_other_name?: string | null
          youtube_url?: string | null
        }
        Update: {
          admin_state?: string | null
          after_party_enabled?: boolean | null
          after_party_expires_at?: string | null
          after_party_opens_at?: string | null
          after_party_started_at?: string | null
          artist_access_token?: string | null
          artist_entered_sms_at?: string | null
          artist_name?: string | null
          artist_user_id?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          curator_id?: string | null
          curator_other_name?: string | null
          ends_at?: string | null
          fixed_price?: number | null
          genres?: string[] | null
          id?: string | null
          image_url?: string | null
          livestream_url?: string | null
          merch_link?: string | null
          min_price?: number | null
          music_link?: string | null
          payment_status?: string | null
          pinned_message?: string | null
          plan?: string | null
          pricing_locked_at?: string | null
          pricing_mode?: string | null
          revenue_cap?: number | null
          start_at?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          stripe_account_id?: string | null
          ticket_url?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["event_type"] | null
          venue_id?: string | null
          venue_name?: string | null
          venue_other_name?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_curator_id_fkey"
            columns: ["curator_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
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
