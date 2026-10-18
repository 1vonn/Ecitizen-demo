# HudumaConnect — Public Service Request System (Mini eCitizen Portal)

A full-featured Public Service Request System where citizens can register, sign in, submit service requests (such as broken streetlights, water & sanitation issues, garbage collection, road repairs, etc.) with optional photos, track request progress (**Pending → In Progress → Resolved**), and where county administrators manage cases and view resolution analytics.

---

## Documentation

For comprehensive technical documentation, including system architecture, ER diagrams, data access layers, role-based access control (RBAC), and workflows, refer to:
📖 **[`DOCUMENTATION.md`](./DOCUMENTATION.md)**

---

## Key Features

1. **Citizen Registration & Authentication (`/login` & `/register`)**
   - Citizen registration (Full Name, Email, Phone Number, Optional National ID)
   - Integrated with **Supabase Auth** and the `profiles` PostgreSQL table
   - Strict role security: Public signups automatically default to `citizen`. Administrative roles are provisioned securely via database controls.
   - Default administrative officer account available for verified county staff testing.

2. **Submit Real-Time Service Request (`/dashboard` & `/submit-request`)**
   - **Categories**: Broken Streetlight, Water & Sanitation, Garbage Collection, Roads & Transport, Drainage & Sewerage, Business Permits, Birth Certificate & ID, Land Services, Public Complaint
   - **Fields**: Category, Issue Summary/Title, Priority (`Low`, `Medium`, `High`, `Urgent`), Location/Landmark, Detailed Description, and **Optional Evidence Photo** (client-side compressed upload)
   - Real-time persistence: Submissions are stored directly in Supabase PostgreSQL (no dummy data)
   - Automatically generates a unique tracking reference number (e.g., `PSR2026001`)

3. **Protected Admin Dashboard (`/admin`)**
   - Protected route: Only authenticated users with the verified `admin` role can access dashboard metrics and case management
   - View, search, and filter citizen service requests by status and category
   - One-click status progression (**Pending → In Progress → Resolved**)
   - Detailed Case Management modal to review attached evidence photos and add official administrative resolution updates
   - Automatically records audit entries in `request_status_history`

4. **Live Status Tracking (`/track-request` & Home Tracker)**
   - Look up any service request by its unique reference number (e.g., `PSR2026001`)
   - Interactive 3-stage progress stepper (**Pending → In Progress → Resolved**) with official admin updates and complete timeline
   - Queries directly against live database records

5. **Operational Analytics (Open vs. Resolved Cases)**
   - Live KPI cards for **Total Requests**, **Open Cases** (`Pending` + `In Progress`), **Resolved Cases**, and **Resolution Rate %**
   - Visual comparison breakdown (`Pending` vs. `In Progress` vs. `Resolved`) and workload distribution by department category

---

## Database Schema (Prisma + Supabase)

- **Prisma Schema**: [`prisma/schema.prisma`](./prisma/schema.prisma)
  - `Profile` (`profiles` table)
  - `ServiceRequest` (`service_requests` table)
  - `RequestStatusHistory` (`request_status_history` table)
- **Supabase SQL Setup**: [`supabase/schema.sql`](./supabase/schema.sql)
  - Includes tables, UUID generation defaults, triggers (`on_auth_user_created`, `on_auth_user_auto_confirm`), indexes, and Row Level Security (RLS) policies.

### Connecting Your Supabase Database

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your Supabase project credentials in `.env`:
   ```env
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-supabase-anon-public-key"
   POSTGRES_PRISMA_URL="postgresql://postgres.[your-project-id]:[password]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
   POSTGRES_URL_NON_POOLING="postgresql://postgres.[your-project-id]:[password]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
   ```
3. Push the schema to Supabase or execute the SQL setup:
   ```bash
   npm run db:push
   ```
   *(Or run `supabase/schema.sql` in the Supabase SQL Editor).*

---

## Running Locally

```bash
npm install
npm run dev
```
