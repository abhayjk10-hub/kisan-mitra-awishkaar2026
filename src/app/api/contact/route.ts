import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

const GOOGLE_SCRIPT_URL =
  process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

// Rate limit: 5 submissions per IP per hour (3600s)
const CONTACT_RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 3600;

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting (H13)
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`contact:${ip}`, CONTACT_RATE_LIMIT, RATE_LIMIT_WINDOW);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit exceeded. Maximum ${CONTACT_RATE_LIMIT} submissions allowed per hour. Please try again in ${rateCheck.resetSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.resetSeconds),
          },
        }
      );
    }

    const body = await req.json();
    const { farmerName, mobile, messageType, message } = body;

    // 2. Field existence validation
    if (!farmerName || !mobile || !messageType || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required.' },
        { status: 400 }
      );
    }

    const cleanName = String(farmerName).trim();
    const cleanMsg = String(message).trim();
    const cleanType = String(messageType).trim();

    // 3. Length capping (H13)
    if (cleanName.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Farmer name must not exceed 100 characters.' },
        { status: 400 }
      );
    }

    if (cleanMsg.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Message must not exceed 1000 characters.' },
        { status: 400 }
      );
    }

    // 4. Mobile number format validation (H13)
    // Standard Indian mobile number: 10 digits starting with 6, 7, 8, or 9
    const digitsOnly = String(mobile).replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mobile number. Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    if (!GOOGLE_SCRIPT_URL) {
      console.error('[Contact API] GOOGLE_SCRIPT_URL environment variable is missing.');
      return NextResponse.json(
        { success: false, error: 'Contact service configuration error: missing GOOGLE_SCRIPT_URL.' },
        { status: 500 }
      );
    }

    const cleanedMobile = `+91${digitsOnly}`;

    const payload = {
      farmerName: cleanName,
      mobile: cleanedMobile,
      messageType: cleanType,
      message: cleanMsg,
      submittedAt: new Date().toISOString(),
    };

    // 5. Post server-side to Google Apps Script (writes directly to user's Google Sheet)
    let sheetSaved = false;
    let sheetUrl: string | null = null;
    try {
      const gRes = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });

      if (gRes.ok) {
        sheetSaved = true;
        try {
          const gData = await gRes.json();
          if (gData && gData.spreadsheetUrl) {
            sheetUrl = gData.spreadsheetUrl;
          }
        } catch {
          // Response was ok but not JSON or already consumed
        }
      }
    } catch (gErr: unknown) {
      console.error('[Contact API] Failed to push to Google Apps Script:', gErr);
    }

    // 6. Dual-save to Supabase if available
    let dbSaved = false;
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('contact_submissions').insert({
        farmer_name: payload.farmerName,
        mobile_number: payload.mobile,
        message_type: payload.messageType,
        message: payload.message,
      });
      if (!error) dbSaved = true;
    } catch {
      // Supabase is optional fallback
    }

    return NextResponse.json({
      success: true,
      sheetSaved,
      sheetUrl,
      dbSaved,
      message: 'Your submission has been recorded successfully.',
    });
  } catch (error: unknown) {
    console.error('[Contact API] Unhandled error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request.' },
      { status: 500 }
    );
  }
}
