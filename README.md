# Kisan Mitra — Awishkaar

Farmer Procurement Queue & APMC Slot Booking System (Educational & Demo Initiative)

## Overview

Kisan Mitra is an intelligent agricultural procurement queue management, slot booking, and price discovery platform built with Next.js 16, React 19, Tailwind CSS, and Supabase. It supports five languages: English (en), हिंदी (hi), मराठी (mr), ਪੰਜਾਬੀ (pa), and ગુજરાતી (gu).

> **Disclaimer**: This is a prototype and demonstration system developed for educational and hackathon purposes. Government schemes, MSP rates, and APMC yard listings are presented for demonstration and workflow modeling only.

---

## Setup & Local Development

### 1. Clone & Install
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the required keys:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `DATA_GOV_API_KEY` (from [data.gov.in](https://data.gov.in/) for live market prices)
- `OPENAI_API_KEY` (for Sahayak AI chatbot grounding)
- `GOOGLE_SCRIPT_URL` (for contact form Google Sheets integration)
- `NEXT_PUBLIC_DEMO_MODE=false` (set to `true` only for offline/demo presentations)

### 3. Supabase Migrations
All database schemas, tables, constraints, and Row-Level Security (RLS) rules are managed as idempotent SQL files under `supabase/migrations/`. Execute them in the Supabase SQL Editor in the following order:

1. `supabase/migrations/20261009_initial_schema.sql`
   - Creates `farmers`, `mandis`, `slot_bookings`, `farmer_delays`, and `contact_submissions` tables.
2. `supabase/migrations/20261103_security_and_rls_hardening.sql`
   - Establishes strict Row-Level Security (RLS) ownership rules.
   - Creates the `mandi_staff(user_id, mandi_id)` link table.
   - Adds `updated_at` triggers and masked view `mandi_queue_masked_view`.
3. `supabase/migrations/20261103_book_slot_capacity_and_token.sql`
   - Atomic `book_slot(...)` stored procedure enforcing slot capacity under lock.
   - Sequential token generation using Mandi code.
   - Unique constraints preventing duplicate active bookings for the same phone/mandi/date and vehicle/slot window.
   - Atomic `cancel_farmer_slot(...)` procedure with 1-day advance validation and automatic waitlist promotion.

### 4. Run Locally
```bash
npm run dev
```

### 5. Running Tests
```bash
npm test
```

---

## Supported Languages
- English (`en`)
- हिंदी (`hi`)
- मराठी (`mr`)
- ਪੰਜਾਬੀ (`pa`)
- ગુજરાતી (`gu`)

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # Secure API route handlers (chat, contact)
│   ├── config-error/       # Missing environment configuration screen
│   ├── mandi/              # Mandi operator dashboard & login
│   ├── mandi-prices/       # Live APMC commodity price charts
│   ├── slot-booking/       # Farmer 30-minute unloading slot booking
│   ├── login/              # Farmer Supabase Auth (Phone OTP & Password)
│   └── contact/            # Support and grievance submission
├── components/
│   ├── auth/               # LoginForm, RegisterForm, ForgotPasswordFlow
│   ├── contact/            # ContactForm
│   └── shared/             # Reusable UI cards, Navbar, Marquee, Footer
├── contexts/
│   ├── AuthContext.tsx     # Supabase Auth session provider
│   ├── LanguageContext.tsx # 5-language i18n context
│   └── TokenContext.tsx    # Live Realtime farmer token tracker
├── lib/
│   ├── date-utils.ts       # IST (Asia/Kolkata) date helpers
│   ├── rate-limiter.ts     # In-memory sliding window rate limiter
│   ├── msp-config.ts       # Centralized CACP Minimum Support Prices
│   ├── mandi-service.ts    # Mandi operations, queues, cancellations
│   ├── supabase/           # Browser & server Supabase clients
│   └── translations/       # Multi-lingual dictionary strings
└── types/                  # Shared TypeScript interfaces
```
