
CREATE TABLE public.market_news (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker text,
  headline text NOT NULL,
  source text,
  url text,
  summary text,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_market_news_ticker ON public.market_news (ticker);
CREATE INDEX idx_market_news_published_at ON public.market_news (published_at DESC);

ALTER TABLE public.market_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market news is publicly readable"
  ON public.market_news FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert news"
  ON public.market_news FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can delete old news"
  ON public.market_news FOR DELETE
  USING (true);
