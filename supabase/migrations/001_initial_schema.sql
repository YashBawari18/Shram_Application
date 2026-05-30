-- ============================================================
-- SHRAM / DIGITAL NAKA — Supabase Migration
-- Version: 001_initial_schema
-- ============================================================

-- Enable PostGIS for location queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ─── ENUMS ────────────────────────────────────────────────────────────────────
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS app_language CASCADE;

CREATE TYPE user_role AS ENUM ('worker', 'contractor');

CREATE TYPE booking_status AS ENUM (
  'pending',
  'accepted',
  'started',
  'completed',
  'rejected',
  'cancelled'
);

CREATE TYPE app_language AS ENUM ('hi', 'mr', 'en');

-- ─── PROFILES ─────────────────────────────────────────────────────────────────
-- One row per auth.users entry. Created by trigger on signup.
CREATE TABLE profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone                 TEXT UNIQUE NOT NULL,
  role                  user_role,
  name                  TEXT,
  avatar_url            TEXT,
  onboarding_complete   BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_language    app_language NOT NULL DEFAULT 'hi',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── WORKER PROFILES ──────────────────────────────────────────────────────────
CREATE TABLE worker_profiles (
  id                UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  skill             TEXT NOT NULL,
  skills_extra      TEXT[] NOT NULL DEFAULT '{}',
  experience_years  SMALLINT NOT NULL DEFAULT 0,
  daily_wage        NUMERIC(8,2) NOT NULL DEFAULT 0,
  bio               TEXT,
  avg_rating        NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_jobs        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CONTRACTOR PROFILES ──────────────────────────────────────────────────────
CREATE TABLE contractor_profiles (
  id              UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name    TEXT,
  gst_number      TEXT,
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  avg_rating      NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_hires     INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── WORKER AVAILABILITY ──────────────────────────────────────────────────────
-- This is the "naka" — workers who are online and available right now.
CREATE TABLE worker_availability (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_online       BOOLEAN NOT NULL DEFAULT FALSE,
  location        GEOGRAPHY(Point, 4326),   -- PostGIS point (lng, lat)
  location_name   TEXT,                     -- "Panvel Station Naka"
  today_wage      NUMERIC(8,2) NOT NULL DEFAULT 0,
  available_from  TIMETZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(worker_id)
);

-- Spatial index for ST_DWithin queries
CREATE INDEX worker_availability_location_idx
  ON worker_availability USING GIST (location)
  WHERE is_online = TRUE;

-- ─── INSTANT BOOKINGS ─────────────────────────────────────────────────────────
CREATE TABLE instant_bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id   UUID NOT NULL REFERENCES profiles(id),
  worker_id       UUID NOT NULL REFERENCES profiles(id),
  status          booking_status NOT NULL DEFAULT 'pending',
  agreed_wage     NUMERIC(8,2) NOT NULL,
  skill_required  TEXT NOT NULL,
  work_location   GEOGRAPHY(Point, 4326),
  work_address    TEXT NOT NULL,
  work_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  notes           TEXT,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes'),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX instant_bookings_worker_id_idx ON instant_bookings(worker_id);
CREATE INDEX instant_bookings_contractor_id_idx ON instant_bookings(contractor_id);
CREATE INDEX instant_bookings_status_idx ON instant_bookings(status);

-- ─── MESSAGES ─────────────────────────────────────────────────────────────────
-- Chat is scoped to a booking. No open DMs.
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES instant_bookings(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES profiles(id),
  content     TEXT NOT NULL CHECK (char_length(content) > 0),
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX messages_booking_id_idx ON messages(booking_id, created_at);

-- ─── RATINGS ──────────────────────────────────────────────────────────────────
CREATE TABLE ratings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES instant_bookings(id),
  rater_id    UUID NOT NULL REFERENCES profiles(id),
  ratee_id    UUID NOT NULL REFERENCES profiles(id),
  score       SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(booking_id, rater_id)  -- one rating per person per job
);

-- ─── AUTO-UPDATE avg_rating ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update worker rating cache
  UPDATE worker_profiles
  SET avg_rating = (
    SELECT COALESCE(AVG(score), 0) FROM ratings WHERE ratee_id = NEW.ratee_id
  ),
  total_jobs = (
    SELECT COUNT(DISTINCT booking_id) FROM ratings WHERE ratee_id = NEW.ratee_id
  )
  WHERE id = NEW.ratee_id;

  -- Update contractor rating cache
  UPDATE contractor_profiles
  SET avg_rating = (
    SELECT COALESCE(AVG(score), 0) FROM ratings WHERE ratee_id = NEW.ratee_id
  ),
  total_hires = (
    SELECT COUNT(DISTINCT booking_id) FROM ratings WHERE ratee_id = NEW.ratee_id
  )
  WHERE id = NEW.ratee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_rating_insert
  AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_avg_rating();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_availability  ENABLE ROW LEVEL SECURITY;
ALTER TABLE instant_bookings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings              ENABLE ROW LEVEL SECURITY;

-- ─── profiles ─────────────────────────────────────────────────────────────────
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Contractors can see worker names/ratings (needed for hire screen)
CREATE POLICY "Contractors can read worker basic info"
  ON profiles FOR SELECT
  USING (auth.role() = 'contractor' AND role = 'worker');

-- ─── worker_profiles ──────────────────────────────────────────────────────────
CREATE POLICY "Workers manage own worker profile"
  ON worker_profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Contractors can read worker profiles"
  ON worker_profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'contractor')
  );

