
-- ================================
-- MONEE MASTER SCHEMA - NEW TABLES ONLY
-- ================================

-- Add symbol column to rooms if missing
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS symbol text;

-- Indexes on existing tables
CREATE INDEX IF NOT EXISTS idx_rooms_ticker ON public.rooms(ticker);
CREATE INDEX IF NOT EXISTS idx_messages_room_created_at_desc ON public.messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_created_at_desc ON public.messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_reports_message ON public.message_reports(message_id);
CREATE INDEX IF NOT EXISTS idx_market_news_ticker_published ON public.market_news(ticker, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_news_published ON public.market_news(published_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_market_news_source_external_id ON public.market_news(source, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_desc ON public.notifications(user_id, created_at DESC);

-- USER BLOCKS
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  blocked_user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, blocked_user_id)
);
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own blocks" ON public.user_blocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can block" ON public.user_blocks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unblock" ON public.user_blocks FOR DELETE USING (auth.uid() = user_id);

-- MODERATION ACTIONS
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  actor_user_id uuid,
  reason text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_target ON public.moderation_actions(target_type, target_id);
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view moderation actions" ON public.moderation_actions FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Admins can insert moderation actions" ON public.moderation_actions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- INSIDER FILINGS
CREATE TABLE IF NOT EXISTS public.insider_filings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text NOT NULL,
  insider_name text,
  insider_role text,
  transaction_type text NOT NULL,
  shares numeric,
  price numeric,
  value numeric,
  filing_date timestamptz NOT NULL,
  issuer_name text,
  source text NOT NULL,
  source_url text NOT NULL,
  external_id text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_insider_filings_ticker_filing_date ON public.insider_filings(ticker, filing_date DESC);
CREATE INDEX IF NOT EXISTS idx_insider_filings_filing_date ON public.insider_filings(filing_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_insider_filings_source_external_id ON public.insider_filings(source, external_id) WHERE external_id IS NOT NULL;
ALTER TABLE public.insider_filings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insider filings publicly readable" ON public.insider_filings FOR SELECT USING (true);
CREATE POLICY "Service can insert insider filings" ON public.insider_filings FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can delete insider filings" ON public.insider_filings FOR DELETE USING (true);

-- AI THREADS
CREATE TABLE IF NOT EXISTS public.ai_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_threads_user_created_at_desc ON public.ai_threads(user_id, created_at DESC);
ALTER TABLE public.ai_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own threads" ON public.ai_threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own threads" ON public.ai_threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own threads" ON public.ai_threads FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own threads" ON public.ai_threads FOR UPDATE USING (auth.uid() = user_id);

-- AI MESSAGES
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.ai_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_messages_thread_created_at_asc ON public.ai_messages(thread_id, created_at ASC);
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ai messages" ON public.ai_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai messages" ON public.ai_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai messages" ON public.ai_messages FOR DELETE USING (auth.uid() = user_id);

-- ALERTS
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ticker text,
  alert_type text NOT NULL,
  threshold numeric,
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_alerts_user_enabled ON public.alerts(user_id, is_enabled);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own alerts2" ON public.alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create alerts2" ON public.alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts2" ON public.alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts2" ON public.alerts FOR DELETE USING (auth.uid() = user_id);

-- ALERT EVENTS
CREATE TABLE IF NOT EXISTS public.alert_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  triggered_at timestamptz DEFAULT now(),
  payload jsonb
);
CREATE INDEX IF NOT EXISTS idx_alert_events_alert_triggered_desc ON public.alert_events(alert_id, triggered_at DESC);
ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own alert events" ON public.alert_events FOR SELECT USING (
  alert_id IN (SELECT id FROM public.alerts WHERE user_id = auth.uid())
);

-- SIM ACCOUNTS
CREATE TABLE IF NOT EXISTS public.sim_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text DEFAULT 'Paper Trading',
  base_currency text DEFAULT 'CAD',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sim_accounts_user ON public.sim_accounts(user_id);
ALTER TABLE public.sim_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sim accounts" ON public.sim_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create sim accounts" ON public.sim_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sim accounts" ON public.sim_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sim accounts" ON public.sim_accounts FOR DELETE USING (auth.uid() = user_id);

