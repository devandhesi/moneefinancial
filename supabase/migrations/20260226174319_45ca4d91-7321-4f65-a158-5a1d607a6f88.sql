
CREATE TABLE public.behavioral_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  discipline_score numeric NOT NULL DEFAULT 100,
  overtrading_flag boolean NOT NULL DEFAULT false,
  revenge_flag boolean NOT NULL DEFAULT false,
  size_escalation_flag boolean NOT NULL DEFAULT false,
  drawdown_flag boolean NOT NULL DEFAULT false,
  momentum_chasing_flag boolean NOT NULL DEFAULT false,
  avg_trade_frequency numeric NOT NULL DEFAULT 0,
  avg_position_size numeric NOT NULL DEFAULT 0,
  avg_holding_duration numeric NOT NULL DEFAULT 0,
  flags_detail jsonb DEFAULT '[]',
  trend_data jsonb DEFAULT '{}',
  guidance jsonb DEFAULT '[]',
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.behavioral_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metrics"
ON public.behavioral_metrics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics"
ON public.behavioral_metrics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own metrics"
ON public.behavioral_metrics FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_behavioral_metrics_user ON public.behavioral_metrics(user_id, created_at DESC);