-- ─── contractor_profiles ──────────────────────────────────────────────────────
CREATE POLICY "Contractors manage own profile"
  ON contractor_profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Workers can read contractor profiles"
  ON contractor_profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'worker')
  );

-- ─── worker_availability ──────────────────────────────────────────────────────
CREATE POLICY "Workers manage own availability"
  ON worker_availability FOR ALL USING (auth.uid() = worker_id);

CREATE POLICY "Contractors see all online workers"
  ON worker_availability FOR SELECT
  USING (
    is_online = TRUE
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'contractor')
  );

-- ─── instant_bookings ─────────────────────────────────────────────────────────
CREATE POLICY "Workers see their own bookings"
  ON instant_bookings FOR SELECT USING (auth.uid() = worker_id);

CREATE POLICY "Contractors see their own bookings"
  ON instant_bookings FOR SELECT USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can create bookings"
  ON instant_bookings FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Worker can update booking status (accept/reject)"
  ON instant_bookings FOR UPDATE
  USING (auth.uid() = worker_id)
  WITH CHECK (status IN ('accepted', 'rejected', 'started'));

CREATE POLICY "Contractor can cancel their booking"
  ON instant_bookings FOR UPDATE
  USING (auth.uid() = contractor_id)
  WITH CHECK (status = 'cancelled');

-- ─── messages ─────────────────────────────────────────────────────────────────
CREATE POLICY "Booking participants can read messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM instant_bookings b
      WHERE b.id = messages.booking_id
      AND (b.worker_id = auth.uid() OR b.contractor_id = auth.uid())
    )
  );

CREATE POLICY "Booking participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM instant_bookings b
      WHERE b.id = booking_id
      AND (b.worker_id = auth.uid() OR b.contractor_id = auth.uid())
    )
  );

-- ─── ratings ──────────────────────────────────────────────────────────────────
CREATE POLICY "Participants can rate completed jobs"
  ON ratings FOR INSERT
  WITH CHECK (
    auth.uid() = rater_id
    AND EXISTS (
      SELECT 1 FROM instant_bookings b
      WHERE b.id = booking_id
      AND b.status = 'completed'
      AND (b.worker_id = auth.uid() OR b.contractor_id = auth.uid())
    )
  );

CREATE POLICY "Anyone can read ratings"
  ON ratings FOR SELECT USING (TRUE);

-- ============================================================
-- REALTIME
-- Enable realtime for core tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE worker_availability;
ALTER PUBLICATION supabase_realtime ADD TABLE instant_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
