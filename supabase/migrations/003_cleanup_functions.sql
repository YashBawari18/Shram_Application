-- ============================================================
-- SHRAM Migration 003 — Auto-cleanup stale workers + expire bookings
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Auto-expire pending bookings that passed expires_at
--    Run via Supabase Edge Function cron OR pg_cron if available.
--    This function is called by a scheduled job every minute.
CREATE OR REPLACE FUNCTION expire_stale_bookings()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE instant_bookings
  SET status = 'cancelled', updated_at = NOW()
  WHERE status = 'pending'
    AND expires_at < NOW();
$$;

-- 2. Mark workers offline if their updated_at is > 8 hours ago
--    (handles app crash / phone off scenarios)
CREATE OR REPLACE FUNCTION cleanup_stale_workers()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE worker_availability
  SET is_online = FALSE, updated_at = NOW()
  WHERE is_online = TRUE
    AND updated_at < NOW() - INTERVAL '8 hours';
$$;

-- 3. Grant execute
GRANT EXECUTE ON FUNCTION expire_stale_bookings TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_stale_workers TO service_role;

-- NOTE: Schedule these via Supabase Dashboard → Edge Functions → Cron
-- Or use pg_cron (if enabled on your Supabase plan):
--
-- SELECT cron.schedule('expire-bookings', '* * * * *', 'SELECT expire_stale_bookings()');
-- SELECT cron.schedule('cleanup-workers', '0 * * * *', 'SELECT cleanup_stale_workers()');
