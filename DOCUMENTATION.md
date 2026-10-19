# HudumaConnect — System Architecture & Technical Documentation

> **Mini eCitizen-Style Public Service Request & Case Management Platform**  
> *Built with React, Vite, Supabase, Prisma, and PostgreSQL.*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Project Structure](#4-project-structure)
5. [Database Design & Schema (Prisma & PostgreSQL)](#5-database-design--schema-prisma--postgresql)
   - [Prisma Schema](#prisma-schema)
   - [Database Entities & Relations](#database-entities--relations)
   - [Automated Triggers & Functions](#automated-triggers--functions)
   - [Row-Level Security (RLS) & Permissions](#row-level-security-rls--permissions)
6. [Role-Based Access Control (RBAC) & Security](#6-role-based-access-control-rbac--security)
7. [Core Platform Features & Workflows](#7-core-platform-features--workflows)
   - [Citizen Registration & Authentication](#citizen-registration--authentication)
   - [Service Request Submission & Image Compression](#service-request-submission--image-compression)
   - [Live Request Tracking & Lifecycle](#live-request-tracking--lifecycle)
   - [Administrator Dashboard & Case Queue](#administrator-dashboard--case-queue)
   - [Resolution Analytics & Department Metrics](#resolution-analytics--department-metrics)
8. [Data Access Layer (`src/lib/database.js`)](#8-data-access-layer-srclibdatabasejs)
9. [Application Routing & Navigation](#9-application-routing--navigation)
10. [Environment Variables & Setup Guide](#10-environment-variables--setup-guide)
11. [Troubleshooting & FAQs](#11-troubleshooting--faqs)

---

## 1. Executive Summary

**HudumaConnect** is a digital public service platform modeled after municipal service portals (eCitizen-style). It enables citizens to report civil and civic issues (e.g., broken streetlights, water pipeline bursts, uncollected garbage, road potholes) and follow the status of their requests in real-time.

County officers access an authenticated, role-guarded **Admin Dashboard** to review cases, update resolution statuses through a standardized three-tier pipeline (**Pending → In Progress → Resolved**), leave official notes, and analyze resolution efficiency.

---

## 2. Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | React 19.x | Modern functional React with Hooks and Context API |
| **Bundler & Tooling** | Vite 8.x | High-performance client-side build system |
| **Routing** | React Router v7 | Declarative client-side routing & route guarding |
| **Database ORM** | Prisma 6.x | Schema definition, migrations, and database modeling |
| **Backend / DB** | Supabase (PostgreSQL 15+) | Managed PostgreSQL, Supabase Auth, and RESTful API |
| **Styling** | Modular Vanilla CSS | Custom responsive CSS aligned with the Huduma brand palette |
| **Icons** | React Icons (`react-icons/fi`) | Feather icon set |
| **Linting** | Oxlint | High-speed JavaScript/JSX static analysis |

---

## 3. System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Browser)"]
        UI[React UI Components]
        AuthCtx[Auth Context Provider]
        DBLib[Database Service Layer]
    end

    subgraph SupabasePlatform ["Supabase & Cloud Services"]
        SBAuth[Supabase Auth Engine]
        PostgREST[PostgREST API Engine]
    end

    subgraph PostgresDB ["PostgreSQL Database"]
        Profiles[public.profiles]
        Requests[public.service_requests]
        History[public.request_status_history]
        Triggers[Auth & Timestamp Triggers]
    end

    UI --> AuthCtx
    UI --> DBLib
    AuthCtx -->|Sign In / Sign Up| SBAuth
    DBLib -->|Queries / Mutations| PostgREST
    SBAuth -->|Auto-creates Profile via Trigger| Profiles
    PostgREST --> Profiles
    PostgREST --> Requests
    PostgREST --> History
    Requests -.->|Foreign Key Cascade| Profiles
    History -.->|Foreign Key Cascade| Requests
```

---

## 4. Project Structure

```text
Ecitizen-demo/
├── .env                              # Environment configuration (git-ignored)
├── .env.example                      # Sample configuration reference
├── .gitignore                        # Git ignore patterns
├── .oxlintrc.json                    # Oxlint linter configuration
├── index.html                        # Application entry HTML
├── package.json                      # Dependencies and npm scripts
├── prisma/
│   └── schema.prisma                 # Declarative database models (PostgreSQL)
├── public/                           # Static assets & icons
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.css                       # Global shell styling
│   ├── App.jsx                       # Master routing & layout provider
│   ├── index.css                     # Base browser reset
│   ├── main.jsx                      # React root renderer with BrowserRouter
│   ├── assets/                       # Static visual resources
│   ├── Components/
│   │   ├── Header/
│   │   │   ├── Header.css            # Navigation styling
│   │   │   └── Header.jsx            # Dynamic header with auth-state & RBAC
│   │   └── Footer/
│   │       ├── Footer.css
│   │       └── Footer.jsx
│   ├── context/
│   │   └── AuthContext.jsx           # Global authentication and session provider
│   ├── lib/
│   │   ├── database.js               # Service layer for Supabase CRUD & analytics
│   │   └── supabase.js               # Supabase JS client configuration
│   └── Pages/
│       ├── About/                    # Citizen portal information & standards
│       ├── Auth/                     # Citizen registration & login
│       ├── Dashboard/                # Citizen request submission & history
│       ├── Admin/                    # Role-guarded operational dashboard
│       ├── Home page/                # Hero, categories, features, and tracker
│       └── Service/                  # Service catalogue & guides
├── supabase/
│   └── schema.sql                    # Full PostgreSQL DDL, triggers & RLS scripts
└── vite.config.js                    # Vite bundler & build configuration
```

---

## 5. Database Design & Schema (Prisma & PostgreSQL)

### Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

model Profile {
  id         String           @id @db.Uuid
  email      String?          @unique
  fullName   String?          @map("full_name")
  phone      String?
  nationalId String?          @map("national_id")
  role       String           @default("citizen") // "citizen" | "admin"
  createdAt  DateTime         @default(now()) @map("created_at")
  updatedAt  DateTime         @default(now()) @updatedAt @map("updated_at")
  requests   ServiceRequest[]

  @@index([role])
  @@map("profiles")
}

model ServiceRequest {
  id              String                 @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  referenceNumber String?                @unique @map("reference_number")
  citizenId       String                 @map("citizen_id") @db.Uuid
  citizenName     String?                @map("citizen_name")
  citizenEmail    String?                @map("citizen_email")
  title           String?
  category        String
  location        String
  description     String
  imageUrl        String?                @map("image_url")
  priority        String                 @default("Medium") // "Low" | "Medium" | "High" | "Urgent"
  status          String                 @default("Pending") // "Pending" | "In Progress" | "Resolved"
  adminNote       String?                @map("admin_note")
  createdAt       DateTime               @default(now()) @map("created_at")
  updatedAt       DateTime               @default(now()) @updatedAt @map("updated_at")
  citizen         Profile                @relation(fields: [citizenId], references: [id], onDelete: Cascade)
  history         RequestStatusHistory[]

  @@index([citizenId])
  @@index([status])
  @@index([category])
  @@index([referenceNumber])
  @@map("service_requests")
}

model RequestStatusHistory {
  id        String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  requestId String         @map("request_id") @db.Uuid
  status    String         // "Pending" | "In Progress" | "Resolved"
  note      String?
  changedBy String?        @map("changed_by") @db.Uuid
  createdAt DateTime       @default(now()) @map("created_at")
  request   ServiceRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  @@index([requestId])
  @@map("request_status_history")
}
```

### Database Entities & Relations

```mermaid
erDiagram
    PROFILES ||--o{ SERVICE_REQUESTS : "submits"
    SERVICE_REQUESTS ||--o{ REQUEST_STATUS_HISTORY : "tracks"

    PROFILES {
        uuid id PK
        text email UK
        text full_name
        text phone
        text national_id
        text role "citizen | admin"
        timestamptz created_at
        timestamptz updated_at
    }

    SERVICE_REQUESTS {
        uuid id PK
        text reference_number UK
        uuid citizen_id FK
        text citizen_name
        text citizen_email
        text title
        text category
        text location
        text description
        text image_url
        text priority "Low | Medium | High | Urgent"
        text status "Pending | In Progress | Resolved"
        text admin_note
        timestamptz created_at
        timestamptz updated_at
    }

    REQUEST_STATUS_HISTORY {
        uuid id PK
        uuid request_id FK
        text status "Pending | In Progress | Resolved"
        text note
        uuid changed_by
        timestamptz created_at
    }
```

### Automated Triggers & Functions

Located in [`supabase/schema.sql`](file:///c:/Users/Jasper/Desktop/Ecitizen-demo/supabase/schema.sql):

1. **`on_auth_user_auto_confirm`**:
   - Executes `BEFORE INSERT` on `auth.users`.
   - Automatically populates `email_confirmed_at = now()` so users can authenticate immediately upon signup without forced email confirmation delays.
2. **`on_auth_user_created`**:
   - Executes `AFTER INSERT` on `auth.users` with `SECURITY DEFINER`.
   - Extracts metadata (`full_name`, `phone`, `national_id`, `role`) and automatically inserts/upserts a record into `public.profiles`.
3. **`set_profiles_updated_at` & `set_service_requests_updated_at`**:
   - Automatically bumps the `updated_at` column to `now()` on every row modification.

### Row-Level Security (RLS) & Permissions

- RLS is enabled on all tables: `profiles`, `service_requests`, and `request_status_history`.
- Full operational policies (`GRANT ALL ON TABLE ... TO anon, authenticated, service_role`) allow seamless public access for request tracking by reference number, citizen submission, and administrative status updates.

---

## 6. Role-Based Access Control (RBAC) & Security

The platform supports two distinct roles:

```mermaid
graph LR
    subgraph Roles
        Citizen[Citizen Account]
        Admin[County Admin Officer]
    end

    subgraph CitizenFeatures [Citizen Capabilities]
        C1[Register & Sign In]
        C2[Submit Service Requests with Photos]
        C3[View Personal Request History]
        C4[Track Status via Reference Number]
    end

    subgraph AdminFeatures [Admin Capabilities]
        A1[Restricted /admin Route Guard]
        A2[Manage Status: Pending -> In Progress -> Resolved]
        A3[Publish Official Resolution Notes]
        A4[Real-time Open vs. Resolved Analytics]
        A5[Department Workload Breakdown]
    end

    Citizen --> C1
    Citizen --> C2
    Citizen --> C3
    Citizen --> C4

    Admin --> A1
    Admin --> A2
    Admin --> A3
    Admin --> A4
    Admin --> A5
```

### Protection Mechanisms:
- **Public Signup Sanitization**: The signup form (`/register`) defaults all new accounts strictly to `citizen`. The administrative role selector has been removed from the public UI.
- **Route Guarding**: The `/admin` route evaluates `authLoading` and `user.role`. Non-admins or unauthenticated users receive a secure **Restricted Access** modal with a redirect to `/login?redirect=/admin`.
- **Navigation Privacy**: The `Admin` header tab is hidden unless `user.role === 'admin'`.
- **Database Verification**: User roles are verified against the database profile row (`profiles.role`) rather than easily tampered client-side storage.

---

## 7. Core Platform Features & Workflows

### Citizen Registration & Authentication
- **Routes**: `/login` (Sign In) and `/register` (Sign Up).
- **Process**: Users provide Name, Email, Phone, optional National ID, and Password. Account is created in Supabase Auth, verified, and mapped to `public.profiles`.
- **Session Persistence**: Sessions are synchronized with `localStorage` (`huduma_active_session_v2`) and Supabase Auth `onAuthStateChange`.

### Service Request Submission & Image Compression
- **Route**: `/dashboard` or `/submit-request`.
- **Categories Available**:
  - Broken Streetlight
  - Water & Sanitation
  - Garbage Collection
  - Roads & Transport
  - Drainage & Sewerage
  - Business Permits
  - Birth Certificate & ID
  - Land Services
  - Public Complaint
- **Client-Side Image Optimization**:
  - The `compressImageFile` utility uses an HTML5 Canvas to scale large mobile/camera photos (up to several megabytes) down to `maxWidth = 1000px` at `0.78` JPEG quality.
  - Generates lightweight Base64 data strings (~60–90 KB) that store reliably without exceeding request limits.

### Live Request Tracking & Lifecycle
- **Routes**: `/track-request` and Home Page Tracking widget.
- **Reference Numbers**: Generated systematically as `PSR{YEAR}{SEQUENCE}` (e.g., `PSR2026001`).
- **Progress Stepper**:
  1. **Pending**: Case logged and awaiting review.
  2. **In Progress**: Dispatched to field maintenance teams.
  3. **Resolved**: Work inspected and marked complete with official closure notes.

### Administrator Dashboard & Case Queue
- **Route**: `/admin` (Protected).
- **Queue Controls**:
  - Filter by Category and Status (`All`, `Pending`, `In Progress`, `Resolved`).
  - Search by reference number, citizen name, location, or keyword.
  - One-click status advancement buttons.
  - Detailed case drawer to attach official administrative remarks and view photo evidence.

### Resolution Analytics & Department Metrics
- **KPI Metrics**: Total Requests, Open Cases (`Pending + In Progress`), Resolved Cases, and Overall Resolution Rate percentage.
- **Visual Analytics**:
  - Proportional stacked status bar showing open vs. resolved distribution.
  - Department workload breakdown highlighting case volume per category.

---

## 8. Data Access Layer (`src/lib/database.js`)

All database communications are centralized in [`src/lib/database.js`](file:///c:/Users/Jasper/Desktop/Ecitizen-demo/src/lib/database.js):

| Exported Function | Signature | Description |
|---|---|---|
| `fetchServiceRequests` | `async () => Array` | Fetches all real requests with their status history audit logs from Supabase. |
| `createServiceRequest` | `async (payload) => Object` | Validates user, generates UUID & Reference code, inserts into `service_requests` & `request_status_history`. |
| `updateServiceRequestStatus` | `async (payload) => Object` | Updates `status` and `admin_note` in `service_requests` and appends a record in `request_status_history`. |
| `findRequestByReference` | `async (ref) => Object\|null` | Performs an exact-match lookup on reference numbers or UUIDs. |
| `calculateAnalytics` | `(requests) => Object` | Computes live KPI counts, open/resolved percentages, and category distributions. |
| `compressImageFile` | `(file, maxWidth, quality) => Promise<string>` | Downscales device photos on an in-memory canvas. |
| `ensureSupabaseProfile` | `async (user) => Object` | Upserts `public.profiles` to ensure relational integrity on request creation. |

---

## 9. Application Routing & Navigation

Defined in [`src/App.jsx`](file:///c:/Users/Jasper/Desktop/Ecitizen-demo/src/App.jsx):

| Path | Component | Guard / Access Level | Description |
|---|---|---|---|
| `/` | `Home` | Public | Hero, Service Directory highlights, Process Stepper, Quick Tracker |
| `/services` | `Services` | Public | Filterable catalogue of public services and requirements |
| `/track-request` | `Tracker` | Public | Real-time status tracker by reference code |
| `/login` | `AuthPage (signin)` | Public | Citizen and Administrator login |
| `/register` | `AuthPage (signup)` | Public | Citizen registration form |
| `/dashboard` | `CitizenDashboard` | Authenticated (Citizen/Admin) | Submit requests, view history & active tracking |
| `/submit-request` | `CitizenDashboard` | Authenticated (Citizen/Admin) | Alias for request creation |
| `/admin` | `AdminDashboard` | **Admin Only (`role === 'admin'`)** | Operations queue, status updates & analytics |
| `/about` | `AboutPage` | Public | Public service portal standards and commitments |

---

## 10. Environment Variables & Setup Guide

### 1. Environment File Configuration (`.env`)

Create a `.env` file in the project root:

```env
# Supabase Frontend Credentials
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-publishable-or-anon-key"

# Prisma PostgreSQL Connection Strings (Supabase Session Pooler)
POSTGRES_PRISMA_URL="postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
POSTGRES_URL_NON_POOLING="postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

> **Important**: Always use the **Session Pooler** (port `5432`) or **Transaction Pooler** (port `6543`) URI from your Supabase dashboard to support IPv4 networks.

### 2. Local Installation & Startup

```bash
# Install dependencies
npm install

# Push Prisma schema to Supabase PostgreSQL
npx prisma db push

# Apply schema triggers, functions, and RLS policies
npx prisma db execute --file supabase/schema.sql --schema prisma/schema.prisma

# Start local development server
npm run dev
```

---

## 11. Troubleshooting & FAQs

### Q: Why did Supabase return `401 Unauthorized` on `/rest/v1/profiles`?
**A**: This occurs if Supabase requires email verification before granting an authenticated session token, causing the client to insert under the `anon` role. In `supabase/schema.sql`, we implemented the `on_auth_user_auto_confirm` trigger and granted explicit `ALL` permissions to `anon` and `authenticated` roles to eliminate this error.

### Q: Why did `service_requests` reject inserts with `null value in column "id"`?
**A**: Prisma's `@default(uuid())` generates IDs inside the Prisma Client engine, but direct Supabase REST calls require the database itself to generate the default. We updated both `prisma/schema.prisma` and PostgreSQL column definitions to use `@default(dbgenerated("gen_random_uuid()"))`.

### Q: How do I create a new Administrator?
**A**: Run the following in your Supabase SQL editor or via `prisma db execute`:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'officer@example.com';
```

---

*Documentation maintained by the development team. For inquiries, refer to the repository issue tracker.*
