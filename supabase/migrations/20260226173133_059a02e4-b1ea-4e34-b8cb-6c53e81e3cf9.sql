
-- =============================================
-- Broker Connections (Read-Only) Schema
-- =============================================

-- 1. broker_connections
CREATE TABLE public.broker_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('plaid', 'alpaca', 'csv')),
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  metadata JSONB,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE public.broker_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections" ON public.broker_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own connections" ON public.broker_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own connections" ON public.broker_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own connections" ON public.broker_connections FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_broker_connections_updated_at BEFORE UPDATE ON public.broker_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. broker_accounts
CREATE TABLE public.broker_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  account_id TEXT NOT NULL,
  account_name TEXT,
  account_type TEXT,
  currency TEXT DEFAULT 'USD',
  cash NUMERIC DEFAULT 0,
  buying_power NUMERIC,
  total_value NUMERIC DEFAULT 0,
  as_of TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider, account_id)
);

ALTER TABLE public.broker_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts" ON public.broker_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON public.broker_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON public.broker_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON public.broker_accounts FOR DELETE USING (auth.uid() = user_id);

-- 3. broker_positions
CREATE TABLE public.broker_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  account_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  average_price NUMERIC,
  market_price NUMERIC,
  market_value NUMERIC,
  unrealized_pl NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider, account_id, symbol)
);

ALTER TABLE public.broker_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own positions" ON public.broker_positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own positions" ON public.broker_positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own positions" ON public.broker_positions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own positions" ON public.broker_positions FOR DELETE USING (auth.uid() = user_id);

-- 4. broker_orders
CREATE TABLE public.broker_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  account_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  order_type TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider, account_id, order_id)
);

ALTER TABLE public.broker_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.broker_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.broker_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.broker_orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own orders" ON public.broker_orders FOR DELETE USING (auth.uid() = user_id);

-- 5. broker_fills
CREATE TABLE public.broker_fills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  account_id TEXT NOT NULL,
  order_id TEXT,
  execution_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider, account_id, execution_id)
);

ALTER TABLE public.broker_fills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fills" ON public.broker_fills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fills" ON public.broker_fills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fills" ON public.broker_fills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fills" ON public.broker_fills FOR DELETE USING (auth.uid() = user_id);
