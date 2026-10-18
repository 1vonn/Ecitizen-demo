# HudumaConnect — Public Service Request System (Mini eCitizen Portal)

A full-featured Public Service Request System where citizens can register, sign in, submit service requests (such as broken streetlights, water & sanitation issues, garbage collection, road repairs, etc.) with optional photos, track request progress (**Pending → In Progress → Resolved**), and where county administrators manage cases and view resolution analytics.

---

## Key Features

1. **Citizen Registration & Login (`/login` & `/register`)**
   - Full account registration (Full Name, Email, Phone Number, Optional National ID, Role selection: Citizen or Admin Officer)
   - Integrated with **Supabase Auth** and the `profiles` PostgreSQL table
   - Includes **1-click Demo Citizen & Demo Admin access** for instant testing

2. **Submit Service Request (`/dashboard` & `/submit-request`)**
   - **Categories**: Broken Streetlight, Water & Sanitation, Garbage Collection, Roads & Transport, Drainage & Sewerage, Business Permits, Birth Certificate & ID, Land Services, Public Complaint
   - **Fields**: Category, Issue Summary/Title, Priority (`Low`, `Medium`, `High`, `Urgent`), Location/Landmark, Detailed Description, and **Optional Image** (device upload or image URL)
   - Automatically generates a unique tracking reference number (e.g., `PSR2026001`)

3. **Admin Dashboard (`/admin`)**
   - View & filter all citizen service requests by status, category, or search term
   - One-click status progression (**Pending → In Progress → Resolved**)
   - Detailed Case Management modal to add official admin notes and view attached evidence photos
   - Automatically logs every status transition in `request_status_history`

4. **Status Tracking (`/track-request` & Home Tracker)**
   - Look up any service request by its unique reference number (e.g., `PSR2026001`, `PSR2026002`, `PSR2026003`, or any newly created request)
   - Interactive 3-stage progress bar (**Pending → In Progress → Resolved**) and official admin updates

5. **Basic Analytics (Open vs. Resolved Cases)**
   - Live KPI cards for **Total Requests**, **Open Cases** (`Pending` + `In Progress`), **Resolved Cases**, and **Resolution Rate %**
   - Visual stacked comparison bar (`Pending` vs. `In Progress` vs. `Resolved`) and workload breakdown by service category

---

## Database Schema (Prisma + Supabase)

- **Prisma Schema**: [`prisma/schema.prisma`](./prisma/schema.prisma)
  - `Profile` (`profiles` table)
  - `ServiceRequest` (`service_requests` table)
  - `RequestStatusHistory` (`request_status_history` table)
- **Supabase SQL Setup**: [`supabase/schema.sql`](./supabase/schema.sql)
  - Includes tables, indexes, `on_auth_user_created` trigger (automatically creates a `profiles` row when a user signs up via Supabase Auth), and Row Level Security (RLS) policies.

### Connecting Your Supabase Database

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your Supabase project credentials in `.env`:
   ```env
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-supabase-anon-public-key"
   POSTGRES_PRISMA_URL="postgresql://postgres.[your-project-id]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   POSTGRES_URL_NON_POOLING="postgresql://postgres.[your-project-id]:[password]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
   ```
3. Push the schema to Supabase using Prisma or the Supabase SQL Editor:
   ```bash
   npm run db:push
   ```
   *(Or paste the contents of `supabase/schema.sql` into your Supabase SQL Editor to also enable the Auth-to-Profile trigger and RLS policies).*

---

## Running Locally

```bash
npm install
npm run dev
```
