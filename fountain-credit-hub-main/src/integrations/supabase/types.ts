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
      app_settings: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          default_interest_rate: number
          id: number
          late_penalty_rate: number
          max_loan_duration_days: number
          primary_email: string
          secondary_email: string
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          account_name?: string
          account_number?: string
          bank_name?: string
          default_interest_rate?: number
          id?: number
          late_penalty_rate?: number
          max_loan_duration_days?: number
          primary_email?: string
          secondary_email?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          default_interest_rate?: number
          id?: number
          late_penalty_rate?: number
          max_loan_duration_days?: number
          primary_email?: string
          secondary_email?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          amount: number
          amount_repaid: number
          borrower_id: string
          created_at: string
          disbursed_amount: number | null
          disbursed_at: string | null
          disbursement_notes: string | null
          disbursement_reference: string | null
          due_date: string | null
          duration_days: number
          duration_months: number
          id: string
          interest_rate: number
          penalty_rate: number
          purpose: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          schedule: Database["public"]["Enums"]["repayment_schedule"]
          status: Database["public"]["Enums"]["loan_status"]
          topup_count: number
          topup_total: number
          total_repayable: number | null
          updated_at: string
        }
        Insert: {
          amount: number
          amount_repaid?: number
          borrower_id: string
          created_at?: string
          disbursed_amount?: number | null
          disbursed_at?: string | null
          disbursement_notes?: string | null
          disbursement_reference?: string | null
          due_date?: string | null
          duration_days?: number
          duration_months: number
          id?: string
          interest_rate?: number
          penalty_rate?: number
          purpose: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          schedule?: Database["public"]["Enums"]["repayment_schedule"]
          status?: Database["public"]["Enums"]["loan_status"]
          topup_count?: number
          topup_total?: number
          total_repayable?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_repaid?: number
          borrower_id?: string
          created_at?: string
          disbursed_amount?: number | null
          disbursed_at?: string | null
          disbursement_notes?: string | null
          disbursement_reference?: string | null
          due_date?: string | null
          duration_days?: number
          duration_months?: number
          id?: string
          interest_rate?: number
          penalty_rate?: number
          purpose?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          schedule?: Database["public"]["Enums"]["repayment_schedule"]
          status?: Database["public"]["Enums"]["loan_status"]
          topup_count?: number
          topup_total?: number
          total_repayable?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          address: string | null
          bank_account_number: string | null
          bank_name: string | null
          bvn: string | null
          bvn_verification: Database["public"]["Enums"]["bvn_status"]
          created_at: string
          date_of_birth: string | null
          email: string | null
          employer: string | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          gov_id_url: string | null
          id: string
          monthly_income: number | null
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          occupation: string | null
          passport_url: string | null
          phone: string | null
          registration_complete: boolean
          updated_at: string
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          address?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          bvn?: string | null
          bvn_verification?: Database["public"]["Enums"]["bvn_status"]
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          employer?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          gov_id_url?: string | null
          id: string
          monthly_income?: number | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          occupation?: string | null
          passport_url?: string | null
          phone?: string | null
          registration_complete?: boolean
          updated_at?: string
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          address?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          bvn?: string | null
          bvn_verification?: Database["public"]["Enums"]["bvn_status"]
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          employer?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          gov_id_url?: string | null
          id?: string
          monthly_income?: number | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          occupation?: string | null
          passport_url?: string | null
          phone?: string | null
          registration_complete?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      repayments: {
        Row: {
          amount: number
          borrower_id: string
          created_at: string
          id: string
          loan_id: string
          notes: string | null
          proof_url: string | null
          reference_number: string | null
          status: Database["public"]["Enums"]["repayment_status"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          borrower_id: string
          created_at?: string
          id?: string
          loan_id: string
          notes?: string | null
          proof_url?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["repayment_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          borrower_id?: string
          created_at?: string
          id?: string
          loan_id?: string
          notes?: string | null
          proof_url?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["repayment_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repayments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      account_status: "active" | "suspended" | "blacklisted"
      app_role:
        | "super_admin"
        | "finance_officer"
        | "loan_officer"
        | "customer_support"
        | "borrower"
        | "sub_admin"
      bvn_status: "unverified" | "pending" | "verified" | "failed"
      gender_type: "male" | "female" | "other"
      loan_status:
        | "pending"
        | "approved"
        | "rejected"
        | "disbursed"
        | "active"
        | "partially_repaid"
        | "fully_repaid"
        | "defaulted"
      repayment_schedule: "weekly" | "biweekly" | "monthly" | "lump_sum"
      repayment_status: "pending" | "verified" | "rejected"
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
      account_status: ["active", "suspended", "blacklisted"],
      app_role: [
        "super_admin",
        "finance_officer",
        "loan_officer",
        "customer_support",
        "borrower",
        "sub_admin",
      ],
      bvn_status: ["unverified", "pending", "verified", "failed"],
      gender_type: ["male", "female", "other"],
      loan_status: [
        "pending",
        "approved",
        "rejected",
        "disbursed",
        "active",
        "partially_repaid",
        "fully_repaid",
        "defaulted",
      ],
      repayment_schedule: ["weekly", "biweekly", "monthly", "lump_sum"],
      repayment_status: ["pending", "verified", "rejected"],
    },
  },
} as const
