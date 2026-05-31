-- ============================================================
-- Migration 005: Fix rating trigger security and profile RLS
-- ============================================================

-- 1. Fix the update_avg_rating function to run as SECURITY DEFINER.
--    This ensures that when a rating is inserted, the trigger has
--    permission to update worker/contractor average ratings, bypassing
--    RLS restrictions on the other user's profiles table.
CREATE OR REPLACE FUNCTION update_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update worker rating cache
  UPDATE public.worker_profiles
  SET avg_rating = (
    SELECT COALESCE(AVG(score), 0) FROM public.ratings WHERE ratee_id = NEW.ratee_id
  ),
  total_jobs = (
    SELECT COUNT(DISTINCT booking_id) FROM public.ratings WHERE ratee_id = NEW.ratee_id
  )
  WHERE id = NEW.ratee_id;

  -- Update contractor rating cache
  UPDATE public.contractor_profiles
  SET avg_rating = (
    SELECT COALESCE(AVG(score), 0) FROM public.ratings WHERE ratee_id = NEW.ratee_id
  ),
  total_hires = (
    SELECT COUNT(DISTINCT booking_id) FROM public.ratings WHERE ratee_id = NEW.ratee_id
  )
  WHERE id = NEW.ratee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Drop the broken select policy on profiles that uses the incorrect auth.role() check
DROP POLICY IF EXISTS "Contractors can read worker basic info" ON public.profiles;

-- 3. Create a clean select policy on profiles that allows any authenticated user to view profiles.
--    This allows workers to view contractor names/avatars/details, and contractors to view worker profiles.
CREATE POLICY "Anyone authenticated can read profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');
