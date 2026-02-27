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
      ai_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "ai_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_threads: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      alert_events: {
        Row: {
          alert_id: string
          id: string
          payload: Json | null
          triggered_at: string | null
        }
        Insert: {
          alert_id: string
          id?: string
          payload?: Json | null
          triggered_at?: string | null
        }
        Update: {
          alert_id?: string
          id?: string
          payload?: Json | null
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_events_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          is_enabled: boolean | null
          threshold: number | null
          ticker: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          threshold?: number | null
          ticker?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          threshold?: number | null
          ticker?: string | null
          user_id?: string
        }
        Relationships: []
      }
      behavior_metrics: {
        Row: {
          avg_hold_time_days: number | null
          computed_at: string | null
          id: string
          sector_bias: Json | null
          trades_per_week: number | null
          user_id: string
          volatility_response: Json | null
        }
        Insert: {
          avg_hold_time_days?: number | null
          computed_at?: string | null
          id?: string
          sector_bias?: Json | null
          trades_per_week?: number | null
          user_id: string
          volatility_response?: Json | null
        }
        Update: {
          avg_hold_time_days?: number | null
          computed_at?: string | null
          id?: string
          sector_bias?: Json | null
          trades_per_week?: number | null
          user_id?: string
          volatility_response?: Json | null
        }
        Relationships: []
      }
      behavioral_metrics: {
        Row: {
          avg_holding_duration: number
          avg_position_size: number
          avg_trade_frequency: number
          created_at: string
          discipline_score: number
          drawdown_flag: boolean
          flags_detail: Json | null
          guidance: Json | null
          id: string
          last_updated: string
          momentum_chasing_flag: boolean
          overtrading_flag: boolean
          revenge_flag: boolean
          size_escalation_flag: boolean
          trend_data: Json | null
          user_id: string
        }
        Insert: {
          avg_holding_duration?: number
          avg_position_size?: number
          avg_trade_frequency?: number
          created_at?: string
          discipline_score?: number
          drawdown_flag?: boolean
          flags_detail?: Json | null
          guidance?: Json | null
          id?: string
          last_updated?: string
          momentum_chasing_flag?: boolean
          overtrading_flag?: boolean
          revenge_flag?: boolean
          size_escalation_flag?: boolean
          trend_data?: Json | null
          user_id: string
        }
        Update: {
          avg_holding_duration?: number
          avg_position_size?: number
          avg_trade_frequency?: number
          created_at?: string
          discipline_score?: number
          drawdown_flag?: boolean
          flags_detail?: Json | null
          guidance?: Json | null
          id?: string
          last_updated?: string
          momentum_chasing_flag?: boolean
          overtrading_flag?: boolean
          revenge_flag?: boolean
          size_escalation_flag?: boolean
          trend_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      billing_customers: {
        Row: {
          created_at: string | null
          id: string
          provider: string
          provider_customer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          provider: string
          provider_customer_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          provider?: string
          provider_customer_id?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          plan: string | null
          provider: string
          provider_subscription_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan?: string | null
          provider: string
          provider_subscription_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan?: string | null
          provider?: string
          provider_subscription_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          description: string | null
          is_enabled: boolean | null
          key: string
          updated_at: string | null
        }
        Insert: {
          description?: string | null
          is_enabled?: boolean | null
          key: string
          updated_at?: string | null
        }
        Update: {
          description?: string | null
          is_enabled?: boolean | null
          key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          message: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          message: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          message?: string
          user_id?: string | null
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
      heat_engine_snapshots: {
        Row: {
          attention_subscore: number
          computed_at: string
          confidence_level: number
          detail: Json | null
          drivers: Json | null
          heat_score: number
          id: string
          liquidity_subscore: number
          momentum_subscore: number
          options_subscore: number
          stage: string
          symbol: string
          volatility_subscore: number
          volume_subscore: number
        }
        Insert: {
          attention_subscore?: number
          computed_at?: string
          confidence_level?: number
          detail?: Json | null
          drivers?: Json | null
          heat_score?: number
          id?: string
          liquidity_subscore?: number
          momentum_subscore?: number
          options_subscore?: number
          stage?: string
          symbol: string
          volatility_subscore?: number
          volume_subscore?: number
        }
        Update: {
          attention_subscore?: number
          computed_at?: string
          confidence_level?: number
          detail?: Json | null
          drivers?: Json | null
          heat_score?: number
          id?: string
          liquidity_subscore?: number
          momentum_subscore?: number
          options_subscore?: number
          stage?: string
          symbol?: string
          volatility_subscore?: number
          volume_subscore?: number
        }
        Relationships: []
      }
      insider_filings: {
        Row: {
          created_at: string | null
          external_id: string | null
          filing_date: string
          id: string
          insider_name: string | null
          insider_role: string | null
          issuer_name: string | null
          price: number | null
          shares: number | null
          source: string
          source_url: string
          ticker: string
          transaction_type: string
          value: number | null
        }
        Insert: {
          created_at?: string | null
          external_id?: string | null
          filing_date: string
          id?: string
          insider_name?: string | null
          insider_role?: string | null
          issuer_name?: string | null
          price?: number | null
          shares?: number | null
          source: string
          source_url: string
          ticker: string
          transaction_type: string
          value?: number | null
        }
        Update: {
          created_at?: string | null
          external_id?: string | null
          filing_date?: string
          id?: string
          insider_name?: string | null
          insider_role?: string | null
          issuer_name?: string | null
          price?: number | null
          shares?: number | null
          source?: string
          source_url?: string
          ticker?: string
          transaction_type?: string
          value?: number | null
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          completed_lessons: string[]
          created_at: string
          id: string
          passed_module_quizzes: string[]
          passed_unit_tests: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_lessons?: string[]
          created_at?: string
          id?: string
          passed_module_quizzes?: string[]
          passed_unit_tests?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_lessons?: string[]
          created_at?: string
          id?: string
          passed_module_quizzes?: string[]
          passed_unit_tests?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      market_news: {
        Row: {
          created_at: string
          external_id: string | null
          headline: string
          id: string
          published_at: string | null
          source: string | null
          summary: string | null
          ticker: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          headline: string
          id?: string
          published_at?: string | null
          source?: string | null
          summary?: string | null
          ticker?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          external_id?: string | null
          headline?: string
          id?: string
          published_at?: string | null
          source?: string | null
          summary?: string | null
          ticker?: string | null
          url?: string | null
        }
        Relationships: []
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
      moderation_actions: {
        Row: {
          action_type: string
          actor_user_id: string | null
          created_at: string | null
          id: string
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
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
      referrals: {
        Row: {
          code: string | null
          created_at: string | null
          id: string
          referred_user_id: string | null
          referrer_user_id: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          id?: string
          referred_user_id?: string | null
          referrer_user_id?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          id?: string
          referred_user_id?: string | null
          referrer_user_id?: string | null
        }
        Relationships: []
      }
      risk_snapshots: {
        Row: {
          account_scope: string | null
          beta: number | null
          computed_at: string | null
          exposure_by_sector: Json | null
          exposure_by_ticker: Json | null
          id: string
          user_id: string
          var_95: number | null
        }
        Insert: {
          account_scope?: string | null
          beta?: number | null
          computed_at?: string | null
          exposure_by_sector?: Json | null
          exposure_by_ticker?: Json | null
          id?: string
          user_id: string
          var_95?: number | null
        }
        Update: {
          account_scope?: string | null
          beta?: number | null
          computed_at?: string | null
          exposure_by_sector?: Json | null
          exposure_by_ticker?: Json | null
          id?: string
          user_id?: string
          var_95?: number | null
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
          is_invite_only: boolean
          join_code: string | null
          member_count: number
          name: string
          password_hash: string | null
          rules: string | null
          slug: string
          symbol: string | null
          ticker: string | null
          type: Database["public"]["Enums"]["room_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          is_invite_only?: boolean
          join_code?: string | null
          member_count?: number
          name: string
          password_hash?: string | null
          rules?: string | null
          slug: string
          symbol?: string | null
          ticker?: string | null
          type: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          is_invite_only?: boolean
          join_code?: string | null
          member_count?: number
          name?: string
          password_hash?: string | null
          rules?: string | null
          slug?: string
          symbol?: string | null
          ticker?: string | null
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
      sim_accounts: {
        Row: {
          base_currency: string | null
          created_at: string | null
          id: string
          name: string | null
          user_id: string
        }
        Insert: {
          base_currency?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          user_id: string
        }
        Update: {
          base_currency?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sim_cash_balances: {
        Row: {
          as_of: string | null
          available: number
          currency: string
          id: string
          sim_account_id: string
          total: number
        }
        Insert: {
          as_of?: string | null
          available?: number
          currency: string
          id?: string
          sim_account_id: string
          total?: number
        }
        Update: {
          as_of?: string | null
          available?: number
          currency?: string
          id?: string
          sim_account_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "sim_cash_balances_sim_account_id_fkey"
            columns: ["sim_account_id"]
            isOneToOne: false
            referencedRelation: "sim_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      sim_orders: {
        Row: {
          id: string
          limit_price: number | null
          order_type: string
          placed_at: string | null
          quantity: number
          side: string
          sim_account_id: string
          status: string
          ticker: string
        }
        Insert: {
          id?: string
          limit_price?: number | null
          order_type?: string
          placed_at?: string | null
          quantity: number
          side: string
          sim_account_id: string
          status?: string
          ticker: string
        }
        Update: {
          id?: string
          limit_price?: number | null
          order_type?: string
          placed_at?: string | null
          quantity?: number
          side?: string
          sim_account_id?: string
          status?: string
          ticker?: string
        }
        Relationships: [
          {
            foreignKeyName: "sim_orders_sim_account_id_fkey"
            columns: ["sim_account_id"]
            isOneToOne: false
            referencedRelation: "sim_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      sim_positions: {
        Row: {
          as_of: string | null
          avg_cost: number | null
          id: string
          market_value: number | null
          quantity: number
          sim_account_id: string
          ticker: string
          unrealized_pnl: number | null
        }
        Insert: {
          as_of?: string | null
          avg_cost?: number | null
          id?: string
          market_value?: number | null
          quantity?: number
          sim_account_id: string
          ticker: string
          unrealized_pnl?: number | null
        }
        Update: {
          as_of?: string | null
          avg_cost?: number | null
          id?: string
          market_value?: number | null
          quantity?: number
          sim_account_id?: string
          ticker?: string
          unrealized_pnl?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sim_positions_sim_account_id_fkey"
            columns: ["sim_account_id"]
            isOneToOne: false
            referencedRelation: "sim_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      sim_transactions: {
        Row: {
          amount: number | null
          currency: string | null
          executed_at: string | null
          id: string
          price: number | null
          quantity: number | null
          side: string | null
          sim_account_id: string
          ticker: string | null
        }
        Insert: {
          amount?: number | null
          currency?: string | null
          executed_at?: string | null
          id?: string
          price?: number | null
          quantity?: number | null
          side?: string | null
          sim_account_id: string
          ticker?: string | null
        }
        Update: {
          amount?: number | null
          currency?: string | null
          executed_at?: string | null
          id?: string
          price?: number | null
          quantity?: number | null
          side?: string | null
          sim_account_id?: string
          ticker?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sim_transactions_sim_account_id_fkey"
            columns: ["sim_account_id"]
            isOneToOne: false
            referencedRelation: "sim_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_active: boolean
          symbol: string
          target_value: number | null
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          symbol: string
          target_value?: number | null
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          symbol?: string
          target_value?: number | null
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_user_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          blocked_user_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          blocked_user_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_events: {
        Row: {
          created_at: string | null
          event_name: string
          id: string
          properties: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          id?: string
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          id?: string
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      user_sessions: {
        Row: {
          ended_at: string | null
          id: string
          ip_hash: string | null
          session_id: string | null
          started_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          ended_at?: string | null
          id?: string
          ip_hash?: string | null
          session_id?: string | null
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          ended_at?: string | null
          id?: string
          ip_hash?: string | null
          session_id?: string | null
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          dashboard_widgets: Json
          id: string
          sidebar_config: Json
          theme: string
          timezone: string
          trading_mode: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dashboard_widgets?: Json
          id?: string
          sidebar_config?: Json
          theme?: string
          timezone?: string
          trading_mode?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dashboard_widgets?: Json
          id?: string
          sidebar_config?: Json
          theme?: string
          timezone?: string
          trading_mode?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          added_at: string
          id: string
          symbol: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          symbol: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          symbol?: string
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
