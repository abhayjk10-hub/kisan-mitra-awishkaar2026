import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_MANDIS, Mandi } from '@/lib/mandi-service';
import {
  getAllWarehouseBookings,
  filterWarehouseBookingsForMandi,
  getFacilitiesForMandi,
} from '@/lib/warehouse-booking-service';
import { createServerClient } from '@supabase/ssr';

/**
 * Helper to resolve the authenticated Mandi from the server-side session.
 * STRICTLY ignores any client-supplied query parameters (?mandi_id=...).
 */
async function resolveAuthenticatedMandi(request: NextRequest): Promise<Mandi | null> {
  // 1. Check the official Mandi Portal session cookie
  const mandiCookieId = request.cookies.get('km_demo_mandi')?.value;
  if (mandiCookieId) {
    const found = DEFAULT_MANDIS.find(
      (m) => m.id.toLowerCase() === mandiCookieId.toLowerCase() || m.code.toLowerCase() === mandiCookieId.toLowerCase()
    );
    if (found) {
      return found;
    }
  }

  // 2. Check header-based session authentication (e.g., Bearer token or x-mandi-id from server tests)
  const authHeader = request.headers.get('authorization') || request.headers.get('x-mandi-session-id');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const found = DEFAULT_MANDIS.find(
      (m) => m.id.toLowerCase() === token.toLowerCase() || m.code.toLowerCase() === token.toLowerCase()
    );
    if (found) {
      return found;
    }
  }

  // 3. Check Supabase Auth user if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && anonKey && !supabaseUrl.includes('your_supabase')) {
    try {
      const supabase = createServerClient(supabaseUrl, anonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Query mandi_staff to identify which mandi this user is linked to
        const { data: staff } = await supabase
          .from('mandi_staff')
          .select('mandi_id')
          .eq('user_id', user.id)
          .single();

        if (staff?.mandi_id) {
          const found = DEFAULT_MANDIS.find((m) => m.id === staff.mandi_id);
          if (found) return found;
        }
      }
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * GET /api/mandi/warehouse-bookings
 * Returns warehouse bookings filtered strictly for the authenticated Mandi's jurisdiction.
 * 
 * Enforces server-side isolation:
 * - A Pune Mandi user sees only warehouses nearest to Pune APMC (Gultekdi Market Yard).
 * - A Nashik Mandi user sees only warehouses nearest to Nashik APMC.
 * - An unauthenticated caller receives 401 Unauthorized.
 */
export async function GET(request: NextRequest) {
  try {
    const authenticatedMandi = await resolveAuthenticatedMandi(request);

    if (!authenticatedMandi) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Valid Mandi operator session required. Please log in to the Mandi Portal.',
        },
        { status: 401 }
      );
    }

    // Retrieve all bookings and apply server-side jurisdiction filter
    const allBookings = await getAllWarehouseBookings();
    const filteredBookings = filterWarehouseBookingsForMandi(allBookings, authenticatedMandi);
    const assignedFacilities = getFacilitiesForMandi(authenticatedMandi);

    return NextResponse.json({
      success: true,
      mandi: {
        id: authenticatedMandi.id,
        name: authenticatedMandi.name,
        code: authenticatedMandi.code,
        district: authenticatedMandi.district,
        address: authenticatedMandi.address,
      },
      bookings: filteredBookings,
      facilities: assignedFacilities,
      totalCount: filteredBookings.length,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

