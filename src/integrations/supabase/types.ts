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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      authorized_admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      feature_requests: {
        Row: {
          admin_notes: string | null
          category: Database["public"]["Enums"]["feature_request_category"]
          created_at: string
          description: string
          id: string
          priority: Database["public"]["Enums"]["feature_request_priority"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["feature_request_status"]
          title: string
          updated_at: string
          use_case: string | null
          user_email: string | null
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          admin_notes?: string | null
          category: Database["public"]["Enums"]["feature_request_category"]
          created_at?: string
          description: string
          id?: string
          priority?: Database["public"]["Enums"]["feature_request_priority"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["feature_request_status"]
          title: string
          updated_at?: string
          use_case?: string | null
          user_email?: string | null
          user_id?: string | null
          wallet_address?: string
        }
        Update: {
          admin_notes?: string | null
          category?: Database["public"]["Enums"]["feature_request_category"]
          created_at?: string
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["feature_request_priority"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["feature_request_status"]
          title?: string
          updated_at?: string
          use_case?: string | null
          user_email?: string | null
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      incubator_applications: {
        Row: {
          admin_notes: string | null
          blockchain_networks: string[] | null
          business_category: Database["public"]["Enums"]["business_category"]
          business_plan_url: string | null
          company_name: string | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          custom_networks: string | null
          description: string
          founder_background: string | null
          founder_name: string
          funding_needed: number | null
          funding_raised: number | null
          goals: string | null
          id: string
          linkedin_profile: string | null
          pitch_deck_url: string | null
          project_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          smart_contracts_deployed: boolean | null
          stage: string
          status: Database["public"]["Enums"]["application_status"] | null
          team_emails: string | null
          team_experience: string | null
          team_linkedin: string | null
          team_size: number | null
          technology_stack: string[] | null
          timeline: string | null
          updated_at: string
          use_of_funds: string | null
          user_id: string | null
          website_url: string | null
          why_join: string
        }
        Insert: {
          admin_notes?: string | null
          blockchain_networks?: string[] | null
          business_category: Database["public"]["Enums"]["business_category"]
          business_plan_url?: string | null
          company_name?: string | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          custom_networks?: string | null
          description: string
          founder_background?: string | null
          founder_name: string
          funding_needed?: number | null
          funding_raised?: number | null
          goals?: string | null
          id?: string
          linkedin_profile?: string | null
          pitch_deck_url?: string | null
          project_name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          smart_contracts_deployed?: boolean | null
          stage: string
          status?: Database["public"]["Enums"]["application_status"] | null
          team_emails?: string | null
          team_experience?: string | null
          team_linkedin?: string | null
          team_size?: number | null
          technology_stack?: string[] | null
          timeline?: string | null
          updated_at?: string
          use_of_funds?: string | null
          user_id?: string | null
          website_url?: string | null
          why_join: string
        }
        Update: {
          admin_notes?: string | null
          blockchain_networks?: string[] | null
          business_category?: Database["public"]["Enums"]["business_category"]
          business_plan_url?: string | null
          company_name?: string | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          custom_networks?: string | null
          description?: string
          founder_background?: string | null
          founder_name?: string
          funding_needed?: number | null
          funding_raised?: number | null
          goals?: string | null
          id?: string
          linkedin_profile?: string | null
          pitch_deck_url?: string | null
          project_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          smart_contracts_deployed?: boolean | null
          stage?: string
          status?: Database["public"]["Enums"]["application_status"] | null
          team_emails?: string | null
          team_experience?: string | null
          team_linkedin?: string | null
          team_size?: number | null
          technology_stack?: string[] | null
          timeline?: string | null
          updated_at?: string
          use_of_funds?: string | null
          user_id?: string | null
          website_url?: string | null
          why_join?: string
        }
        Relationships: []
      }
      migration_acknowledgements: {
        Row: {
          acknowledgement_hash: string
          created_at: string
          email: string
          id: string
          ip_address: string | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          acknowledgement_hash: string
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          acknowledgement_hash?: string
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      migration_events: {
        Row: {
          acknowledgement_id: string
          amount: string
          block_number: number | null
          created_at: string
          gas_price: string | null
          gas_used: string | null
          id: string
          new_contract_address: string
          old_contract_address: string
          status: string
          token_type: string
          transaction_hash: string | null
          updated_at: string
          wallet_address: string
        }
        Insert: {
          acknowledgement_id: string
          amount: string
          block_number?: number | null
          created_at?: string
          gas_price?: string | null
          gas_used?: string | null
          id?: string
          new_contract_address: string
          old_contract_address: string
          status?: string
          token_type: string
          transaction_hash?: string | null
          updated_at?: string
          wallet_address: string
        }
        Update: {
          acknowledgement_id?: string
          amount?: string
          block_number?: number | null
          created_at?: string
          gas_price?: string | null
          gas_used?: string | null
          id?: string
          new_contract_address?: string
          old_contract_address?: string
          status?: string
          token_type?: string
          transaction_hash?: string | null
          updated_at?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "migration_events_acknowledgement_id_fkey"
            columns: ["acknowledgement_id"]
            isOneToOne: false
            referencedRelation: "migration_acknowledgements"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      smart_contracts: {
        Row: {
          abi: Json | null
          address: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          name: string
          network_id: string
          source_code: string | null
          updated_at: string
        }
        Insert: {
          abi?: Json | null
          address: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          name: string
          network_id: string
          source_code?: string | null
          updated_at?: string
        }
        Update: {
          abi?: Json | null
          address?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          name?: string
          network_id?: string
          source_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_contracts_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "web3_networks"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          admin_id: string | null
          admin_response: string | null
          created_at: string
          id: string
          message: string
          parent_message_id: string | null
          priority: string
          responded_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
          user_read: boolean
        }
        Insert: {
          admin_id?: string | null
          admin_response?: string | null
          created_at?: string
          id?: string
          message: string
          parent_message_id?: string | null
          priority?: string
          responded_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
          user_read?: boolean
        }
        Update: {
          admin_id?: string | null
          admin_response?: string | null
          created_at?: string
          id?: string
          message?: string
          parent_message_id?: string | null
          priority?: string
          responded_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
          user_read?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "support_messages"
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
      web3_networks: {
        Row: {
          block_explorer_name: string | null
          chain_id: number
          chain_id_hex: string | null
          chainlist_id: number | null
          created_at: string
          created_by: string
          explorer_url: string | null
          faucets: Json | null
          icon_url: string | null
          id: string
          is_active: boolean
          is_testnet: boolean | null
          name: string
          native_currency_decimals: number | null
          native_currency_name: string | null
          native_currency_symbol: string | null
          rpc_url: string
          rpc_urls: Json | null
          updated_at: string
        }
        Insert: {
          block_explorer_name?: string | null
          chain_id: number
          chain_id_hex?: string | null
          chainlist_id?: number | null
          created_at?: string
          created_by: string
          explorer_url?: string | null
          faucets?: Json | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          is_testnet?: boolean | null
          name: string
          native_currency_decimals?: number | null
          native_currency_name?: string | null
          native_currency_symbol?: string | null
          rpc_url: string
          rpc_urls?: Json | null
          updated_at?: string
        }
        Update: {
          block_explorer_name?: string | null
          chain_id?: number
          chain_id_hex?: string | null
          chainlist_id?: number | null
          created_at?: string
          created_by?: string
          explorer_url?: string | null
          faucets?: Json | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          is_testnet?: boolean | null
          name?: string
          native_currency_decimals?: number | null
          native_currency_name?: string | null
          native_currency_symbol?: string | null
          rpc_url?: string
          rpc_urls?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_authorized_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { _user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "user"
      application_status:
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "waitlisted"
      business_category:
        | "fintech"
        | "defi"
        | "nft"
        | "gamefi"
        | "infrastructure"
        | "dao"
        | "analytics"
        | "trading"
        | "lending"
        | "insurance"
        | "other"
      feature_request_category:
        | "ui_ux"
        | "performance"
        | "security"
        | "integrations"
        | "contract_tools"
        | "analytics"
        | "other"
      feature_request_priority: "low" | "medium" | "high" | "critical"
      feature_request_status:
        | "submitted"
        | "under_review"
        | "in_development"
        | "completed"
        | "rejected"
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
      app_role: ["super_admin", "admin", "user"],
      application_status: [
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "waitlisted",
      ],
      business_category: [
        "fintech",
        "defi",
        "nft",
        "gamefi",
        "infrastructure",
        "dao",
        "analytics",
        "trading",
        "lending",
        "insurance",
        "other",
      ],
      feature_request_category: [
        "ui_ux",
        "performance",
        "security",
        "integrations",
        "contract_tools",
        "analytics",
        "other",
      ],
      feature_request_priority: ["low", "medium", "high", "critical"],
      feature_request_status: [
        "submitted",
        "under_review",
        "in_development",
        "completed",
        "rejected",
      ],
    },
  },
} as const
