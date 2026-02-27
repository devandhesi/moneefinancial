
-- Seed rooms only if slug doesn't already exist
INSERT INTO public.rooms (name, ticker, slug, type)
SELECT v.name, v.ticker, v.slug, v.rtype::room_type
FROM (VALUES
  ('$NVDA', 'NVDA', 'NVDA', 'stock'),
  ('$TSLA', 'TSLA', 'TSLA', 'stock'),
  ('#gold', NULL, 'gold', 'hashtag'),
  ('#uranium', NULL, 'uranium', 'hashtag')
) AS v(name, ticker, slug, rtype)
WHERE NOT EXISTS (SELECT 1 FROM public.rooms r WHERE r.slug = v.slug);
