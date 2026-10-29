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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      buses: {
        Row: {
          company_id: string
          condition: number
          created_at: string
          depot: string
          features: string[]
          fleet_no: string
          id: string
          livery: string
          market_key: string | null
          mileage: number
          model: string
          notes: string
          registration: string
          route_id: string | null
          status: string
          user_id: string
          year: number
        }
        Insert: {
          company_id: string
          condition?: number
          created_at?: string
          depot?: string
          features?: string[]
          fleet_no: string
          id?: string
          livery?: string
          market_key?: string | null
          mileage?: number
          model: string
          notes?: string
          registration?: string
          route_id?: string | null
          status?: string
          user_id?: string
          year?: number
        }
        Update: {
          company_id?: string
          condition?: number
          created_at?: string
          depot?: string
          features?: string[]
          fleet_no?: string
          id?: string
          livery?: string
          market_key?: string | null
          mileage?: number
          model?: string
          notes?: string
          registration?: string
          route_id?: string | null
          status?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "buses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buses_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          balance: number
          created_at: string
          day: number
          hq_town: string
          id: string
          name: string
          preset_key: string | null
          primary_color: string
          secondary_color: string
          short_name: string
          transport_mode: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          day?: number
          hq_town?: string
          id?: string
          name: string
          preset_key?: string | null
          primary_color?: string
          secondary_color?: string
          short_name?: string
          transport_mode?: string
          user_id?: string
        }
        Update: {
          balance?: number
          created_at?: string
          day?: number
          hq_town?: string
          id?: string
          name?: string
          preset_key?: string | null
          primary_color?: string
          secondary_color?: string
          short_name?: string
          transport_mode?: string
          user_id?: string
        }
        Relationships: []
      }
      day_reports: {
        Row: {
          company_id: string
          costs: number
          day: number
          details: Json
          id: string
          profit: number
          revenue: number
          user_id: string
        }
        Insert: {
          company_id: string
          costs: number
          day: number
          details?: Json
          id?: string
          profit: number
          revenue: number
          user_id?: string
        }
        Update: {
          company_id?: string
          costs?: number
          day?: number
          details?: Json
          id?: string
          profit?: number
          revenue?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "day_reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      depots: {
        Row: {
          capacity: number
          company_id: string
          daily_rent: number
          id: string
          name: string
          town: string
          user_id: string
        }
        Insert: {
          capacity?: number
          company_id: string
          daily_rent?: number
          id?: string
          name: string
          town: string
          user_id?: string
        }
        Update: {
          capacity?: number
          company_id?: string
          daily_rent?: number
          id?: string
          name?: string
          town?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "depots_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          applicant_id: string | null
          company_id: string
          created_at: string
          depot: string
          experience_years: number
          id: string
          name: string
          portrait_index: number | null
          qualifications: string[]
          role: string
          staff_no: string
          user_id: string
          wage: number
        }
        Insert: {
          applicant_id?: string | null
          company_id: string
          created_at?: string
          depot?: string
          experience_years?: number
          id?: string
          name: string
          portrait_index?: number | null
          qualifications?: string[]
          role?: string
          staff_no?: string
          user_id?: string
          wage?: number
        }
        Update: {
          applicant_id?: string | null
          company_id?: string
          created_at?: string
          depot?: string
          experience_years?: number
          id?: string
          name?: string
          portrait_index?: number | null
          qualifications?: string[]
          role?: string
          staff_no?: string
          user_id?: string
          wage?: number
        }
        Relationships: [
          {
            foreignKeyName: "drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      job_adverts: {
        Row: {
          company_id: string
          depot: string
          description: string
          id: string
          positions: number
          posted_day: number
          role: string
          status: string
          user_id: string
          wage: number
        }
        Insert: {
          company_id: string
          depot: string
          description?: string
          id?: string
          positions?: number
          posted_day: number
          role: string
          status?: string
          user_id?: string
          wage: number
        }
        Update: {
          company_id?: string
          depot?: string
          description?: string
          id?: string
          positions?: number
          posted_day?: number
          role?: string
          status?: string
          user_id?: string
          wage?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_adverts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applicants: {
        Row: {
          advert_id: string
          applied_day: number
          availability: string
          company_id: string
          expected_wage: number
          experience_years: number
          id: string
          name: string
          portrait_index: number
          previous_employer: string
          qualifications: string[]
          reference_note: string
          skills: string[]
          statement: string
          status: string
          user_id: string
        }
        Insert: {
          advert_id: string
          applied_day: number
          availability: string
          company_id: string
          expected_wage: number
          experience_years: number
          id?: string
          name: string
          portrait_index: number
          previous_employer: string
          qualifications?: string[]
          reference_note: string
          skills?: string[]
          statement: string
          status?: string
          user_id?: string
        }
        Update: {
          advert_id?: string
          applied_day?: number
          availability?: string
          company_id?: string
          expected_wage?: number
          experience_years?: number
          id?: string
          name?: string
          portrait_index?: number
          previous_employer?: string
          qualifications?: string[]
          reference_note?: string
          skills?: string[]
          statement?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applicants_advert_id_fkey"
            columns: ["advert_id"]
            isOneToOne: false
            referencedRelation: "job_adverts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applicants_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      passenger_reviews: {
        Row: {
          comment: string
          company_id: string
          day: number
          id: string
          rating: number
          route_number: string
          user_id: string
        }
        Insert: {
          comment: string
          company_id: string
          day: number
          id?: string
          rating: number
          route_number: string
          user_id?: string
        }
        Update: {
          comment?: string
          company_id?: string
          day?: number
          id?: string
          rating?: number
          route_number?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "passenger_reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_games: {
        Row: {
          company_id: string
          revision: number
          state: Json
          user_id: string
        }
        Insert: {
          company_id: string
          revision?: number
          state: Json
          user_id: string
        }
        Update: {
          company_id?: string
          revision?: number
          state?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rail_games_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      review_ai_access: {
        Row: {
          blocked_status: number
          message: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked_status: number
          message: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blocked_status?: number
          message?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          company_id: string
          contract_end_day: number | null
          contract_payment: number
          created_at: string
          destination: string
          fare: number
          frequency_mins: number
          id: string
          number: string
          origin: string
          service_type: string
          stop_ids: string[]
          tender_key: string | null
          user_id: string
          via: string
        }
        Insert: {
          company_id: string
          contract_end_day?: number | null
          contract_payment?: number
          created_at?: string
          destination: string
          fare?: number
          frequency_mins?: number
          id?: string
          number: string
          origin: string
          service_type?: string
          stop_ids?: string[]
          tender_key?: string | null
          user_id?: string
          via?: string
        }
        Update: {
          company_id?: string
          contract_end_day?: number | null
          contract_payment?: number
          created_at?: string
          destination?: string
          fare?: number
          frequency_mins?: number
          id?: string
          number?: string
          origin?: string
          service_type?: string
          stop_ids?: string[]
          tender_key?: string | null
          user_id?: string
          via?: string
        }
        Relationships: [
          {
            foreignKeyName: "routes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_bids: {
        Row: {
          bid: number
          company_id: string
          id: string
          status: string
          submitted_day: number
          tender_key: string
          user_id: string
        }
        Insert: {
          bid: number
          company_id: string
          id?: string
          status?: string
          submitted_day: number
          tender_key: string
          user_id?: string
        }
        Update: {
          bid?: number
          company_id?: string
          id?: string
          status?: string
          submitted_day?: number
          tender_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tender_bids_company_id_fkey"
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
      apply_management_action: {
        Args: {
          p_action: string
          p_company: string
          p_day: number
          p_payload: Json
        }
        Returns: undefined
      }
      publish_job_advert: {
        Args: {
          p_candidates: Json
          p_company: string
          p_depot: string
          p_description: string
          p_positions: number
          p_role: string
          p_wage: number
        }
        Returns: string
      }
      purchase_bus_or_features: {
        Args: {
          p_bus: string
          p_company: string
          p_cost: number
          p_day: number
          p_payload: Json
          p_user: string
        }
        Returns: undefined
      }
      resolve_game_bid: {
        Args: {
          p_company: string
          p_key: string
          p_route: Json
          p_won: boolean
        }
        Returns: undefined
      }
      review_job_applicant: {
        Args: { p_action: string; p_applicant: string }
        Returns: string
      }
      save_rail_game: {
        Args: {
          p_company: string
          p_revision: number
          p_state: Json
          p_user: string
        }
        Returns: undefined
      }
      submit_game_bid: {
        Args: { p_bid: number; p_company: string; p_day: number; p_key: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
