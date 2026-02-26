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
      broker_accounts: {
        Row: {
          account_id: string
          account_name: string | null
          account_type: string | null
          as_of: string | null
          buying_power: number | null
          cash: number | null
          currency: string | null
          id: string
          provider: string
          total_value: number | null
          user_id: string
        }
        Insert: {
          account_id: string
          account_name?: string | null
          account_type?: string | null
          as_of?: string | null
          buying_power?: number | null
          cash?: number | null
          currency?: string | null
          id?: string
          provider: string
          total_value?: number | null
          user_id: string
        }
        Update: {
          account_id?: string
          account_name?: string | null
          account_type?: string | null
          as_of?: string | null
          buying_power?: number | null
          cash?: number | null
          currency?: string | null
          id?: string
          provider?: string
          total_value?: number | null
          user_id?: string
        }
        Relationships: []
      }
      broker_connections: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          id: string
          last_sync_at: string | null
          metadata: Json | null
          provider: string
          refresh_token_encrypted: string | null
          status: string
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          provider: string
          refresh_token_encrypted?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          provider?: string
          refresh_token_encrypted?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      broker_fills: {
        Row: {
          account_id: string
          executed_at: string
          execution_id: string
          id: string
          order_id: string | null
          price: number
          provider: string
          quantity: number
          side: string
          symbol: string
          user_id: string
        }
        Insert: {
          account_id: string
          executed_at?: string
          execution_id: string
          id?: string
          order_id?: string | null
          price: number
          provider: string
          quantity: number
          side: string
          symbol: string
          user_id: string
        }
        Update: {
          account_id?: string
          executed_at?: string
          execution_id?: string
          id?: string
          order_id?: string | null
          price?: number
          provider?: string
          quantity?: number
          side?: string
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      broker_orders: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          order_id: string
          order_type: string | null
          provider: string
          quantity: number
          side: string
          status: string | null
          symbol: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          order_id: string
          order_type?: string | null
          provider: string
          quantity: number
          side: string
          status?: string | null
          symbol: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          order_id?: string
          order_type?: string | null
          provider?: string
          quantity?: number
          side?: string
          status?: string | null
          symbol?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      broker_positions: {
        Row: {
          account_id: string
          average_price: number | null
          id: string
          market_price: number | null
          market_value: number | null
          provider: string
          quantity: number
          symbol: string
          unrealized_pl: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          average_price?: number | null
          id?: string
          market_price?: number | null
          market_value?: number | null
          provider: string
          quantity?: number
          symbol: string
          unrealized_pl?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          average_price?: number | null
          id?: string
          market_price?: number | null
          market_value?: number | null
          provider?: string
          quantity?: number
          symbol?: string
          unrealized_pl?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      capital_allocation_snapshots: {
        Row: {
          cash_percent: number
          created_at: string
          deployment_guidance: Json | null
          id: string
          largest_position_percent: number
          largest_sector_percent: number
          portfolio_value: number
          sector_breakdown: Json | null
          suggested_cash_target: number
          suggested_max_position: number
          user_id: string
          volatility_score: string
        }
        Insert: {
          cash_percent?: number
          created_at?: string
          deployment_guidance?: Json | null
          id?: string
          largest_position_percent?: number
          largest_sector_percent?: number
          portfolio_value?: number
          sector_breakdown?: Json | null
          suggested_cash_target?: number
          suggested_max_position?: number
          user_id: string
          volatility_score?: string
        }
        Update: {
          cash_percent?: number
          created_at?: string
          deployment_guidance?: Json | null
          id?: string
          largest_position_percent?: number
          largest_sector_percent?: number
          portfolio_value?: number
          sector_breakdown?: Json | null
          suggested_cash_target?: number
          suggested_max_position?: number
          user_id?: string
          volatility_score?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      message_reports: {
        Row: {
          created_at: string
          id: string
          message_id: string
          reason: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          reason: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          reason?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          edited_at: string | null
          id: string
          is_bot: boolean
          is_deleted: boolean
          is_edited: boolean
          is_pinned: boolean
          reply_to: string | null
          room_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_bot?: boolean
          is_deleted?: boolean
          is_edited?: boolean
          is_pinned?: boolean
          reply_to?: string | null
          room_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_bot?: boolean
          is_deleted?: boolean
          is_edited?: boolean
          is_pinned?: boolean
          reply_to?: string | null
          room_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          conflict_disclosure: string | null
          created_at: string
          display_name: string | null
          id: string
          is_verified: boolean
          reputation_score: number
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          conflict_disclosure?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_verified?: boolean
          reputation_score?: number
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          conflict_disclosure?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_verified?: boolean
          reputation_score?: number
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      room_members: {
        Row: {
          id: string
          is_banned: boolean
          is_muted: boolean
          joined_at: string
          notifications_enabled: boolean
          role: Database["public"]["Enums"]["room_role"]
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_banned?: boolean
          is_muted?: boolean
          joined_at?: string
          notifications_enabled?: boolean
          role?: Database["public"]["Enums"]["room_role"]
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_banned?: boolean
          is_muted?: boolean
          joined_at?: string
          notifications_enabled?: boolean
          role?: Database["public"]["Enums"]["room_role"]
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_archived: boolean
          member_count: number
          name: string
          rules: string | null
          slug: string
          symbol: string | null
          type: Database["public"]["Enums"]["room_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          member_count?: number
          name: string
          rules?: string | null
          slug: string
          symbol?: string | null
          type: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          member_count?: number
          name?: string
          rules?: string | null
          slug?: string
          symbol?: string | null
          type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      notification_type:
        | "mention"
        | "reply"
        | "follow"
        | "price_alert"
        | "room_invite"
        | "system"
      room_role: "member" | "moderator" | "admin" | "owner"
      room_type: "stock" | "hashtag" | "private" | "dm"
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
      app_role: ["admin", "moderator", "user"],
      notification_type: [
        "mention",
        "reply",
        "follow",
        "price_alert",
        "room_invite",
        "system",
      ],
      room_role: ["member", "moderator", "admin", "owner"],
      room_type: ["stock", "hashtag", "private", "dm"],
    },
  },
} as const
