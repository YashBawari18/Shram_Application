-- ============================================================
-- SHRAM Migration 002 — Nearby Workers RPC
-- ============================================================

/**
 * get_nearby_workers(user_lat, user_lng, radius_km, filter_skill, max_wage)
 *
 * Returns all online workers within radius_km of the given point,
 * joined with their profile and worker_profile data.
 * Optional filters: skill type, max daily wage.
 *
 * Uses PostGIS ST_DWithin for spatial filtering — fast with GIST index.
 */
CREATE OR REPLACE FUNCTION get_nearby_workers(
  user_lat    DOUBLE PRECISION,
  user_lng    DOUBLE PRECISION,
  radius_km   DOUBLE PRECISION DEFAULT 5,
  filter_skill TEXT DEFAULT NULL,
  max_wage    NUMERIC DEFAULT NULL
)
RETURNS TABLE (
  worker_id       UUID,
  name            TEXT,
  avatar_url      TEXT,
  skill           TEXT,
  today_wage      NUMERIC,
  avg_rating      NUMERIC,
  total_jobs      INTEGER,
  distance_km     DOUBLE PRECISION,
  location_name   TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    p.id                      AS worker_id,
    p.name,
    p.avatar_url,
    wp.skill,
    wa.today_wage,
    wp.avg_rating,
    wp.total_jobs,
    ROUND((ST_Distance(wa.location::geography, ST_MakePoint(user_lng, user_lat)::geography) / 1000.0)::numeric)                         AS distance_km,
    wa.location_name
  FROM worker_availability wa
  JOIN profiles p         ON p.id = wa.worker_id
  JOIN worker_profiles wp ON wp.id = wa.worker_id
  WHERE
    wa.is_online = TRUE
    AND ST_DWithin(
      wa.location::geography,
      ST_MakePoint(user_lng, user_lat)::geography,
      radius_km * 1000   -- ST_DWithin uses metres
    )
    AND (filter_skill IS NULL OR wp.skill = filter_skill)
    AND (max_wage IS NULL OR wa.today_wage <= max_wage)
  ORDER BY distance_km ASC
  LIMIT 50;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_nearby_workers TO authenticated;
