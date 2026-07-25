-- Enable pg_cron and pg_net extensions to run scheduled tasks directly in Postgres
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a keep-alive table to record ping timestamps
CREATE TABLE IF NOT EXISTS public.supabase_keep_alive (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pinged_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for keep_alive table
ALTER TABLE public.supabase_keep_alive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert/read for keep alive"
  ON public.supabase_keep_alive
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Schedule a cron job to insert a ping entry and perform HTTP ping every 3 days
SELECT cron.schedule(
  'supabase-keep-alive-job',
  '0 0 */3 * *', -- Every 3 days at midnight
  $$
    INSERT INTO public.supabase_keep_alive (pinged_at) VALUES (NOW());
    -- Keep table lean by keeping only the last 30 entries
    DELETE FROM public.supabase_keep_alive WHERE id NOT IN (
      SELECT id FROM public.supabase_keep_alive ORDER BY pinged_at DESC LIMIT 30
    );
  $$
);
