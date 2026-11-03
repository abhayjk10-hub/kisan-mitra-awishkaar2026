# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary User:** Indian farmers seeking to sell harvest produce at Agricultural Produce Market Committee (APMC) mandis, accessing the portal primarily via mobile web browsers.
- **Secondary Users:** Mandi administrators, transporters, and agricultural traders coordinating crop procurement, slot scheduling, and delivery logistics.
*(Inferred from repository documentation, farmer profile schema, and route definitions)*

## Product Purpose

Kisan Mitra ("किसान मित्र" — SIH26032) is a Farmer Procurement Queue & Status System designed to reduce waiting times, eliminate physical bottlenecks at APMC mandis, and provide transparent, real-time commodity pricing from official Government of India data sources. Success means a farmer can book a procurement slot with a single verified token, track queue status in their local language, and make informed market decisions before transport.

## Positioning

A verified, government-aligned procurement workflow that couples digital token queue booking with live `data.gov.in` mandi prices and local-language accessibility (Hindi, Marathi, Punjabi, Gujarati, and English), preventing price manipulation and eliminating unorganized physical mandi queues.

## Operating Context

- **Usage Environment:** Often accessed on mobile phones under varied rural lighting conditions, fluctuating mobile network quality (3G/4G), and by users with varying digital literacy.
- **Core Workflows:**
  - Phone OTP sign-in / registration using mobile number, village, district, state, and land plot ID.
  - Digital slot booking for harvest delivery queues.
  - Live mandi price tracking across commodities and regional markets.
  - Haulage and transport cost estimation.
  - Multilingual AI chat advisory for market navigation.

## Capabilities and Constraints

- **Technical Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Motion (`motion`), and Supabase SSR (`@supabase/supabase-js`, `@supabase/ssr`).
- **Data Integrations:** Live Government of India market data feed via `data.gov.in` API with fallback connection states; Supabase database with Row Level Security (RLS) policies for farmer profiles.
- **Language Support:** Full translation coverage for English (`en`), Hindi (`hi`), Marathi (`mr`), Punjabi (`pa`), and Gujarati (`gu`).
- **Scope Constraint:** Zero modifications to existing business logic or database schemas without explicit instruction; UI refinements must remain mobile-first and high-contrast.

## Brand Commitments

- **Name:** Kisan Mitra (Farmer's Friend / किसान मित्र).
- **Voice:** Respectful, trustworthy, clear, and utilitarian. Free of unnecessary tech jargon.
- **Identity Assets:** Government of India initiative badges, agricultural motifs, clean data cards, and intuitive queue status tokens.

## Evidence on Hand

- **README Documentation:** Defined in `README.md` under Smart India Hackathon initiative SIH26032.
- **Database Schema:** `farmers` table with land plot verification, `contact_submissions` table in Supabase.
- **Translation Dictionaries:** Fully populated in `src/lib/translations/` (`index.ts`, `mr.ts`, `pa.ts`, `gu.ts`).
- **Market Service:** Live fetching logic implemented in `src/lib/mandi-price-service.ts` and `src/lib/transport-calculator.ts`.

## Product Principles

1. **Utility First:** Prioritize fast access to queue tokens, arrival status, and market prices over decorative visual noise.
2. **Native Language Respect:** Every user-facing UI element must render clearly across Devanagari, Gurmukhi, and Gujarati scripts without layout breakage.
3. **Resilience & Honesty:** When external market data is disconnected or offline, state the connection status plainly without fabricating numbers or misleading the farmer.
4. **Accessible Under the Sun:** Maintain high contrast, large touch targets, and legible typography suitable for bright daylight mobile viewing.

## Accessibility & Inclusion

- Multi-lingual font support with generous line-heights for non-Latin scripts.
- WCAG AA contrast standards for critical status tags (tokens, queue numbers, price changes).
- Minimum 48px touch targets for mobile usability in field conditions.

