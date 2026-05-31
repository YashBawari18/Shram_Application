-- ============================================================
-- Migration 004: Fix booking RLS policies
-- ============================================================
-- PROBLEM: Worker policy only allowed ('accepted','rejected','started')
-- so markJobCompleted() was silently blocked → booking never reached
-- 'completed' → ratings RLS check (status = 'completed') always failed.
-- ============================================================

-- 1. Fix worker update policy to allow 'completed' as well
DROP POLICY IF EXISTS "Worker can update booking status (accept/reject)" ON instant_bookings;

CREATE POLICY "Worker can update booking status"
  ON instant_bookings FOR UPDATE
  USING (auth.uid() = worker_id)
  WITH CHECK (status IN ('accepted', 'rejected', 'started', 'completed'));

-- 2. Fix contractor update policy to also allow 'completed'
--    (contractor may also want to mark a job done)
DROP POLICY IF EXISTS "Contractor can cancel their booking" ON instant_bookings;

CREATE POLICY "Contractor can update their booking"
  ON instant_bookings FOR UPDATE
  USING (auth.uid() = contractor_id)
  WITH CHECK (status IN ('cancelled', 'completed'));
