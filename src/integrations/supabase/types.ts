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
      has_role: {
        Args: { r: Database["public"]["Enums"]["app_role"]; uid: string }
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
