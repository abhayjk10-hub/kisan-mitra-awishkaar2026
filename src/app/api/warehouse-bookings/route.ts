import { NextRequest, NextResponse } from 'next/server';
import {
  createWarehouseBooking,
  getAllWarehouseBookings,
  validateWarehouseBookingInput,
} from '@/lib/warehouse-booking-service';
import { CreateWarehouseBookingInput } from '@/types/warehouse';

/**
 * POST /api/warehouse-bookings
 * Creates a new warehouse storage slot allocation for a farmer.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateWarehouseBookingInput;

    const validation = validateWarehouseBookingInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const result = await createWarehouseBooking(body);
    if (!result.success || !result.booking) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create warehouse booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, booking: result.booking }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Invalid request payload' },
      { status: 400 }
    );
  }
}

/**
 * GET /api/warehouse-bookings
 * Retrieves all registered warehouse bookings.
 */
export async function GET() {
  try {
    const bookings = await getAllWarehouseBookings();
    return NextResponse.json({ success: true, bookings });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to retrieve bookings' },
      { status: 500 }
    );
  }
}

