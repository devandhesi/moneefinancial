
-- Create heat engine snapshots table
CREATE TABLE public.heat_engine_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  heat_score NUMERIC NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'cold',
  volume_subscore NUMERIC NOT NULL DEFAULT 0,
  momentum_subscore NUMERIC NOT NULL DEFAULT 0,
  volatility_subscore NUMERIC NOT NULL DEFAULT 0,
  options_subscore NUMERIC NOT NULL DEFAULT 0,
  attention_subscore NUMERIC NOT NULL DEFAULT 0,
  liquidity_subscore NUMERIC NOT NULL DEFAULT 0,
  confidence_level NUMERIC NOT NULL DEFAULT 0,
  drivers JSONB DEFAULT '[]'::jsonb,
  detail JSONB DEFAULT '{}'::jsonb,
  computed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_heat_snapshots_symbol_computed ON public.heat_engine_snapshots (symbol, computed_at DESC);
CREATE INDEX idx_heat_snapshots_score ON public.heat_engine_snapshots (heat_score DESC);

-- Enable RLS
ALTER TABLE public.heat_engine_snapshots ENABLE ROW LEVEL SECURITY;

-- Public read access (this is market data, not user-specific)
CREATE POLICY "Heat snapshots are publicly readable"
  ON public.heat_engine_snapshots
  FOR SELECT
  USING (true);

-- Only service role can insert/update (edge function writes)
CREATE POLICY "Service role can insert heat snapshots"
  ON public.heat_engine_snapshots
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can delete old snapshots"
  ON public.heat_engine_snapshots
  FOR DELETE
  USING (true);
