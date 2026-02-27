
-- Table to track portfolio value over time
CREATE TABLE public.portfolio_value_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  total_value numeric NOT NULL DEFAULT 0,
  cash_balance numeric NOT NULL DEFAULT 0,
  investment_balance numeric NOT NULL DEFAULT 0,
  recorded_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast time-series queries
CREATE INDEX idx_pvs_user_recorded ON public.portfolio_value_snapshots (user_id, recorded_at DESC);

ALTER TABLE public.portfolio_value_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots" ON public.portfolio_value_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own snapshots" ON public.portfolio_value_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own snapshots" ON public.portfolio_value_snapshots FOR DELETE USING (auth.uid() = user_id);

-- Auto-record a snapshot after every trade/deposit via trigger
CREATE OR REPLACE FUNCTION public.record_portfolio_snapshot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_cash numeric;
  v_invested numeric;
BEGIN
  -- Get user_id from sim_account
  SELECT user_id INTO v_user_id FROM sim_accounts WHERE id = NEW.sim_account_id;
  IF v_user_id IS NULL THEN RETURN NEW; END IF;

  -- Get cash
  SELECT COALESCE(available, 0) INTO v_cash
  FROM sim_cash_balances
  WHERE sim_account_id = NEW.sim_account_id AND currency = 'USD'
  LIMIT 1;

  -- Get invested (using avg_cost * quantity as approximation; live prices update client-side)
  SELECT COALESCE(SUM(quantity * COALESCE(avg_cost, 0)), 0) INTO v_invested
  FROM sim_positions
  WHERE sim_account_id = NEW.sim_account_id AND quantity > 0;

  INSERT INTO portfolio_value_snapshots (user_id, total_value, cash_balance, investment_balance)
  VALUES (v_user_id, v_cash + v_invested, v_cash, v_invested);

  RETURN NEW;
END;
$$;

-- Fire after transactions (covers both trades and deposits)
CREATE TRIGGER trg_snapshot_after_transaction
AFTER INSERT ON public.sim_transactions
FOR EACH ROW
EXECUTE FUNCTION public.record_portfolio_snapshot();
