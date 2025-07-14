export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      cabinets: {
        Row: {
          capacity: number | null
          column_position: number | null
          created_at: string | null
          current_power_usage: number | null
          current_usage: number | null
          data_hall_id: string
          id: string
          is_active: boolean | null
          name: string
          power_capacity: number | null
          row_position: string | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          column_position?: number | null
          created_at?: string | null
          current_power_usage?: number | null
          current_usage?: number | null
          data_hall_id: string
          id?: string
          is_active?: boolean | null
          name: string
          power_capacity?: number | null
          row_position?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          column_position?: number | null
          created_at?: string | null
          current_power_usage?: number | null
          current_usage?: number | null
          data_hall_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          power_capacity?: number | null
          row_position?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cabinets_data_hall_id_fkey"
            columns: ["data_hall_id"]
            isOneToOne: false
            referencedRelation: "data_halls"
            referencedColumns: ["id"]
          },
        ]
      }
      data_halls: {
        Row: {
          capacity: number | null
          created_at: string | null
          current_usage: number | null
          datacenter_id: string
          floor: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          current_usage?: number | null
          datacenter_id: string
          floor?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          current_usage?: number | null
          datacenter_id?: string
          floor?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_halls_datacenter_id_fkey"
            columns: ["datacenter_id"]
            isOneToOne: false
            referencedRelation: "datacenters"
            referencedColumns: ["id"]
          },
        ]
      }
      datacenters: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          location: string
          name: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location: string
          name: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          name?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          assigned_to: string | null
          attachments: string[] | null
          cabinet_id: string
          created_at: string | null
          data_hall_id: string
          datacenter_id: string
          description: string
          detected_at: string | null
          device_type: string
          id: string
          issue_type: string
          metadata: Json | null
          priority: string
          recommendation: string | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
          unit_identifier: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: string[] | null
          cabinet_id: string
          created_at?: string | null
          data_hall_id: string
          datacenter_id: string
          description: string
          detected_at?: string | null
          device_type: string
          id?: string
          issue_type: string
          metadata?: Json | null
          priority?: string
          recommendation?: string | null
          resolved_at?: string | null
          severity: string
          status?: string
          title: string
          unit_identifier?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: string[] | null
          cabinet_id?: string
          created_at?: string | null
          data_hall_id?: string
          datacenter_id?: string
          description?: string
          detected_at?: string | null
          device_type?: string
          id?: string
          issue_type?: string
          metadata?: Json | null
          priority?: string
          recommendation?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          unit_identifier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "cabinets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_data_hall_id_fkey"
            columns: ["data_hall_id"]
            isOneToOne: false
            referencedRelation: "data_halls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_datacenter_id_fkey"
            columns: ["datacenter_id"]
            isOneToOne: false
            referencedRelation: "datacenters"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          read_at: string | null
          severity: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          severity?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          severity?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          display_name: string | null
          id: string
          location: string | null
          phone: string | null
          preferences: Json | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          preferences?: Json | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          preferences?: Json | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          completed_at: string | null
          description: string | null
          download_count: number | null
          expires_at: string | null
          file_path: string | null
          file_size: number | null
          format: string
          generated_at: string | null
          generated_by: string
          id: string
          metadata: Json | null
          name: string
          parameters: Json | null
          status: string
          type: string
        }
        Insert: {
          completed_at?: string | null
          description?: string | null
          download_count?: number | null
          expires_at?: string | null
          file_path?: string | null
          file_size?: number | null
          format: string
          generated_at?: string | null
          generated_by: string
          id?: string
          metadata?: Json | null
          name: string
          parameters?: Json | null
          status?: string
          type: string
        }
        Update: {
          completed_at?: string | null
          description?: string | null
          download_count?: number | null
          expires_at?: string | null
          file_path?: string | null
          file_size?: number | null
          format?: string
          generated_at?: string | null
          generated_by?: string
          id?: string
          metadata?: Json | null
          name?: string
          parameters?: Json | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          permission: string
          resource: string | null
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          permission: string
          resource?: string | null
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          permission?: string
          resource?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_active?: boolean
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          name: string
          permissions: string[] | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name: string
          permissions?: string[] | null
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string
          permissions?: string[] | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_permission: {
        Args: { _user_id: string; _permission: string; _resource?: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "technician" | "viewer"
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
      app_role: ["admin", "manager", "technician", "viewer"],
    },
  },
} as const
