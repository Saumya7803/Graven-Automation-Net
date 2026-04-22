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
      abandoned_carts: {
        Row: {
          abandoned_at: string
          abandonment_stage: string
          browser: string | null
          cart_snapshot: Json
          cart_value: number
          converted_order_id: string | null
          created_at: string | null
          current_sequence: string | null
          device_type: string | null
          discount_code: string | null
          engagement_score: number | null
          expires_at: string
          final_reminder_sent_at: string | null
          first_reminder_sent_at: string | null
          id: string
          last_visit_at: string | null
          recovered_at: string | null
          recovery_link_click_count: number | null
          recovery_link_clicked_at: string | null
          recovery_method: string | null
          recovery_token: string | null
          second_reminder_sent_at: string | null
          sequence_changed_at: string | null
          sequence_stage: number | null
          status: string
          third_reminder_sent_at: string | null
          updated_at: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          visit_count: number | null
        }
        Insert: {
          abandoned_at?: string
          abandonment_stage: string
          browser?: string | null
          cart_snapshot: Json
          cart_value: number
          converted_order_id?: string | null
          created_at?: string | null
          current_sequence?: string | null
          device_type?: string | null
          discount_code?: string | null
          engagement_score?: number | null
          expires_at?: string
          final_reminder_sent_at?: string | null
          first_reminder_sent_at?: string | null
          id?: string
          last_visit_at?: string | null
          recovered_at?: string | null
          recovery_link_click_count?: number | null
          recovery_link_clicked_at?: string | null
          recovery_method?: string | null
          recovery_token?: string | null
          second_reminder_sent_at?: string | null
          sequence_changed_at?: string | null
          sequence_stage?: number | null
          status?: string
          third_reminder_sent_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visit_count?: number | null
        }
        Update: {
          abandoned_at?: string
          abandonment_stage?: string
          browser?: string | null
          cart_snapshot?: Json
          cart_value?: number
          converted_order_id?: string | null
          created_at?: string | null
          current_sequence?: string | null
          device_type?: string | null
          discount_code?: string | null
          engagement_score?: number | null
          expires_at?: string
          final_reminder_sent_at?: string | null
          first_reminder_sent_at?: string | null
          id?: string
          last_visit_at?: string | null
          recovered_at?: string | null
          recovery_link_click_count?: number | null
          recovery_link_clicked_at?: string | null
          recovery_method?: string | null
          recovery_token?: string | null
          second_reminder_sent_at?: string | null
          sequence_changed_at?: string | null
          sequence_stage?: number | null
          status?: string
          third_reminder_sent_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_carts_converted_order_id_fkey"
            columns: ["converted_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_preview: string
          last_used_at: string | null
          name: string
          permissions: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_preview: string
          last_used_at?: string | null
          name: string
          permissions?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_preview?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json | null
        }
        Relationships: []
      }
      authors: {
        Row: {
          bio: string | null
          created_at: string | null
          expertise: string[] | null
          id: string
          image_url: string | null
          name: string
          social_links: Json | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          expertise?: string[] | null
          id?: string
          image_url?: string | null
          name: string
          social_links?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          expertise?: string[] | null
          id?: string
          image_url?: string | null
          name?: string
          social_links?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      callback_requests: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          call_duration_minutes: number | null
          company_name: string | null
          contacted_at: string | null
          contacted_by: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          follow_up_date: string | null
          id: string
          location_page: string | null
          message: string | null
          outcome: string | null
          preferred_date: string | null
          preferred_time_slot: string | null
          priority: string
          reason: string | null
          reminder_sent_at: string | null
          scheduled_date_time: string | null
          source: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          call_duration_minutes?: number | null
          company_name?: string | null
          contacted_at?: string | null
          contacted_by?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          follow_up_date?: string | null
          id?: string
          location_page?: string | null
          message?: string | null
          outcome?: string | null
          preferred_date?: string | null
          preferred_time_slot?: string | null
          priority?: string
          reason?: string | null
          reminder_sent_at?: string | null
          scheduled_date_time?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          call_duration_minutes?: number | null
          company_name?: string | null
          contacted_at?: string | null
          contacted_by?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          follow_up_date?: string | null
          id?: string
          location_page?: string | null
          message?: string | null
          outcome?: string | null
          preferred_date?: string | null
          preferred_time_slot?: string | null
          priority?: string
          reason?: string | null
          reminder_sent_at?: string | null
          scheduled_date_time?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_recovery_interactions: {
        Row: {
          abandoned_cart_id: string | null
          created_at: string | null
          id: string
          interaction_type: string
          metadata: Json | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          abandoned_cart_id?: string | null
          created_at?: string | null
          id?: string
          interaction_type: string
          metadata?: Json | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          abandoned_cart_id?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          metadata?: Json | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_recovery_interactions_abandoned_cart_id_fkey"
            columns: ["abandoned_cart_id"]
            isOneToOne: false
            referencedRelation: "abandoned_carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_recovery_interactions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "cart_recovery_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_recovery_sequences: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          sequence_name: string
          stages: Json
          trigger_conditions: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          sequence_name: string
          stages: Json
          trigger_conditions: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          sequence_name?: string
          stages?: Json
          trigger_conditions?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      cart_recovery_templates: {
        Row: {
          conversions: number | null
          created_at: string | null
          created_by: string | null
          discount_code_prefix: string | null
          discount_type: string | null
          discount_value: number | null
          email_html: string | null
          email_subject: string | null
          id: string
          is_active: boolean | null
          max_cart_value: number | null
          min_cart_value: number | null
          name: string
          push_action_url: string | null
          push_badge: string | null
          push_body: string | null
          push_icon: string | null
          push_title: string | null
          send_after_hours: number
          stage_number: number
          target_tiers: string[] | null
          template_type: string
          times_clicked: number | null
          times_opened: number | null
          times_sent: number | null
          updated_at: string | null
          variant: string | null
        }
        Insert: {
          conversions?: number | null
          created_at?: string | null
          created_by?: string | null
          discount_code_prefix?: string | null
          discount_type?: string | null
          discount_value?: number | null
          email_html?: string | null
          email_subject?: string | null
          id?: string
          is_active?: boolean | null
          max_cart_value?: number | null
          min_cart_value?: number | null
          name: string
          push_action_url?: string | null
          push_badge?: string | null
          push_body?: string | null
          push_icon?: string | null
          push_title?: string | null
          send_after_hours: number
          stage_number: number
          target_tiers?: string[] | null
          template_type: string
          times_clicked?: number | null
          times_opened?: number | null
          times_sent?: number | null
          updated_at?: string | null
          variant?: string | null
        }
        Update: {
          conversions?: number | null
          created_at?: string | null
          created_by?: string | null
          discount_code_prefix?: string | null
          discount_type?: string | null
          discount_value?: number | null
          email_html?: string | null
          email_subject?: string | null
          id?: string
          is_active?: boolean | null
          max_cart_value?: number | null
          min_cart_value?: number | null
          name?: string
          push_action_url?: string | null
          push_badge?: string | null
          push_body?: string | null
          push_icon?: string | null
          push_title?: string | null
          send_after_hours?: number
          stage_number?: number
          target_tiers?: string[] | null
          template_type?: string
          times_clicked?: number | null
          times_opened?: number | null
          times_sent?: number | null
          updated_at?: string | null
          variant?: string | null
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          challenge: string
          client_logo_url: string | null
          client_name: string | null
          created_at: string | null
          featured_image: string | null
          id: string
          industry: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          products_used: string[] | null
          published: boolean | null
          results: Json | null
          slug: string
          solution: string
          testimonial: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          challenge: string
          client_logo_url?: string | null
          client_name?: string | null
          created_at?: string | null
          featured_image?: string | null
          id?: string
          industry?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          products_used?: string[] | null
          published?: boolean | null
          results?: Json | null
          slug: string
          solution: string
          testimonial?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          challenge?: string
          client_logo_url?: string | null
          client_name?: string | null
          created_at?: string | null
          featured_image?: string | null
          id?: string
          industry?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          products_used?: string[] | null
          published?: boolean | null
          results?: Json | null
          slug?: string
          solution?: string
          testimonial?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      commercial_content: {
        Row: {
          content_blocks: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          meta_description: string
          meta_keywords: string[] | null
          page_slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content_blocks?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          meta_description: string
          meta_keywords?: string[] | null
          page_slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content_blocks?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string
          meta_keywords?: string[] | null
          page_slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comparison_pages: {
        Row: {
          comparison_data: Json
          created_at: string | null
          faqs: Json | null
          id: string
          is_active: boolean | null
          meta_description: string
          meta_keywords: string[] | null
          product_a_name: string
          product_b_name: string
          related_products: string[] | null
          slug: string
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          comparison_data?: Json
          created_at?: string | null
          faqs?: Json | null
          id?: string
          is_active?: boolean | null
          meta_description: string
          meta_keywords?: string[] | null
          product_a_name: string
          product_b_name: string
          related_products?: string[] | null
          slug: string
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          comparison_data?: Json
          created_at?: string | null
          faqs?: Json | null
          id?: string
          is_active?: boolean | null
          meta_description?: string
          meta_keywords?: string[] | null
          product_a_name?: string
          product_b_name?: string
          related_products?: string[] | null
          slug?: string
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      customer_communications: {
        Row: {
          channel: string
          clicked_at: string | null
          communication_type: string
          created_at: string | null
          customer_id: string | null
          delivered_at: string | null
          failed_reason: string | null
          full_content: Json | null
          id: string
          message_preview: string | null
          metadata: Json | null
          opened_at: string | null
          sent_at: string | null
          sent_by: string | null
          status: string
          subject: string | null
          user_id: string
        }
        Insert: {
          channel: string
          clicked_at?: string | null
          communication_type: string
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          failed_reason?: string | null
          full_content?: Json | null
          id?: string
          message_preview?: string | null
          metadata?: Json | null
          opened_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          subject?: string | null
          user_id: string
        }
        Update: {
          channel?: string
          clicked_at?: string | null
          communication_type?: string
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          failed_reason?: string | null
          full_content?: Json | null
          id?: string
          message_preview?: string | null
          metadata?: Json | null
          opened_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_communications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_questions: {
        Row: {
          admin_response: string | null
          category: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          is_converted_to_faq: boolean | null
          location_page: string | null
          priority: string
          question: string
          responded_at: string | null
          responded_by: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          category?: string
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          is_converted_to_faq?: boolean | null
          location_page?: string | null
          priority?: string
          question: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          category?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          is_converted_to_faq?: boolean | null
          location_page?: string | null
          priority?: string
          question?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          billing_address: Json | null
          company_name: string | null
          created_at: string
          email: string
          full_name: string
          gst_number: string | null
          id: string
          phone: string | null
          shipping_address: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          company_name?: string | null
          created_at?: string
          email: string
          full_name: string
          gst_number?: string | null
          id?: string
          phone?: string | null
          shipping_address?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string
          gst_number?: string | null
          id?: string
          phone?: string | null
          shipping_address?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_campaign_deliveries: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          customer_email: string
          customer_id: string | null
          customer_tier: string
          error_message: string | null
          id: string
          resend_id: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          customer_email: string
          customer_id?: string | null
          customer_tier: string
          error_message?: string | null
          id?: string
          resend_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          customer_email?: string
          customer_id?: string | null
          customer_tier?: string
          error_message?: string | null
          id?: string
          resend_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_deliveries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaign_deliveries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          created_at: string | null
          created_by: string | null
          email_type: string
          id: string
          name: string
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          target_tiers: string[]
          template_html: string
          total_failed: number | null
          total_recipients: number | null
          total_sent: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email_type: string
          id?: string
          name: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          target_tiers: string[]
          template_html: string
          total_failed?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email_type?: string
          id?: string
          name?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          target_tiers?: string[]
          template_html?: string
          total_failed?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      google_merchant_config: {
        Row: {
          access_token_encrypted: string | null
          created_at: string | null
          id: string
          is_connected: boolean | null
          last_sync_at: string | null
          merchant_id: string
          refresh_token_encrypted: string | null
          sync_status: string | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          merchant_id: string
          refresh_token_encrypted?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          merchant_id?: string
          refresh_token_encrypted?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      google_product_status: {
        Row: {
          approval_status: string | null
          clicks: number | null
          created_at: string | null
          id: string
          impressions: number | null
          item_level_issues: Json | null
          last_synced_at: string | null
          merchant_product_id: string | null
          product_id: string | null
          sync_error: string | null
          updated_at: string | null
        }
        Insert: {
          approval_status?: string | null
          clicks?: number | null
          created_at?: string | null
          id?: string
          impressions?: number | null
          item_level_issues?: Json | null
          last_synced_at?: string | null
          merchant_product_id?: string | null
          product_id?: string | null
          sync_error?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_status?: string | null
          clicks?: number | null
          created_at?: string | null
          id?: string
          impressions?: number | null
          item_level_issues?: Json | null
          last_synced_at?: string | null
          merchant_product_id?: string | null
          product_id?: string | null
          sync_error?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_product_status_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      google_shopping_performance: {
        Row: {
          clicks: number | null
          conversions: number | null
          cost: number | null
          created_at: string | null
          date: string
          id: string
          impressions: number | null
          merchant_product_id: string | null
          product_id: string | null
          revenue: number | null
        }
        Insert: {
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date: string
          id?: string
          impressions?: number | null
          merchant_product_id?: string | null
          product_id?: string | null
          revenue?: number | null
        }
        Update: {
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date?: string
          id?: string
          impressions?: number | null
          merchant_product_id?: string | null
          product_id?: string | null
          revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "google_shopping_performance_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      google_sync_log: {
        Row: {
          created_at: string | null
          errors_count: number | null
          id: string
          initiated_by: string | null
          products_approved: number | null
          products_disapproved: number | null
          products_pending: number | null
          products_synced: number | null
          sync_duration_ms: number | null
          sync_type: string
        }
        Insert: {
          created_at?: string | null
          errors_count?: number | null
          id?: string
          initiated_by?: string | null
          products_approved?: number | null
          products_disapproved?: number | null
          products_pending?: number | null
          products_synced?: number | null
          sync_duration_ms?: number | null
          sync_type: string
        }
        Update: {
          created_at?: string | null
          errors_count?: number | null
          id?: string
          initiated_by?: string | null
          products_approved?: number | null
          products_disapproved?: number | null
          products_pending?: number | null
          products_synced?: number | null
          sync_duration_ms?: number | null
          sync_type?: string
        }
        Relationships: []
      }
      knowledge_hub_pages: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string | null
          downloadable_resources: Json | null
          faqs: Json | null
          id: string
          is_active: boolean | null
          meta_description: string
          meta_keywords: string[] | null
          related_products: string[] | null
          slug: string
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category: string
          content: string
          created_at?: string | null
          downloadable_resources?: Json | null
          faqs?: Json | null
          id?: string
          is_active?: boolean | null
          meta_description: string
          meta_keywords?: string[] | null
          related_products?: string[] | null
          slug: string
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string | null
          downloadable_resources?: Json | null
          faqs?: Json | null
          id?: string
          is_active?: boolean | null
          meta_description?: string
          meta_keywords?: string[] | null
          related_products?: string[] | null
          slug?: string
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_hub_pages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      model_master: {
        Row: {
          brand_slug: string
          category_slug: string
          created_at: string | null
          discontinued_at: string | null
          id: string
          is_active: boolean | null
          key_features: Json | null
          lifecycle_status: string | null
          model_number: string
          name: string
          power_range: string | null
          replacement_models: string[] | null
          series_slug: string
          short_description: string | null
          specifications: Json | null
          updated_at: string | null
        }
        Insert: {
          brand_slug: string
          category_slug: string
          created_at?: string | null
          discontinued_at?: string | null
          id?: string
          is_active?: boolean | null
          key_features?: Json | null
          lifecycle_status?: string | null
          model_number: string
          name: string
          power_range?: string | null
          replacement_models?: string[] | null
          series_slug: string
          short_description?: string | null
          specifications?: Json | null
          updated_at?: string | null
        }
        Update: {
          brand_slug?: string
          category_slug?: string
          created_at?: string | null
          discontinued_at?: string | null
          id?: string
          is_active?: boolean | null
          key_features?: Json | null
          lifecycle_status?: string | null
          model_number?: string
          name?: string
          power_range?: string | null
          replacement_models?: string[] | null
          series_slug?: string
          short_description?: string | null
          specifications?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          company_name: string | null
          email: string
          full_name: string | null
          id: string
          interests: Json | null
          is_active: boolean | null
          source: string | null
          subscribed_at: string | null
          unsubscribe_token: string | null
          user_id: string | null
        }
        Insert: {
          company_name?: string | null
          email: string
          full_name?: string | null
          id?: string
          interests?: Json | null
          is_active?: boolean | null
          source?: string | null
          subscribed_at?: string | null
          unsubscribe_token?: string | null
          user_id?: string | null
        }
        Update: {
          company_name?: string | null
          email?: string
          full_name?: string | null
          id?: string
          interests?: Json | null
          is_active?: boolean | null
          source?: string | null
          subscribed_at?: string | null
          unsubscribe_token?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notification_interactions: {
        Row: {
          action_taken: string | null
          browser: string | null
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          device_type: string | null
          dismissed_at: string | null
          displayed_at: string | null
          id: string
          notification_log_id: string | null
          user_id: string
        }
        Insert: {
          action_taken?: string | null
          browser?: string | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          device_type?: string | null
          dismissed_at?: string | null
          displayed_at?: string | null
          id?: string
          notification_log_id?: string | null
          user_id: string
        }
        Update: {
          action_taken?: string | null
          browser?: string | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          device_type?: string | null
          dismissed_at?: string | null
          displayed_at?: string | null
          id?: string
          notification_log_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_interactions_notification_log_id_fkey"
            columns: ["notification_log_id"]
            isOneToOne: false
            referencedRelation: "notification_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          body: string
          clicked_at: string | null
          data: Json | null
          error_message: string | null
          id: string
          notification_type: string
          sent_at: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          clicked_at?: string | null
          data?: Json | null
          error_message?: string | null
          id?: string
          notification_type: string
          sent_at?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          clicked_at?: string | null
          data?: Json | null
          error_message?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          id: string
          newsletter: boolean | null
          order_cancelled: boolean | null
          order_confirmed: boolean | null
          order_delivered: boolean | null
          order_placed: boolean | null
          order_shipped: boolean | null
          product_updates: boolean | null
          promotional_offers: boolean | null
          quotation_approved: boolean | null
          quotation_finalized: boolean | null
          quotation_received: boolean | null
          quotation_revised: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          newsletter?: boolean | null
          order_cancelled?: boolean | null
          order_confirmed?: boolean | null
          order_delivered?: boolean | null
          order_placed?: boolean | null
          order_shipped?: boolean | null
          product_updates?: boolean | null
          promotional_offers?: boolean | null
          quotation_approved?: boolean | null
          quotation_finalized?: boolean | null
          quotation_received?: boolean | null
          quotation_revised?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          newsletter?: boolean | null
          order_cancelled?: boolean | null
          order_confirmed?: boolean | null
          order_delivered?: boolean | null
          order_placed?: boolean | null
          order_shipped?: boolean | null
          product_updates?: boolean | null
          promotional_offers?: boolean | null
          quotation_approved?: boolean | null
          quotation_finalized?: boolean | null
          quotation_received?: boolean | null
          quotation_revised?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_sku?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          awb_code: string | null
          billing_address: Json
          carrier: string | null
          created_at: string
          customer_id: string
          delivered_at: string | null
          estimated_delivery_date: string | null
          eway_bill_url: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          shipped_at: string | null
          shipping_address: Json
          shipping_cost: number | null
          shipping_label_url: string | null
          shiprocket_order_id: string | null
          shiprocket_shipment_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax_amount: number | null
          tax_invoice_url: string | null
          total_amount: number
          tracking_number: string | null
          updated_at: string
          user_id: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          awb_code?: string | null
          billing_address: Json
          carrier?: string | null
          created_at?: string
          customer_id: string
          delivered_at?: string | null
          estimated_delivery_date?: string | null
          eway_bill_url?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipped_at?: string | null
          shipping_address: Json
          shipping_cost?: number | null
          shipping_label_url?: string | null
          shiprocket_order_id?: string | null
          shiprocket_shipment_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax_amount?: number | null
          tax_invoice_url?: string | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          awb_code?: string | null
          billing_address?: Json
          carrier?: string | null
          created_at?: string
          customer_id?: string
          delivered_at?: string | null
          estimated_delivery_date?: string | null
          eway_bill_url?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipped_at?: string | null
          shipping_address?: Json
          shipping_cost?: number | null
          shipping_label_url?: string | null
          shiprocket_order_id?: string | null
          shiprocket_shipment_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax_amount?: number | null
          tax_invoice_url?: string | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      page_content: {
        Row: {
          content_data: Json
          content_type: string
          id: string
          page_name: string
          section_name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content_data: Json
          content_type: string
          id?: string
          page_name: string
          section_name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content_data?: Json
          content_type?: string
          id?: string
          page_name?: string
          section_name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      payment_gateways: {
        Row: {
          configuration: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          display_name: string
          display_order: number | null
          gateway_name: string
          gateway_type: string
          id: string
          is_active: boolean | null
          is_test_mode: boolean | null
          supported_currencies: Json | null
          updated_at: string | null
        }
        Insert: {
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name: string
          display_order?: number | null
          gateway_name: string
          gateway_type: string
          id?: string
          is_active?: boolean | null
          is_test_mode?: boolean | null
          supported_currencies?: Json | null
          updated_at?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name?: string
          display_order?: number | null
          gateway_name?: string
          gateway_type?: string
          id?: string
          is_active?: boolean | null
          is_test_mode?: boolean | null
          supported_currencies?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      power_conversions: {
        Row: {
          common_applications: string[] | null
          created_at: string | null
          hp: number
          id: string
          kw_max: number
          kw_min: number
        }
        Insert: {
          common_applications?: string[] | null
          created_at?: string | null
          hp: number
          id?: string
          kw_max: number
          kw_min: number
        }
        Update: {
          common_applications?: string[] | null
          created_at?: string | null
          hp?: number
          id?: string
          kw_max?: number
          kw_min?: number
        }
        Relationships: []
      }
      procurement_list_reminders: {
        Row: {
          browser: string | null
          converted_at: string | null
          converted_order_id: string | null
          converted_quotation_id: string | null
          converted_to: string | null
          created_at: string | null
          device_type: string | null
          discount_code: string | null
          engagement_score: number | null
          first_item_added_at: string | null
          first_reminder_sent_at: string | null
          id: string
          item_count: number
          last_activity_at: string | null
          list_snapshot: Json
          list_value: number
          recovery_link_click_count: number | null
          recovery_link_clicked_at: string | null
          recovery_token: string | null
          second_reminder_sent_at: string | null
          sequence_stage: number | null
          status: string
          third_reminder_sent_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          converted_at?: string | null
          converted_order_id?: string | null
          converted_quotation_id?: string | null
          converted_to?: string | null
          created_at?: string | null
          device_type?: string | null
          discount_code?: string | null
          engagement_score?: number | null
          first_item_added_at?: string | null
          first_reminder_sent_at?: string | null
          id?: string
          item_count?: number
          last_activity_at?: string | null
          list_snapshot?: Json
          list_value?: number
          recovery_link_click_count?: number | null
          recovery_link_clicked_at?: string | null
          recovery_token?: string | null
          second_reminder_sent_at?: string | null
          sequence_stage?: number | null
          status?: string
          third_reminder_sent_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          converted_at?: string | null
          converted_order_id?: string | null
          converted_quotation_id?: string | null
          converted_to?: string | null
          created_at?: string | null
          device_type?: string | null
          discount_code?: string | null
          engagement_score?: number | null
          first_item_added_at?: string | null
          first_reminder_sent_at?: string | null
          id?: string
          item_count?: number
          last_activity_at?: string | null
          list_snapshot?: Json
          list_value?: number
          recovery_link_click_count?: number | null
          recovery_link_clicked_at?: string | null
          recovery_token?: string | null
          second_reminder_sent_at?: string | null
          sequence_stage?: number | null
          status?: string
          third_reminder_sent_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      procurement_recovery_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string
          metadata: Json | null
          reminder_id: string | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type: string
          metadata?: Json | null
          reminder_id?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string
          metadata?: Json | null
          reminder_id?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procurement_recovery_interactions_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "procurement_list_reminders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_recovery_interactions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "procurement_recovery_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_recovery_templates: {
        Row: {
          conversions: number | null
          created_at: string | null
          created_by: string | null
          discount_code_prefix: string | null
          discount_type: string | null
          discount_value: number | null
          email_html: string | null
          email_subject: string | null
          id: string
          is_active: boolean | null
          max_list_value: number | null
          min_list_value: number | null
          name: string
          push_action_url: string | null
          push_body: string | null
          push_icon: string | null
          push_title: string | null
          send_after_days: number
          stage_number: number
          target_tiers: string[] | null
          template_type: string
          times_clicked: number | null
          times_opened: number | null
          times_sent: number | null
          updated_at: string | null
        }
        Insert: {
          conversions?: number | null
          created_at?: string | null
          created_by?: string | null
          discount_code_prefix?: string | null
          discount_type?: string | null
          discount_value?: number | null
          email_html?: string | null
          email_subject?: string | null
          id?: string
          is_active?: boolean | null
          max_list_value?: number | null
          min_list_value?: number | null
          name: string
          push_action_url?: string | null
          push_body?: string | null
          push_icon?: string | null
          push_title?: string | null
          send_after_days?: number
          stage_number?: number
          target_tiers?: string[] | null
          template_type?: string
          times_clicked?: number | null
          times_opened?: number | null
          times_sent?: number | null
          updated_at?: string | null
        }
        Update: {
          conversions?: number | null
          created_at?: string | null
          created_by?: string | null
          discount_code_prefix?: string | null
          discount_type?: string | null
          discount_value?: number | null
          email_html?: string | null
          email_subject?: string | null
          id?: string
          is_active?: boolean | null
          max_list_value?: number | null
          min_list_value?: number | null
          name?: string
          push_action_url?: string | null
          push_body?: string | null
          push_icon?: string | null
          push_title?: string | null
          send_after_days?: number
          stage_number?: number
          target_tiers?: string[] | null
          template_type?: string
          times_clicked?: number | null
          times_opened?: number | null
          times_sent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          applications: string[] | null
          benefits: string[] | null
          created_at: string | null
          description: string | null
          featured_product_ids: string[] | null
          id: string
          long_description: string | null
          meta_keywords: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          applications?: string[] | null
          benefits?: string[] | null
          created_at?: string | null
          description?: string | null
          featured_product_ids?: string[] | null
          id?: string
          long_description?: string | null
          meta_keywords?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          applications?: string[] | null
          benefits?: string[] | null
          created_at?: string | null
          description?: string | null
          featured_product_ids?: string[] | null
          id?: string
          long_description?: string | null
          meta_keywords?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_category_mapping: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          product_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          product_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_category_mapping_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_category_mapping_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_documents: {
        Row: {
          created_at: string | null
          display_order: number | null
          document_name: string
          document_type: string
          file_size_kb: number | null
          file_url: string
          id: string
          is_active: boolean | null
          product_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          document_name: string
          document_type: string
          file_size_kb?: number | null
          file_url: string
          id?: string
          is_active?: boolean | null
          product_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          document_name?: string
          document_type?: string
          file_size_kb?: number | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_documents_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_faqs: {
        Row: {
          answer: string
          created_at: string | null
          display_order: number | null
          id: string
          product_id: string
          question: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          product_id: string
          question: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          product_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_faqs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_replacements: {
        Row: {
          compatibility_notes: string | null
          created_at: string | null
          display_order: number | null
          id: string
          product_id: string
          replacement_product_id: string
          replacement_type: string
          updated_at: string | null
        }
        Insert: {
          compatibility_notes?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          product_id: string
          replacement_product_id: string
          replacement_type: string
          updated_at?: string | null
        }
        Update: {
          compatibility_notes?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          product_id?: string
          replacement_product_id?: string
          replacement_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_replacements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_replacements_replacement_product_id_fkey"
            columns: ["replacement_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string
          created_at: string | null
          helpful_count: number | null
          id: string
          is_approved: boolean | null
          product_id: string
          rating: number
          updated_at: string | null
          user_id: string
          verified_purchase: boolean | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          product_id: string
          rating: number
          updated_at?: string | null
          user_id: string
          verified_purchase?: boolean | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          product_id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specifications: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          product_id: string
          spec_key: string
          spec_value: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          product_id: string
          spec_key: string
          spec_value: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          product_id?: string
          spec_key?: string
          spec_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category_id: string | null
          condition: string | null
          created_at: string | null
          description: string | null
          discontinued_at: string | null
          featured: boolean | null
          google_product_category: string | null
          gtin: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_quote_only: boolean | null
          key_features: Json | null
          lifecycle_notes: string | null
          lifecycle_status: string | null
          name: string
          power_range: string | null
          price: number | null
          series: string
          shipping_cost: number | null
          short_description: string | null
          sku: string
          stock_quantity: number | null
          updated_at: string | null
          video_duration: string | null
          video_thumbnail: string | null
          video_url: string | null
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          discontinued_at?: string | null
          featured?: boolean | null
          google_product_category?: string | null
          gtin?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_quote_only?: boolean | null
          key_features?: Json | null
          lifecycle_notes?: string | null
          lifecycle_status?: string | null
          name: string
          power_range?: string | null
          price?: number | null
          series: string
          shipping_cost?: number | null
          short_description?: string | null
          sku: string
          stock_quantity?: number | null
          updated_at?: string | null
          video_duration?: string | null
          video_thumbnail?: string | null
          video_url?: string | null
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          discontinued_at?: string | null
          featured?: boolean | null
          google_product_category?: string | null
          gtin?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_quote_only?: boolean | null
          key_features?: Json | null
          lifecycle_notes?: string | null
          lifecycle_status?: string | null
          name?: string
          power_range?: string | null
          price?: number | null
          series?: string
          shipping_cost?: number | null
          short_description?: string | null
          sku?: string
          stock_quantity?: number | null
          updated_at?: string | null
          video_duration?: string | null
          video_thumbnail?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          device_name: string | null
          device_type: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          last_used_at: string | null
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quotation_audit_log: {
        Row: {
          change_summary: string | null
          change_type: string
          changed_by: string | null
          created_at: string
          field_name: string | null
          id: string
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          quotation_request_id: string
        }
        Insert: {
          change_summary?: string | null
          change_type: string
          changed_by?: string | null
          created_at?: string
          field_name?: string | null
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          quotation_request_id: string
        }
        Update: {
          change_summary?: string | null
          change_type?: string
          changed_by?: string | null
          created_at?: string
          field_name?: string | null
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          quotation_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_audit_log_quotation_request_id_fkey"
            columns: ["quotation_request_id"]
            isOneToOne: false
            referencedRelation: "quotation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_request_items: {
        Row: {
          created_at: string
          discount_amount: number | null
          discount_percentage: number | null
          final_price: number | null
          id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          quotation_request_id: string
          subtotal: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          discount_percentage?: number | null
          final_price?: number | null
          id?: string
          product_id: string
          product_name: string
          product_sku: string
          quantity?: number
          quotation_request_id: string
          subtotal?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          discount_percentage?: number | null
          final_price?: number | null
          id?: string
          product_id?: string
          product_name?: string
          product_sku?: string
          quantity?: number
          quotation_request_id?: string
          subtotal?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_request_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_request_items_quotation_request_id_fkey"
            columns: ["quotation_request_id"]
            isOneToOne: false
            referencedRelation: "quotation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_requests: {
        Row: {
          admin_notes: string | null
          attachment_url: string | null
          company_name: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          discount_amount: number | null
          discount_percentage: number | null
          expires_at: string | null
          final_amount: number | null
          id: string
          is_final: boolean | null
          message: string
          order_id: string | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          quote_notes: string | null
          quoted_at: string | null
          status: Database["public"]["Enums"]["quotation_status"]
          total_amount: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          attachment_url?: string | null
          company_name?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          final_amount?: number | null
          id?: string
          is_final?: boolean | null
          message: string
          order_id?: string | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          quote_notes?: string | null
          quoted_at?: string | null
          status?: Database["public"]["Enums"]["quotation_status"]
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          attachment_url?: string | null
          company_name?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          final_amount?: number | null
          id?: string
          is_final?: boolean | null
          message?: string
          order_id?: string | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          quote_notes?: string | null
          quoted_at?: string | null
          status?: Database["public"]["Enums"]["quotation_status"]
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_revisions: {
        Row: {
          created_at: string
          discount_amount: number
          discount_percentage: number
          final_amount: number
          id: string
          quotation_request_id: string
          revised_by: string | null
          revision_notes: string | null
          revision_number: number
          total_amount: number
        }
        Insert: {
          created_at?: string
          discount_amount?: number
          discount_percentage?: number
          final_amount?: number
          id?: string
          quotation_request_id: string
          revised_by?: string | null
          revision_notes?: string | null
          revision_number: number
          total_amount?: number
        }
        Update: {
          created_at?: string
          discount_amount?: number
          discount_percentage?: number
          final_amount?: number
          id?: string
          quotation_request_id?: string
          revised_by?: string | null
          revision_notes?: string | null
          revision_number?: number
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_revisions_quotation_request_id_fkey"
            columns: ["quotation_request_id"]
            isOneToOne: false
            referencedRelation: "quotation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_push_notifications: {
        Row: {
          action_url: string | null
          badge: string | null
          body: string
          created_at: string | null
          created_by: string | null
          error_message: string | null
          icon: string | null
          id: string
          notification_type: string | null
          scheduled_at: string
          sent_at: string | null
          status: string
          target_type: string
          target_value: string | null
          title: string
          total_failed: number | null
          total_sent: number | null
          total_targeted: number | null
          updated_at: string | null
        }
        Insert: {
          action_url?: string | null
          badge?: string | null
          body: string
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          icon?: string | null
          id?: string
          notification_type?: string | null
          scheduled_at: string
          sent_at?: string | null
          status?: string
          target_type: string
          target_value?: string | null
          title: string
          total_failed?: number | null
          total_sent?: number | null
          total_targeted?: number | null
          updated_at?: string | null
        }
        Update: {
          action_url?: string | null
          badge?: string | null
          body?: string
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          icon?: string | null
          id?: string
          notification_type?: string | null
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          target_type?: string
          target_value?: string | null
          title?: string
          total_failed?: number | null
          total_sent?: number | null
          total_targeted?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      search_alert_config: {
        Row: {
          alert_type: string
          check_frequency_minutes: number | null
          cooldown_hours: number | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          notification_methods: Json | null
          recipient_emails: string[] | null
          threshold_count: number
          time_window_hours: number
          updated_at: string | null
        }
        Insert: {
          alert_type?: string
          check_frequency_minutes?: number | null
          cooldown_hours?: number | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_methods?: Json | null
          recipient_emails?: string[] | null
          threshold_count?: number
          time_window_hours?: number
          updated_at?: string | null
        }
        Update: {
          alert_type?: string
          check_frequency_minutes?: number | null
          cooldown_hours?: number | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_methods?: Json | null
          recipient_emails?: string[] | null
          threshold_count?: number
          time_window_hours?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      search_alert_history: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          action_taken: string | null
          alert_type: string
          created_at: string | null
          id: string
          notification_methods: string[] | null
          notification_sent_at: string | null
          priority_score: number
          recipients: string[] | null
          search_query: string
          threshold_exceeded: number
          zero_results_count: number
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_taken?: string | null
          alert_type?: string
          created_at?: string | null
          id?: string
          notification_methods?: string[] | null
          notification_sent_at?: string | null
          priority_score?: number
          recipients?: string[] | null
          search_query: string
          threshold_exceeded: number
          zero_results_count: number
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_taken?: string | null
          alert_type?: string
          created_at?: string | null
          id?: string
          notification_methods?: string[] | null
          notification_sent_at?: string | null
          priority_score?: number
          recipients?: string[] | null
          search_query?: string
          threshold_exceeded?: number
          zero_results_count?: number
        }
        Relationships: []
      }
      search_aliases: {
        Row: {
          alias: string
          alias_type: string | null
          canonical_term: string
          category_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          alias: string
          alias_type?: string | null
          canonical_term: string
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          alias?: string
          alias_type?: string | null
          canonical_term?: string
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_aliases_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      search_analytics: {
        Row: {
          created_at: string | null
          id: string
          last_searched_at: string | null
          results_count: number | null
          search_count: number | null
          search_query: string
          zero_results_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_searched_at?: string | null
          results_count?: number | null
          search_count?: number | null
          search_query: string
          zero_results_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_searched_at?: string | null
          results_count?: number | null
          search_count?: number | null
          search_query?: string
          zero_results_count?: number | null
        }
        Relationships: []
      }
      seo_health_checks: {
        Row: {
          check_type: string
          checked_at: string | null
          id: string
          issues: Json | null
          metadata: Json | null
          page_url: string | null
          score: number | null
          status: string
        }
        Insert: {
          check_type: string
          checked_at?: string | null
          id?: string
          issues?: Json | null
          metadata?: Json | null
          page_url?: string | null
          score?: number | null
          status?: string
        }
        Update: {
          check_type?: string
          checked_at?: string | null
          id?: string
          issues?: Json | null
          metadata?: Json | null
          page_url?: string | null
          score?: number | null
          status?: string
        }
        Relationships: []
      }
      seo_international_pages: {
        Row: {
          country: string
          country_code: string
          created_at: string | null
          currency_code: string | null
          currency_symbol: string | null
          customs_info: string | null
          delivery_time: string | null
          h1_title: string
          has_local_office: boolean | null
          id: string
          intro_content: string | null
          is_published: boolean | null
          language_code: string | null
          local_certifications: Json | null
          local_contact: string | null
          meta_description: string
          meta_title: string
          region: string | null
          shipping_info: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          country: string
          country_code: string
          created_at?: string | null
          currency_code?: string | null
          currency_symbol?: string | null
          customs_info?: string | null
          delivery_time?: string | null
          h1_title: string
          has_local_office?: boolean | null
          id?: string
          intro_content?: string | null
          is_published?: boolean | null
          language_code?: string | null
          local_certifications?: Json | null
          local_contact?: string | null
          meta_description: string
          meta_title: string
          region?: string | null
          shipping_info?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          country?: string
          country_code?: string
          created_at?: string | null
          currency_code?: string | null
          currency_symbol?: string | null
          customs_info?: string | null
          delivery_time?: string | null
          h1_title?: string
          has_local_office?: boolean | null
          id?: string
          intro_content?: string | null
          is_published?: boolean | null
          language_code?: string | null
          local_certifications?: Json | null
          local_contact?: string | null
          meta_description?: string
          meta_title?: string
          region?: string | null
          shipping_info?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_keyword_mappings: {
        Row: {
          created_at: string | null
          current_ranking: number | null
          id: string
          is_primary_keyword: boolean | null
          keyword_id: string | null
          last_checked: string | null
          position: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string | null
          current_ranking?: number | null
          id?: string
          is_primary_keyword?: boolean | null
          keyword_id?: string | null
          last_checked?: string | null
          position?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string | null
          current_ranking?: number | null
          id?: string
          is_primary_keyword?: boolean | null
          keyword_id?: string | null
          last_checked?: string | null
          position?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_keyword_mappings_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "seo_keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_keywords: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          keyword: string
          keyword_difficulty: number | null
          keyword_type: string | null
          power_rating: string | null
          priority: number | null
          product_series: string | null
          search_intent: string | null
          search_volume: number | null
          state: string | null
          target_page_type: string | null
          target_url: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keyword: string
          keyword_difficulty?: number | null
          keyword_type?: string | null
          power_rating?: string | null
          priority?: number | null
          product_series?: string | null
          search_intent?: string | null
          search_volume?: number | null
          state?: string | null
          target_page_type?: string | null
          target_url?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keyword?: string
          keyword_difficulty?: number | null
          keyword_type?: string | null
          power_rating?: string | null
          priority?: number | null
          product_series?: string | null
          search_intent?: string | null
          search_volume?: number | null
          state?: string | null
          target_page_type?: string | null
          target_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_location_pages: {
        Row: {
          area_name: string | null
          city: string
          country: string
          created_at: string | null
          delivery_info: string | null
          google_maps_embed: string | null
          h1_title: string
          id: string
          intro_content: string
          is_published: boolean | null
          latitude: number | null
          local_address: string | null
          local_contact_number: string | null
          local_industries: Json | null
          local_stats: string | null
          location_type: string
          longitude: number | null
          meta_description: string
          meta_keywords: string | null
          meta_title: string
          priority: number | null
          service_areas: Json | null
          slug: string
          state: string | null
          updated_at: string | null
        }
        Insert: {
          area_name?: string | null
          city: string
          country?: string
          created_at?: string | null
          delivery_info?: string | null
          google_maps_embed?: string | null
          h1_title: string
          id?: string
          intro_content: string
          is_published?: boolean | null
          latitude?: number | null
          local_address?: string | null
          local_contact_number?: string | null
          local_industries?: Json | null
          local_stats?: string | null
          location_type: string
          longitude?: number | null
          meta_description: string
          meta_keywords?: string | null
          meta_title: string
          priority?: number | null
          service_areas?: Json | null
          slug: string
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          area_name?: string | null
          city?: string
          country?: string
          created_at?: string | null
          delivery_info?: string | null
          google_maps_embed?: string | null
          h1_title?: string
          id?: string
          intro_content?: string
          is_published?: boolean | null
          latitude?: number | null
          local_address?: string | null
          local_contact_number?: string | null
          local_industries?: Json | null
          local_stats?: string | null
          location_type?: string
          longitude?: number | null
          meta_description?: string
          meta_keywords?: string | null
          meta_title?: string
          priority?: number | null
          service_areas?: Json | null
          slug?: string
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_pricing_pages: {
        Row: {
          bulk_discount_info: string | null
          city: string | null
          created_at: string | null
          h1_title: string
          id: string
          intro_text: string | null
          is_published: boolean | null
          meta_description: string
          meta_title: string
          page_type: string
          power_range: string | null
          pricing_table_data: Json | null
          product_series: string | null
          show_discount_info: boolean | null
          show_exact_prices: boolean | null
          slug: string
          special_offers: string | null
          updated_at: string | null
        }
        Insert: {
          bulk_discount_info?: string | null
          city?: string | null
          created_at?: string | null
          h1_title: string
          id?: string
          intro_text?: string | null
          is_published?: boolean | null
          meta_description: string
          meta_title: string
          page_type: string
          power_range?: string | null
          pricing_table_data?: Json | null
          product_series?: string | null
          show_discount_info?: boolean | null
          show_exact_prices?: boolean | null
          slug: string
          special_offers?: string | null
          updated_at?: string | null
        }
        Update: {
          bulk_discount_info?: string | null
          city?: string | null
          created_at?: string | null
          h1_title?: string
          id?: string
          intro_text?: string | null
          is_published?: boolean | null
          meta_description?: string
          meta_title?: string
          page_type?: string
          power_range?: string | null
          pricing_table_data?: Json | null
          product_series?: string | null
          show_discount_info?: boolean | null
          show_exact_prices?: boolean | null
          slug?: string
          special_offers?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_product_variants: {
        Row: {
          applications_text: string | null
          city: string | null
          country: string | null
          created_at: string | null
          display_price: boolean | null
          h1_title: string
          id: string
          intro_text: string | null
          is_published: boolean | null
          meta_description: string
          meta_title: string
          power_hp: string | null
          power_range_max: number | null
          power_range_min: number | null
          power_rating: string
          power_unit: string | null
          price_context: string | null
          product_id: string | null
          slug: string
          state: string | null
          technical_content: string | null
          updated_at: string | null
        }
        Insert: {
          applications_text?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_price?: boolean | null
          h1_title: string
          id?: string
          intro_text?: string | null
          is_published?: boolean | null
          meta_description: string
          meta_title: string
          power_hp?: string | null
          power_range_max?: number | null
          power_range_min?: number | null
          power_rating: string
          power_unit?: string | null
          price_context?: string | null
          product_id?: string | null
          slug: string
          state?: string | null
          technical_content?: string | null
          updated_at?: string | null
        }
        Update: {
          applications_text?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_price?: boolean | null
          h1_title?: string
          id?: string
          intro_text?: string | null
          is_published?: boolean | null
          meta_description?: string
          meta_title?: string
          power_hp?: string | null
          power_range_max?: number | null
          power_range_min?: number | null
          power_rating?: string
          power_unit?: string | null
          price_context?: string | null
          product_id?: string | null
          slug?: string
          state?: string | null
          technical_content?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      series_faqs: {
        Row: {
          answer: string
          created_at: string | null
          display_order: number | null
          id: string
          question: string
          series_slug: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          question: string
          series_slug: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          question?: string
          series_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_faqs_series_slug_fkey"
            columns: ["series_slug"]
            isOneToOne: false
            referencedRelation: "series_pages"
            referencedColumns: ["series_slug"]
          },
        ]
      }
      series_pages: {
        Row: {
          content: string
          created_at: string | null
          hero_description: string
          hero_title: string
          id: string
          is_active: boolean | null
          meta_description: string
          meta_keywords: string[] | null
          power_range_max: string | null
          power_range_min: string | null
          series_name: string
          series_slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          hero_description: string
          hero_title: string
          id?: string
          is_active?: boolean | null
          meta_description: string
          meta_keywords?: string[] | null
          power_range_max?: string | null
          power_range_min?: string | null
          series_name: string
          series_slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          hero_description?: string
          hero_title?: string
          id?: string
          is_active?: boolean | null
          meta_description?: string
          meta_keywords?: string[] | null
          power_range_max?: string | null
          power_range_min?: string | null
          series_name?: string
          series_slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      technical_resources: {
        Row: {
          created_at: string | null
          description: string | null
          download_count: number | null
          file_size_kb: number | null
          file_url: string | null
          id: string
          is_active: boolean | null
          related_page_slug: string | null
          resource_type: string
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_size_kb?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          related_page_slug?: string | null
          resource_type: string
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_size_kb?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          related_page_slug?: string | null
          resource_type?: string
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          company_logo_url: string | null
          company_name: string
          created_at: string | null
          customer_name: string
          customer_title: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          location: string | null
          project_type: string | null
          rating: number | null
          testimonial_text: string
          updated_at: string | null
        }
        Insert: {
          company_logo_url?: string | null
          company_name: string
          created_at?: string | null
          customer_name: string
          customer_title?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          project_type?: string | null
          rating?: number | null
          testimonial_text: string
          updated_at?: string | null
        }
        Update: {
          company_logo_url?: string | null
          company_name?: string
          created_at?: string | null
          customer_name?: string
          customer_title?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          project_type?: string | null
          rating?: number | null
          testimonial_text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_comparisons: {
        Row: {
          created_at: string
          id: string
          product_id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_comparisons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_configurations: {
        Row: {
          created_at: string | null
          events: Json | null
          id: string
          is_active: boolean | null
          name: string
          retry_attempts: number | null
          secret_key: string
          timeout_seconds: number | null
          updated_at: string | null
          webhook_url: string
        }
        Insert: {
          created_at?: string | null
          events?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          retry_attempts?: number | null
          secret_key: string
          timeout_seconds?: number | null
          updated_at?: string | null
          webhook_url: string
        }
        Update: {
          created_at?: string | null
          events?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          retry_attempts?: number | null
          secret_key?: string
          timeout_seconds?: number | null
          updated_at?: string | null
          webhook_url?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          event_type: string
          http_status_code: number | null
          id: string
          payload: Json
          resource_id: string
          resource_type: string
          response_body: string | null
          retry_count: number | null
          status: string | null
          webhook_configuration_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          event_type: string
          http_status_code?: number | null
          id?: string
          payload: Json
          resource_id: string
          resource_type: string
          response_body?: string | null
          retry_count?: number | null
          status?: string | null
          webhook_configuration_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          event_type?: string
          http_status_code?: number | null
          id?: string
          payload?: Json
          resource_id?: string
          resource_type?: string
          response_body?: string | null
          retry_count?: number | null
          status?: string | null
          webhook_configuration_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_configuration_id_fkey"
            columns: ["webhook_configuration_id"]
            isOneToOne: false
            referencedRelation: "webhook_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_analytics: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          page_url: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      notification_analytics: {
        Row: {
          avg_time_to_click_seconds: number | null
          click_through_rate: number | null
          notification_type: string | null
          open_rate: number | null
          sent_date: string | null
          title: string | null
          total_clicked: number | null
          total_delivered: number | null
          total_dismissed: number | null
          total_displayed: number | null
          total_sent: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_engagement_score: { Args: { cart_id: string }; Returns: number }
      generate_order_number: { Args: never; Returns: string }
      get_engagement_by_hour: {
        Args: never
        Returns: {
          click_rate: number
          hour_of_day: number
          total_clicked: number
          total_sent: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      sync_primary_images_to_products: {
        Args: never
        Returns: {
          total_products: number
          updated_count: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      quotation_status:
        | "pending"
        | "reviewing"
        | "quoted"
        | "closed"
        | "revision_requested"
        | "revised"
        | "finalized"
        | "converted_to_order"
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
      app_role: ["admin", "user"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_status: ["pending", "paid", "failed", "refunded"],
      quotation_status: [
        "pending",
        "reviewing",
        "quoted",
        "closed",
        "revision_requested",
        "revised",
        "finalized",
        "converted_to_order",
      ],
    },
  },
} as const
