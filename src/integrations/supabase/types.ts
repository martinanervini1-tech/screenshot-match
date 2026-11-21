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
      bookings: {
        Row: {
          age: number | null
          channel: string
          check_in: string
          check_out: string
          commission_cost: number
          commission_rate: number
          created_at: string
          decision_time_minutes: number | null
          extras: string[] | null
          gender: string | null
          id: string
          inquiry_id: string | null
          is_demo: boolean
          nationality: string | null
          nights: number
          reason_for_stay: string | null
          room: string
          total_value: number
          type_of_holiday: string | null
        }
        Insert: {
          age?: number | null
          channel: string
          check_in: string
          check_out: string
          commission_cost?: number
          commission_rate?: number
          created_at?: string
          decision_time_minutes?: number | null
          extras?: string[] | null
          gender?: string | null
          id?: string
          inquiry_id?: string | null
          is_demo?: boolean
          nationality?: string | null
          nights: number
          reason_for_stay?: string | null
          room: string
          total_value: number
          type_of_holiday?: string | null
        }
        Update: {
          age?: number | null
          channel?: string
          check_in?: string
          check_out?: string
          commission_cost?: number
          commission_rate?: number
          created_at?: string
          decision_time_minutes?: number | null
          extras?: string[] | null
          gender?: string | null
          id?: string
          inquiry_id?: string | null
          is_demo?: boolean
          nationality?: string | null
          nights?: number
          reason_for_stay?: string | null
          room?: string
          total_value?: number
          type_of_holiday?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: true
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          adults: number | null
          after_hours: boolean
          age: number | null
          arrival_time: string | null
          availability_status: string
          budget: number | null
          call_duration_sec: number | null
          call_ended_at: string | null
          call_started_at: string | null
          channel: string
          check_in: string
          check_out: string
          children: number | null
          contact: string
          created_at: string
          decision_time_minutes: number | null
          estimated_value: number
          extras_interested: string[] | null
          gender: string | null
          guest_name: string
          hesitation_reason: string | null
          id: string
          is_demo: boolean
          language: string | null
          nationality: string | null
          next_step: string | null
          next_step_deadline: string | null
          nights: number
          preferred_check_in_time: string | null
          preferred_check_out_time: string | null
          priority: string
          reason_for_stay: string | null
          recommended_extra: string | null
          recommended_room: string
          room_requested: string | null
          special_requests: string | null
          status: string
          summary: string | null
          transcript: Json
          type_of_holiday: string | null
          win_back_action: string | null
        }
        Insert: {
          adults?: number | null
          after_hours?: boolean
          age?: number | null
          arrival_time?: string | null
          availability_status?: string
          budget?: number | null
          call_duration_sec?: number | null
          call_ended_at?: string | null
          call_started_at?: string | null
          channel?: string
          check_in: string
          check_out: string
          children?: number | null
          contact: string
          created_at?: string
          decision_time_minutes?: number | null
          estimated_value: number
          extras_interested?: string[] | null
          gender?: string | null
          guest_name: string
          hesitation_reason?: string | null
          id?: string
          is_demo?: boolean
          language?: string | null
          nationality?: string | null
          next_step?: string | null
          next_step_deadline?: string | null
          nights: number
          preferred_check_in_time?: string | null
          preferred_check_out_time?: string | null
          priority?: string
          reason_for_stay?: string | null
          recommended_extra?: string | null
          recommended_room: string
          room_requested?: string | null
          special_requests?: string | null
          status?: string
          summary?: string | null
          transcript?: Json
          type_of_holiday?: string | null
          win_back_action?: string | null
        }
        Update: {
          adults?: number | null
          after_hours?: boolean
          age?: number | null
          arrival_time?: string | null
          availability_status?: string
          budget?: number | null
          call_duration_sec?: number | null
          call_ended_at?: string | null
          call_started_at?: string | null
          channel?: string
          check_in?: string
          check_out?: string
          children?: number | null
          contact?: string
          created_at?: string
          decision_time_minutes?: number | null
          estimated_value?: number
          extras_interested?: string[] | null
          gender?: string | null
          guest_name?: string
          hesitation_reason?: string | null
          id?: string
          is_demo?: boolean
          language?: string | null
          nationality?: string | null
          next_step?: string | null
          next_step_deadline?: string | null
          nights?: number
          preferred_check_in_time?: string | null
          preferred_check_out_time?: string | null
          priority?: string
          reason_for_stay?: string | null
          recommended_extra?: string | null
          recommended_room?: string
          room_requested?: string | null
          special_requests?: string | null
          status?: string
          summary?: string | null
          transcript?: Json
          type_of_holiday?: string | null
          win_back_action?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          display_name: string
          id: string
          preferences: Json
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string
          id: string
          preferences?: Json
        }
        Update: {
          avatar_url?: string | null
          display_name?: string
          id?: string
          preferences?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          role: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      hotel_stay_value: {
        Args: {
          arrival: string
          departure: string
          extra_names: string[]
          room_name: string
        }
        Returns: number
      }
      is_staff: { Args: never; Returns: boolean }
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