-- SIM CASH BALANCES
CREATE TABLE IF NOT EXISTS public.sim_cash_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sim_account_id uuid NOT NULL REFERENCES public.sim_accounts(id) ON DELETE CASCADE,
  currency text NOT NULL,
  available numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  as_of timestamptz DEFAULT now(),
  UNIQUE(sim_account_id, currency)
);
ALTER TABLE public.sim_cash_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sim balances" ON public.sim_cash_balances FOR SELECT USING (sim_account_id IN (SELECT id FROM public.sim_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert sim balances" ON public.sim_cash_balances FOR INSERT WITH CHECK (sim_account_id IN (SELECT id FROM public.sim_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Users can update sim balances" ON public.sim_cash_balances FOR UPDATE USING (sim_account_id IN (SELECT id FROM public.sim_accounts WHERE user_id = auth.uid()));

-- SIM POSITIONS
CREATE TABLE IF NOT EXISTS public.sim_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sim_account_id uuid NOT NULL REFERENCES public.sim_accounts(id) ON DELETE CASCADE,
  ticker text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  avg_cost numeric,
  market_value numeric,
  unrealized_pnl numeric,
  as_of timestamptz DEFAULT now(),
  UNIQUE(sim_account_id, ticker)
);
CREATE INDEX IF NOT EXISTS idx_sim_positions_account_ticker ON public.sim_positions(sim_account_id, ticker);
ALTER TABLE public.sim_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sim positions" ON public.sim_positions FOR SELECT USING (sim_account_id IN (SELECT id FROM public.sim_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert sim positions" ON public.sim_positions FOR INSERT WITH CHECK (sim_account_id IN (SELECT id FROM public.sim_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Users can update sim positions" ON public.sim_positions FOR UPDATE USING (sim_account_id IN (SELECT id FROM public.sim_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete sim positions" ON public.sim_positions FOR DELETE USING (sim_account_id IN (SELECT id FROM public.sim_accounts WHERE user_id = auth.uid()));

-- SIM ORDERS
CREATE TABLE IF NOT EXISTS public.sim_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sim_account_id uuid NOT NULL REFERENCES public.sim_accounts(id) ON DELETE CASCADE,
  ticker text NOT NULL,
  side text NOT NULL,
  order_type text NOT NULL DEFAULT 'limit',
  quantity numeric NOT NULL,
  limit_price numeric,
  status text NOT NULL DEFAULT 'created',
  placed_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sim_orders_account_placed_desc ON public.sim_orders(sim_account_id, placed_at DESC);
ALTER TABLE public.sim_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sim orders" ON public.sim_orders FOR SELECT USING (sim_account_id IN (SELECT id FROM public.sim_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Users can create sim orders" ON public.sim_orders FOR INSERT WITH CHECK (sim_account_id IN (SELECT id FROM public.sim_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Users can update sim orders" ON public.sim_orders FOR UPDATE USING (sim_account_id IN (SELECT id FROM public.sim_accounts WHERE user_id = auth.uid()));

-- SIM TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.sim_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sim_account_id uuid NOT NULL REFERENCES public.sim_accounts(id) ON DELETE CASCADE,
  ticker text,
  side text,
  quantity numeric,
  price numeric,
  amount numeric,
  currency text,
  executed_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sim_tx_account_executed_desc ON public.sim_transactions(sim_account_id, executed_at DESC);
ALTER TABLE public.sim_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sim transactions" ON public.sim_transactions FOR SELECT USING (sim_account_id IN (SELECT id FROM public.sim_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert sim transactions" ON public.sim_transactions FOR INSERT WITH CHECK (sim_account_id IN (SELECT id FROM public.sim_accounts WHERE user_id = auth.uid()));

-- USER SESSIONS
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  ip_hash text,
  user_agent text,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_started_desc ON public.user_sessions(user_id, started_at DESC);
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.user_sessions FOR UPDATE USING (auth.uid() = user_id);

-- USER EVENTS
CREATE TABLE IF NOT EXISTS public.user_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  event_name text NOT NULL,
  properties jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_events_user_created_desc ON public.user_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_events_event_created_desc ON public.user_events(event_name, created_at DESC);
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own events" ON public.user_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON public.user_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- BEHAVIOR METRICS
CREATE TABLE IF NOT EXISTS public.behavior_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  avg_hold_time_days numeric,
  trades_per_week numeric,
  sector_bias jsonb,
  volatility_response jsonb,
  computed_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_behavior_metrics_user_computed_desc ON public.behavior_metrics(user_id, computed_at DESC);
ALTER TABLE public.behavior_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own behavior metrics" ON public.behavior_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert behavior metrics" ON public.behavior_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RISK SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.risk_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_scope text DEFAULT 'all',
  exposure_by_sector jsonb,
  exposure_by_ticker jsonb,
  beta numeric,
  var_95 numeric,
  computed_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_risk_snapshots_user_computed_desc ON public.risk_snapshots(user_id, computed_at DESC);
ALTER TABLE public.risk_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own risk snapshots" ON public.risk_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert risk snapshots" ON public.risk_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);

-- FEATURE FLAGS
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key text PRIMARY KEY,
  description text,
  is_enabled boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feature flags publicly readable" ON public.feature_flags FOR SELECT USING (true);

-- FEEDBACK
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  category text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can submit feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own feedback" ON public.feedback FOR SELECT USING (auth.uid() = user_id);

-- REFERRALS
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid,
  referred_user_id uuid,
  code text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referred_user_id)
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);
CREATE POLICY "Users can create referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_user_id);

-- BILLING CUSTOMERS
CREATE TABLE IF NOT EXISTS public.billing_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  provider_customer_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider, provider_customer_id),
  UNIQUE(user_id, provider)
);
ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own billing" ON public.billing_customers FOR SELECT USING (auth.uid() = user_id);

-- BILLING SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  provider_subscription_id text NOT NULL,
  status text,
  plan text,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider, provider_subscription_id)
);
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON public.billing_subscriptions FOR SELECT USING (auth.uid() = user_id);
