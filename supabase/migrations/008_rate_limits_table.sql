-- Create rate_limits table for persistent rate limiting
-- Used by Edge Functions to track request rates per identifier (IP)

CREATE TABLE IF NOT EXISTS public.rate_limits (
  identifier TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits (window_start);

-- Allow Edge Function (service role) to access this table
-- No RLS needed since this is only accessed by backend services

COMMENT ON TABLE public.rate_limits IS 'Tracks rate limits per identifier (usually IP address) for Edge Functions';
COMMENT ON COLUMN public.rate_limits.identifier IS 'The rate limit identifier (e.g., IP address)';
COMMENT ON COLUMN public.rate_limits.count IS 'Number of requests in current window';
COMMENT ON COLUMN public.rate_limits.window_start IS 'Start time of the current rate limit window';

-- Clean up old rate limit records periodically (optional - can be done via cron)
-- Records older than 1 hour can be safely deleted
