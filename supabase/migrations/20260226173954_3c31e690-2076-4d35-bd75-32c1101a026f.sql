
CREATE TABLE public.capital_allocation_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  portfolio_value numeric NOT NULL DEFAULT 0,
  cash_percent numeric NOT NULL DEFAULT 0,
  largest_position_percent numeric NOT NULL DEFAULT 0,
  largest_sector_percent numeric NOT NULL DEFAULT 0,
  volatility_score text NOT NULL DEFAULT 'medium',
  suggested_cash_target numeric NOT NULL DEFAULT 10,
  suggested_max_position numeric NOT NULL DEFAULT 15,
  sector_breakdown jsonb DEFAULT '{}',
  deployment_guidance jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.capital_allocation_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots"
ON public.capital_allocation_snapshots FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snapshots"
ON public.capital_allocation_snapshots FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own snapshots"
ON public.capital_allocation_snapshots FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_allocation_snapshots_user_id ON public.capital_allocation_snapshots(user_id, created_at DESC);
