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
      applications: {
        Row: {
          country: string
          cover_letter_path: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          job_id: string
          linkedin_url: string | null
          phone_country_code: string
          phone_number: string
          resume_path: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string | null
        }
        Insert: {
          country: string
          cover_letter_path?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          job_id: string
          linkedin_url?: string | null
          phone_country_code: string
          phone_number: string
          resume_path: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string | null
        }
        Update: {
          country?: string
          cover_letter_path?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          job_id?: string
          linkedin_url?: string | null
          phone_country_code?: string
          phone_number?: string
          resume_path?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          availability: Database["public"]["Enums"]["candidate_availability"]
          bio: string | null
          created_at: string
          cv_path: string | null
          full_name: string
          headline: string | null
          id: string
          is_visible: boolean
          linkedin_url: string | null
          location: string | null
          photo_url: string | null
          skills: string[]
          updated_at: string
          user_id: string
          years_of_experience: number | null
        }
        Insert: {
          availability?: Database["public"]["Enums"]["candidate_availability"]
          bio?: string | null
          created_at?: string
          cv_path?: string | null
          full_name: string
          headline?: string | null
          id?: string
          is_visible?: boolean
          linkedin_url?: string | null
          location?: string | null
          photo_url?: string | null
          skills?: string[]
          updated_at?: string
          user_id: string
          years_of_experience?: number | null
        }
        Update: {
          availability?: Database["public"]["Enums"]["candidate_availability"]
          bio?: string | null
          created_at?: string
          cv_path?: string | null
          full_name?: string
          headline?: string | null
          id?: string
          is_visible?: boolean
          linkedin_url?: string | null
          location?: string | null
          photo_url?: string | null
          skills?: string[]
          updated_at?: string
          user_id?: string
          years_of_experience?: number | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          prospera_entity_id: string | null
          registered_by: string | null
          rpn: string | null
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          prospera_entity_id?: string | null
          registered_by?: string | null
          rpn?: string | null
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          prospera_entity_id?: string | null
          registered_by?: string | null
          rpn?: string | null
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          apply_url: string | null
          company_id: string
          created_at: string
          description: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          id: string
          location: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          work_mode: Database["public"]["Enums"]["work_mode"]
        }
        Insert: {
          apply_url?: string | null
          company_id: string
          created_at?: string
          description: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          id?: string
          location?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          work_mode?: Database["public"]["Enums"]["work_mode"]
        }
        Update: {
          apply_url?: string | null
          company_id?: string
          created_at?: string
          description?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          id?: string
          location?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          work_mode?: Database["public"]["Enums"]["work_mode"]
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fk"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_company_id: { Args: never; Returns: string }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      register_company: {
        Args: {
          p_entity_id: string
          p_name: string
          p_rpn: string
          p_slug: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      application_status: "pending" | "reviewed" | "interested" | "denied"
      candidate_availability:
        | "actively_looking"
        | "open_to_offers"
        | "not_available"
      employment_type: "full_time" | "part_time" | "contract"
      job_status: "draft" | "published" | "archived"
      user_role: "user" | "company" | "admin"
      work_mode: "on_site" | "remote" | "hybrid"
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
      application_status: ["pending", "reviewed", "interested", "denied"],
      candidate_availability: [
        "actively_looking",
        "open_to_offers",
        "not_available",
      ],
      employment_type: ["full_time", "part_time", "contract"],
      job_status: ["draft", "published", "archived"],
      user_role: ["user", "company", "admin"],
      work_mode: ["on_site", "remote", "hybrid"],
    },
  },
} as const
