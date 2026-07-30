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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      collection_tags: {
        Row: {
          collection_id: string
          created_at: string
          tag_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          tag_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_tags_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "content_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_translations: {
        Row: {
          collection_id: string
          created_at: string
          created_by: string | null
          full_description: string | null
          id: string
          language_code: string
          reviewer_id: string | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          status: Database["public"]["Enums"]["translation_status"]
          title: string
          translator_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          collection_id: string
          created_at?: string
          created_by?: string | null
          full_description?: string | null
          id?: string
          language_code: string
          reviewer_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          status?: Database["public"]["Enums"]["translation_status"]
          title: string
          translator_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          collection_id?: string
          created_at?: string
          created_by?: string | null
          full_description?: string | null
          id?: string
          language_code?: string
          reviewer_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          status?: Database["public"]["Enums"]["translation_status"]
          title?: string
          translator_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_translations_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      collections: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"]
          archived_at: string | null
          audience: string | null
          cover_media_id: string | null
          created_at: string
          created_by: string | null
          difficulty_max: Database["public"]["Enums"]["difficulty_level"] | null
          difficulty_min: Database["public"]["Enums"]["difficulty_level"] | null
          display_order: number
          estimated_total_minutes: number | null
          featured_from: string | null
          featured_until: string | null
          id: string
          internal_name: string
          is_featured: boolean
          primary_language_code: string
          published_at: string | null
          scheduled_publish_at: string | null
          scheduled_unpublish_at: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          thumbnail_media_id: string | null
          topic: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"]
          archived_at?: string | null
          audience?: string | null
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          difficulty_max?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          difficulty_min?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          display_order?: number
          estimated_total_minutes?: number | null
          featured_from?: string | null
          featured_until?: string | null
          id?: string
          internal_name: string
          is_featured?: boolean
          primary_language_code: string
          published_at?: string | null
          scheduled_publish_at?: string | null
          scheduled_unpublish_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          thumbnail_media_id?: string | null
          topic?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"]
          archived_at?: string | null
          audience?: string | null
          cover_media_id?: string | null
          created_at?: string
          created_by?: string | null
          difficulty_max?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          difficulty_min?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          display_order?: number
          estimated_total_minutes?: number | null
          featured_from?: string | null
          featured_until?: string | null
          id?: string
          internal_name?: string
          is_featured?: boolean
          primary_language_code?: string
          published_at?: string | null
          scheduled_publish_at?: string | null
          scheduled_unpublish_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          thumbnail_media_id?: string | null
          topic?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_primary_language_code_fkey"
            columns: ["primary_language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "collections_thumbnail_media_id_fkey"
            columns: ["thumbnail_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      content_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: Database["public"]["Enums"]["content_entity_type"]
          id: string
          metadata: Json | null
          new_status: Database["public"]["Enums"]["content_status"] | null
          previous_status: Database["public"]["Enums"]["content_status"] | null
          summary: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: Database["public"]["Enums"]["content_entity_type"]
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["content_status"] | null
          previous_status?: Database["public"]["Enums"]["content_status"] | null
          summary?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: Database["public"]["Enums"]["content_entity_type"]
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["content_status"] | null
          previous_status?: Database["public"]["Enums"]["content_status"] | null
          summary?: string | null
        }
        Relationships: []
      }
      content_preview_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["content_entity_type"]
          expires_at: string
          id: string
          revoked_at: string | null
          token: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["content_entity_type"]
          expires_at: string
          id?: string
          revoked_at?: string | null
          token: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["content_entity_type"]
          expires_at?: string
          id?: string
          revoked_at?: string | null
          token?: string
        }
        Relationships: []
      }
      content_review_logs: {
        Row: {
          actor_id: string | null
          created_at: string
          decision: Database["public"]["Enums"]["review_decision"]
          entity_id: string
          entity_type: Database["public"]["Enums"]["content_entity_type"]
          id: string
          new_status: Database["public"]["Enums"]["content_status"] | null
          notes: string | null
          previous_status: Database["public"]["Enums"]["content_status"] | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          decision: Database["public"]["Enums"]["review_decision"]
          entity_id: string
          entity_type: Database["public"]["Enums"]["content_entity_type"]
          id?: string
          new_status?: Database["public"]["Enums"]["content_status"] | null
          notes?: string | null
          previous_status?: Database["public"]["Enums"]["content_status"] | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          decision?: Database["public"]["Enums"]["review_decision"]
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["content_entity_type"]
          id?: string
          new_status?: Database["public"]["Enums"]["content_status"] | null
          notes?: string | null
          previous_status?: Database["public"]["Enums"]["content_status"] | null
        }
        Relationships: []
      }
      content_status_history: {
        Row: {
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["content_entity_type"]
          id: string
          new_status: Database["public"]["Enums"]["content_status"]
          previous_status: Database["public"]["Enums"]["content_status"] | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["content_entity_type"]
          id?: string
          new_status: Database["public"]["Enums"]["content_status"]
          previous_status?: Database["public"]["Enums"]["content_status"] | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["content_entity_type"]
          id?: string
          new_status?: Database["public"]["Enums"]["content_status"]
          previous_status?: Database["public"]["Enums"]["content_status"] | null
        }
        Relationships: []
      }
      content_tag_translations: {
        Row: {
          created_at: string
          id: string
          language_code: string
          name: string
          tag_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          language_code: string
          name: string
          tag_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          language_code?: string
          name?: string
          tag_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_tag_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "content_tag_translations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "content_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      content_tags: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          kind: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          change_summary: string | null
          created_at: string
          created_by: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["content_entity_type"]
          id: string
          snapshot: Json
          version: number
        }
        Insert: {
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["content_entity_type"]
          id?: string
          snapshot: Json
          version: number
        }
        Update: {
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["content_entity_type"]
          id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: []
      }
      daily_journeys: {
        Row: {
          created_at: string
          created_by: string | null
          is_fallback: boolean
          journey_date: string
          journey_id: string
          language_code: string
          notes: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          is_fallback?: boolean
          journey_date: string
          journey_id: string
          language_code: string
          notes?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          is_fallback?: boolean
          journey_date?: string
          journey_id?: string
          language_code?: string
          notes?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_journeys_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_journeys_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      journey_tags: {
        Row: {
          created_at: string
          journey_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          journey_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          journey_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_tags_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "content_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_translations: {
        Row: {
          completion_message: string | null
          created_at: string
          created_by: string | null
          devotional_body: string | null
          id: string
          journey_id: string
          language_code: string
          prayer_body: string | null
          public_title: string
          reflection_prompt: string | null
          reviewer_id: string | null
          seo_description: string | null
          seo_title: string | null
          status: Database["public"]["Enums"]["translation_status"]
          subtitle: string | null
          translator_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          completion_message?: string | null
          created_at?: string
          created_by?: string | null
          devotional_body?: string | null
          id?: string
          journey_id: string
          language_code: string
          prayer_body?: string | null
          public_title: string
          reflection_prompt?: string | null
          reviewer_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          status?: Database["public"]["Enums"]["translation_status"]
          subtitle?: string | null
          translator_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          completion_message?: string | null
          created_at?: string
          created_by?: string | null
          devotional_body?: string | null
          id?: string
          journey_id?: string
          language_code?: string
          prayer_body?: string | null
          public_title?: string
          reflection_prompt?: string | null
          reviewer_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          status?: Database["public"]["Enums"]["translation_status"]
          subtitle?: string | null
          translator_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_translations_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      journey_word_translations: {
        Row: {
          created_at: string
          display_value: string
          explanation: string | null
          id: string
          journey_id: string
          journey_word_id: string
          language_code: string
          normalized_value: string
          status: Database["public"]["Enums"]["translation_status"]
          translator_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_value: string
          explanation?: string | null
          id?: string
          journey_id: string
          journey_word_id: string
          language_code: string
          normalized_value: string
          status?: Database["public"]["Enums"]["translation_status"]
          translator_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_value?: string
          explanation?: string | null
          id?: string
          journey_id?: string
          journey_word_id?: string
          language_code?: string
          normalized_value?: string
          status?: Database["public"]["Enums"]["translation_status"]
          translator_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_word_translations_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_word_translations_journey_word_id_fkey"
            columns: ["journey_word_id"]
            isOneToOne: false
            referencedRelation: "journey_words"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_word_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      journey_words: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_required: boolean
          journey_id: string
          max_difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          min_difficulty: Database["public"]["Enums"]["difficulty_level"]
          position: number
          scripture_reference_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          journey_id: string
          max_difficulty?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          min_difficulty?: Database["public"]["Enums"]["difficulty_level"]
          position?: number
          scripture_reference_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          journey_id?: string
          max_difficulty?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          min_difficulty?: Database["public"]["Enums"]["difficulty_level"]
          position?: number
          scripture_reference_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_words_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_words_scripture_reference_id_fkey"
            columns: ["scripture_reference_id"]
            isOneToOne: false
            referencedRelation: "scripture_references"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"]
          archived_at: string | null
          audience: string | null
          author_id: string | null
          created_at: string
          created_by: string | null
          current_version: number
          daily_eligible: boolean
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          estimated_minutes: number
          featured_from: string | null
          featured_until: string | null
          hero_media_id: string | null
          id: string
          internal_title: string
          is_featured: boolean
          position: number
          primary_collection_id: string
          primary_language_code: string
          published_at: string | null
          reviewer_id: string | null
          scheduled_publish_at: string | null
          scheduled_unpublish_at: string | null
          slug: string
          social_media_id: string | null
          status: Database["public"]["Enums"]["content_status"]
          theme: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"]
          archived_at?: string | null
          audience?: string | null
          author_id?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          daily_eligible?: boolean
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          estimated_minutes?: number
          featured_from?: string | null
          featured_until?: string | null
          hero_media_id?: string | null
          id?: string
          internal_title: string
          is_featured?: boolean
          position?: number
          primary_collection_id: string
          primary_language_code: string
          published_at?: string | null
          reviewer_id?: string | null
          scheduled_publish_at?: string | null
          scheduled_unpublish_at?: string | null
          slug: string
          social_media_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          theme?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"]
          archived_at?: string | null
          audience?: string | null
          author_id?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          daily_eligible?: boolean
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          estimated_minutes?: number
          featured_from?: string | null
          featured_until?: string | null
          hero_media_id?: string | null
          id?: string
          internal_title?: string
          is_featured?: boolean
          position?: number
          primary_collection_id?: string
          primary_language_code?: string
          published_at?: string | null
          reviewer_id?: string | null
          scheduled_publish_at?: string | null
          scheduled_unpublish_at?: string | null
          slug?: string
          social_media_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          theme?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journeys_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journeys_primary_collection_id_fkey"
            columns: ["primary_collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journeys_primary_language_code_fkey"
            columns: ["primary_language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "journeys_social_media_id_fkey"
            columns: ["social_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string
          english_name: string
          is_active: boolean
          is_default: boolean
          native_name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          english_name: string
          is_active?: boolean
          is_default?: boolean
          native_name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          english_name?: string
          is_active?: boolean
          is_default?: boolean
          native_name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          archived_at: string | null
          attribution: string | null
          byte_size: number
          caption: string | null
          created_at: string
          created_by: string | null
          height: number | null
          id: string
          license_notes: string | null
          mime_type: string
          storage_path: string
          updated_at: string
          updated_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          archived_at?: string | null
          attribution?: string | null
          byte_size: number
          caption?: string | null
          created_at?: string
          created_by?: string | null
          height?: number | null
          id?: string
          license_notes?: string | null
          mime_type: string
          storage_path: string
          updated_at?: string
          updated_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          archived_at?: string | null
          attribution?: string | null
          byte_size?: number
          caption?: string | null
          created_at?: string
          created_by?: string | null
          height?: number | null
          id?: string
          license_notes?: string | null
          mime_type?: string
          storage_path?: string
          updated_at?: string
          updated_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          onboarded_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          onboarded_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarded_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      puzzle_attempts: {
        Row: {
          created_at: string
          end_col: number
          end_row: number
          id: string
          is_correct: boolean
          matched_word: string | null
          selected_text: string | null
          session_id: string
          start_col: number
          start_row: number
          user_id: string
        }
        Insert: {
          created_at?: string
          end_col: number
          end_row: number
          id?: string
          is_correct: boolean
          matched_word?: string | null
          selected_text?: string | null
          session_id: string
          start_col: number
          start_row: number
          user_id: string
        }
        Update: {
          created_at?: string
          end_col?: number
          end_row?: number
          id?: string
          is_correct?: boolean
          matched_word?: string | null
          selected_text?: string | null
          session_id?: string
          start_col?: number
          start_row?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "puzzle_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      puzzle_events: {
        Row: {
          created_at: string
          id: string
          idempotency_key: string
          occurred_at: string
          payload: Json
          session_id: string
          type: Database["public"]["Enums"]["puzzle_event_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          idempotency_key: string
          occurred_at?: string
          payload?: Json
          session_id: string
          type: Database["public"]["Enums"]["puzzle_event_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          idempotency_key?: string
          occurred_at?: string
          payload?: Json
          session_id?: string
          type?: Database["public"]["Enums"]["puzzle_event_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "puzzle_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      puzzle_generation_requests: {
        Row: {
          attempt_count: number
          completed_at: string | null
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration_ms: number | null
          engine_version: string
          error_code: string | null
          error_detail: string | null
          id: string
          idempotency_key: string | null
          journey_id: string
          language_code: string
          requested_by: string | null
          result_instance_id: string | null
          seed: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["generation_status"]
          template_id: string | null
        }
        Insert: {
          attempt_count?: number
          completed_at?: string | null
          created_at?: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration_ms?: number | null
          engine_version: string
          error_code?: string | null
          error_detail?: string | null
          id?: string
          idempotency_key?: string | null
          journey_id: string
          language_code: string
          requested_by?: string | null
          result_instance_id?: string | null
          seed?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["generation_status"]
          template_id?: string | null
        }
        Update: {
          attempt_count?: number
          completed_at?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          duration_ms?: number | null
          engine_version?: string
          error_code?: string | null
          error_detail?: string | null
          id?: string
          idempotency_key?: string | null
          journey_id?: string
          language_code?: string
          requested_by?: string | null
          result_instance_id?: string | null
          seed?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["generation_status"]
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_generation_requests_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "puzzle_generation_requests_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "puzzle_generation_requests_result_instance_id_fkey"
            columns: ["result_instance_id"]
            isOneToOne: false
            referencedRelation: "puzzle_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "puzzle_generation_requests_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "puzzle_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      puzzle_instances: {
        Row: {
          content_hash: string
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          engine_version: string
          generation_metadata: Json
          grid_rows: string[]
          grid_size: number
          id: string
          language_code: string
          normalized_grid_rows: string[]
          placements: Json
          seed: number
          template_id: string
          template_version: number
          unplaced_words: Json
        }
        Insert: {
          content_hash: string
          created_at?: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          engine_version: string
          generation_metadata?: Json
          grid_rows: string[]
          grid_size: number
          id?: string
          language_code: string
          normalized_grid_rows: string[]
          placements?: Json
          seed: number
          template_id: string
          template_version: number
          unplaced_words?: Json
        }
        Update: {
          content_hash?: string
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          engine_version?: string
          generation_metadata?: Json
          grid_rows?: string[]
          grid_size?: number
          id?: string
          language_code?: string
          normalized_grid_rows?: string[]
          placements?: Json
          seed?: number
          template_id?: string
          template_version?: number
          unplaced_words?: Json
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_instances_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "puzzle_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "puzzle_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      puzzle_progress: {
        Row: {
          attempts_count: number
          best_time_ms: number | null
          completion_percent: number
          created_at: string
          first_completed_at: string | null
          found_words: string[]
          last_played_at: string
          puzzle_instance_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts_count?: number
          best_time_ms?: number | null
          completion_percent?: number
          created_at?: string
          first_completed_at?: string | null
          found_words?: string[]
          last_played_at?: string
          puzzle_instance_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts_count?: number
          best_time_ms?: number | null
          completion_percent?: number
          created_at?: string
          first_completed_at?: string | null
          found_words?: string[]
          last_played_at?: string
          puzzle_instance_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_progress_puzzle_instance_id_fkey"
            columns: ["puzzle_instance_id"]
            isOneToOne: false
            referencedRelation: "puzzle_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      puzzle_sessions: {
        Row: {
          completed_at: string | null
          completion_percent: number
          created_at: string
          elapsed_ms: number
          hints_used: number
          id: string
          journey_id: string
          last_activity_at: string
          paused_at: string | null
          puzzle_instance_id: string
          revealed_solution: boolean
          started_at: string
          status: Database["public"]["Enums"]["puzzle_session_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completion_percent?: number
          created_at?: string
          elapsed_ms?: number
          hints_used?: number
          id?: string
          journey_id: string
          last_activity_at?: string
          paused_at?: string | null
          puzzle_instance_id: string
          revealed_solution?: boolean
          started_at?: string
          status?: Database["public"]["Enums"]["puzzle_session_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completion_percent?: number
          created_at?: string
          elapsed_ms?: number
          hints_used?: number
          id?: string
          journey_id?: string
          last_activity_at?: string
          paused_at?: string | null
          puzzle_instance_id?: string
          revealed_solution?: boolean
          started_at?: string
          status?: Database["public"]["Enums"]["puzzle_session_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_sessions_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "puzzle_sessions_puzzle_instance_id_fkey"
            columns: ["puzzle_instance_id"]
            isOneToOne: false
            referencedRelation: "puzzle_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      puzzle_statistics: {
        Row: {
          abandoned_sessions: number
          avg_completion_ms: number | null
          completed_sessions: number
          fastest_completion_ms: number | null
          puzzle_instance_id: string
          solution_reveals: number
          total_hints_used: number
          total_sessions: number
          updated_at: string
        }
        Insert: {
          abandoned_sessions?: number
          avg_completion_ms?: number | null
          completed_sessions?: number
          fastest_completion_ms?: number | null
          puzzle_instance_id: string
          solution_reveals?: number
          total_hints_used?: number
          total_sessions?: number
          updated_at?: string
        }
        Update: {
          abandoned_sessions?: number
          avg_completion_ms?: number | null
          completed_sessions?: number
          fastest_completion_ms?: number | null
          puzzle_instance_id?: string
          solution_reveals?: number
          total_hints_used?: number
          total_sessions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_statistics_puzzle_instance_id_fkey"
            columns: ["puzzle_instance_id"]
            isOneToOne: true
            referencedRelation: "puzzle_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      puzzle_templates: {
        Row: {
          allow_diagonal: boolean
          allow_reversed: boolean
          allowed_directions: string[]
          archived_at: string | null
          created_at: string
          created_by: string | null
          custom_alphabet: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          expected_duration_seconds: number | null
          filler_strategy: string
          full_solution_enabled: boolean
          hint_policy: Database["public"]["Enums"]["hint_policy"]
          id: string
          journey_id: string
          language_code: string
          max_attempts: number
          max_grid_size: number
          max_hints: number
          min_engine_version: string
          min_grid_size: number
          overlap_strategy: string
          seed_strategy: string
          status: Database["public"]["Enums"]["puzzle_template_status"]
          target_word_count: number
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          allow_diagonal?: boolean
          allow_reversed?: boolean
          allowed_directions?: string[]
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          custom_alphabet?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          expected_duration_seconds?: number | null
          filler_strategy?: string
          full_solution_enabled?: boolean
          hint_policy?: Database["public"]["Enums"]["hint_policy"]
          id?: string
          journey_id: string
          language_code: string
          max_attempts?: number
          max_grid_size?: number
          max_hints?: number
          min_engine_version?: string
          min_grid_size?: number
          overlap_strategy?: string
          seed_strategy?: string
          status?: Database["public"]["Enums"]["puzzle_template_status"]
          target_word_count?: number
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          allow_diagonal?: boolean
          allow_reversed?: boolean
          allowed_directions?: string[]
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          custom_alphabet?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          expected_duration_seconds?: number | null
          filler_strategy?: string
          full_solution_enabled?: boolean
          hint_policy?: Database["public"]["Enums"]["hint_policy"]
          id?: string
          journey_id?: string
          language_code?: string
          max_attempts?: number
          max_grid_size?: number
          max_hints?: number
          min_engine_version?: string
          min_grid_size?: number
          overlap_strategy?: string
          seed_strategy?: string
          status?: Database["public"]["Enums"]["puzzle_template_status"]
          target_word_count?: number
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_templates_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "puzzle_templates_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      scripture_references: {
        Row: {
          book_code: string
          chapter: number
          created_at: string
          display_reference: string
          external_content_id: string | null
          id: string
          journey_id: string
          position: number
          source_id: string
          stored_text: string | null
          updated_at: string
          verse_end: number | null
          verse_start: number
        }
        Insert: {
          book_code: string
          chapter: number
          created_at?: string
          display_reference: string
          external_content_id?: string | null
          id?: string
          journey_id: string
          position?: number
          source_id: string
          stored_text?: string | null
          updated_at?: string
          verse_end?: number | null
          verse_start: number
        }
        Update: {
          book_code?: string
          chapter?: number
          created_at?: string
          display_reference?: string
          external_content_id?: string | null
          id?: string
          journey_id?: string
          position?: number
          source_id?: string
          stored_text?: string | null
          updated_at?: string
          verse_end?: number | null
          verse_start?: number
        }
        Relationships: [
          {
            foreignKeyName: "scripture_references_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripture_references_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "scripture_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      scripture_sources: {
        Row: {
          allows_text_storage: boolean
          api_provider: string | null
          attribution_required: string | null
          created_at: string
          id: string
          is_active: boolean
          language_code: string
          license_notes: string
          strategy: Database["public"]["Enums"]["scripture_strategy"]
          translation_code: string
          translation_name: string
          updated_at: string
        }
        Insert: {
          allows_text_storage?: boolean
          api_provider?: string | null
          attribution_required?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          language_code: string
          license_notes: string
          strategy: Database["public"]["Enums"]["scripture_strategy"]
          translation_code: string
          translation_name: string
          updated_at?: string
        }
        Update: {
          allows_text_storage?: boolean
          api_provider?: string | null
          attribution_required?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          language_code?: string
          license_notes?: string
          strategy?: Database["public"]["Enums"]["scripture_strategy"]
          translation_code?: string
          translation_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scripture_sources_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          email_reminders: boolean
          font_size: string
          locale: string
          preferred_difficulty: string
          selection_color: string
          sound_enabled: boolean
          theme: string
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_reminders?: boolean
          font_size?: string
          locale?: string
          preferred_difficulty?: string
          selection_color?: string
          sound_enabled?: boolean
          theme?: string
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_reminders?: boolean
          font_size?: string
          locale?: string
          preferred_difficulty?: string
          selection_color?: string
          sound_enabled?: boolean
          theme?: string
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_content: { Args: { uid: string }; Returns: boolean }
      can_publish_content: { Args: { uid: string }; Returns: boolean }
      can_review_content: { Args: { uid: string }; Returns: boolean }
      collection_is_public: {
        Args: { c: Database["public"]["Tables"]["collections"]["Row"] }
        Returns: boolean
      }
      has_role: {
        Args: { r: Database["public"]["Enums"]["app_role"]; uid: string }
        Returns: boolean
      }
      is_content_staff: { Args: { uid: string }; Returns: boolean }
      is_service_context: { Args: never; Returns: boolean }
      is_valid_status_transition: {
        Args: {
          from_status: Database["public"]["Enums"]["content_status"]
          to_status: Database["public"]["Enums"]["content_status"]
        }
        Returns: boolean
      }
      journey_is_public: {
        Args: { j: Database["public"]["Tables"]["journeys"]["Row"] }
        Returns: boolean
      }
    }
    Enums: {
      access_level: "free" | "premium" | "preview" | "internal"
      app_role:
        | "free_user"
        | "premium_user"
        | "content_editor"
        | "content_reviewer"
        | "support_admin"
        | "super_admin"
        | "publication_admin"
      content_entity_type:
        | "collection"
        | "journey"
        | "collection_translation"
        | "journey_translation"
        | "journey_word"
        | "media_asset"
        | "daily_journey"
      content_status:
        | "draft"
        | "in_review"
        | "changes_requested"
        | "approved"
        | "scheduled"
        | "published"
        | "unpublished"
        | "archived"
      difficulty_level: "gentle" | "balanced" | "challenging" | "expert"
      generation_status:
        | "pending"
        | "running"
        | "succeeded"
        | "failed"
        | "cancelled"
      hint_policy: "none" | "limited" | "unlimited"
      puzzle_event_type:
        | "puzzle_started"
        | "puzzle_paused"
        | "puzzle_resumed"
        | "puzzle_completed"
        | "word_found"
        | "hint_used"
        | "puzzle_reset"
        | "puzzle_regenerated"
      puzzle_session_status:
        | "in_progress"
        | "paused"
        | "completed"
        | "abandoned"
      puzzle_template_status: "draft" | "active" | "archived"
      review_decision:
        | "submitted"
        | "approved"
        | "changes_requested"
        | "withdrawn"
      scripture_strategy:
        | "reference_only"
        | "public_domain"
        | "licensed"
        | "api"
      translation_status:
        | "missing"
        | "draft"
        | "in_review"
        | "approved"
        | "published"
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
      access_level: ["free", "premium", "preview", "internal"],
      app_role: [
        "free_user",
        "premium_user",
        "content_editor",
        "content_reviewer",
        "support_admin",
        "super_admin",
        "publication_admin",
      ],
      content_entity_type: [
        "collection",
        "journey",
        "collection_translation",
        "journey_translation",
        "journey_word",
        "media_asset",
        "daily_journey",
      ],
      content_status: [
        "draft",
        "in_review",
        "changes_requested",
        "approved",
        "scheduled",
        "published",
        "unpublished",
        "archived",
      ],
      difficulty_level: ["gentle", "balanced", "challenging", "expert"],
      generation_status: [
        "pending",
        "running",
        "succeeded",
        "failed",
        "cancelled",
      ],
      hint_policy: ["none", "limited", "unlimited"],
      puzzle_event_type: [
        "puzzle_started",
        "puzzle_paused",
        "puzzle_resumed",
        "puzzle_completed",
        "word_found",
        "hint_used",
        "puzzle_reset",
        "puzzle_regenerated",
      ],
      puzzle_session_status: [
        "in_progress",
        "paused",
        "completed",
        "abandoned",
      ],
      puzzle_template_status: ["draft", "active", "archived"],
      review_decision: [
        "submitted",
        "approved",
        "changes_requested",
        "withdrawn",
      ],
      scripture_strategy: [
        "reference_only",
        "public_domain",
        "licensed",
        "api",
      ],
      translation_status: [
        "missing",
        "draft",
        "in_review",
        "approved",
        "published",
      ],
    },
  },
} as const
