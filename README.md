# SHRAM — Digital Naka 🏗️

> Transform India's offline naka labour system into a real-time digital marketplace.

## Stack
- **Frontend**: React Native Expo + Expo Router + TypeScript
- **Backend**: Supabase (PostgreSQL + PostGIS + Realtime + RLS)
- **State**: Zustand
- **Auth**: Supabase email/password (phone→dummy email mapping)

---

## Quick Start

### 1. Install dependencies
```bash
npm install
npx expo install @react-native-community/slider expo-location
```

### 2. Configure environment
```bash
cp .env.example .env
```
Fill in your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run database migrations
In Supabase SQL Editor, run in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_nearby_workers_rpc.sql`
3. `supabase/migrations/003_cleanup_functions.sql`

### 4. Start the app
```bash
npx expo start
```

---

## Architecture

```
app/
├── (auth)/          # Login, Signup
├── (onboarding)/    # Role select, Worker onboard, Contractor onboard
├── (worker)/        # Worker world — home, jobs, profile, booking, chat, rate
└── (contractor)/    # Contractor world — home, bookings, profile, worker detail, chat, rate

src/
├── lib/             # supabase.ts, auth.ts, onboarding.ts, booking.ts
├── stores/          # authStore, workerStore, bookingStore (Zustand)
├── hooks/           # useNearbyWorkers, useBookingRealtime, useChat
├── components/      # Button, TextInput, SkillPicker, WageSlider, WorkerCard...
├── constants/       # theme.ts, skills.ts
├── types/           # app.ts
└── utils/           # phoneEmail.ts, distance.ts, formatWage.ts
```

## Auth Flow
Phone number → `+91XXXXXXXXXX@shram.app` → Supabase email/password auth.
User never sees the email. Session persists via AsyncStorage.

## Key Feature: Nearby Workers
Uses PostGIS `ST_DWithin` via the `get_nearby_workers` RPC function.
Realtime subscription on `worker_availability` re-fetches on any change.

## Booking Lifecycle
```
pending → accepted → started → completed
       ↓           ↓
    rejected    cancelled
```
Bookings auto-expire after 5 minutes if not accepted.

---

## Phases Completed
- ✅ Phase 1: Architecture & DB Schema
- ✅ Phase 2: Auth (signup, login, session)
- ✅ Phase 3: Worker & Contractor onboarding
- ✅ Phase 4: Online/Offline toggle + Nearby workers marketplace
- ✅ Phase 5: Instant booking flow + lifecycle
- ✅ Phase 6: Real-time chat
- ✅ Phase 7: Ratings, job history, profiles

## Next (Phase 8 — Production)
- Push notifications (Expo Notifications + Supabase webhooks)
- UPI payment integration
- Worker ID verification (Aadhaar)
- Admin dashboard
- App Store / Play Store deployment
