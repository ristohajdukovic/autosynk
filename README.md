# AutoSync MVP (Next.js + Supabase)

AutoSync is a web-based vehicle maintenance companion. Drivers can log mileage with odometer photos, capture service history, schedule reminders, export a digital logbook, and discover nearby mechanics.

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env.local` and set your Supabase project details:

   ```bash
   cp .env.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL  
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key  
   - `SUPABASE_SERVICE_ROLE_KEY` - Required only for local scripts or migrations

3. **Create database schema**

   Apply `supabase/migrations/0001_init.sql` and `supabase/seed.sql` using the Supabase SQL editor or CLI.

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Feature overview

- **Authentication:** Email/password and OAuth (Google, Apple) via Supabase Auth.
- **Vehicle management:** Add vehicles, optional VIN, photos, and baseline mileage. Automatic starter maintenance schedule.
- **Odometer capture:** Upload images to Supabase storage, store mileage with optional OCR confidence.
- **Maintenance reminders:** Smart intervals with quick status updates.
- **Service logbook:** Track work performed with costs and notes.
- **Timeline:** Unified history of services, reminders, and mileage events.
- **PDF export:** Generate a digital service book via `/api/vehicles/:vehicleId/export`.
- **Mechanic finder:** Curated list plus static map view for nearby garages.

## Tech stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Recharts.
- **State & forms:** React Hook Form, Zod for validation.
- **Backend:** Supabase (Auth, Postgres, Storage, RPC helpers).
- **PDF generation:** `@react-pdf/renderer`.

## Testing & next steps

- Tailwind classes can be linted with `npm run lint`.
- Add Jest or Playwright tests before release.
- Replace the placeholder OCR flow with an AI integration (for example, Supabase Edge Function plus Vision API).
- Harden storage policies once folder-level ownership rules are available.
