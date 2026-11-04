import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/officers/register
 * 
 * Secure Server-Side Officer Registration Endpoint
 * 
 * WHY A SERVER ROUTE IS MANDATORY:
 * 1. Creating confirmed Supabase Auth users directly (bypassing confirmation emails
 *    for official agricultural market personnel) requires `supabase.auth.admin.createUser()`.
 * 2. The `auth.admin` API strictly requires the `SUPABASE_SERVICE_ROLE_KEY`.
 * 3. The Service Role key bypasses Row Level Security and must NEVER be exposed
 *    in client-side code or browser bundles. Running this in a Next.js Server Route
 *    keeps the Service Role key secure in environment variables.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      full_name,
      contact_number,
      batch_id,
      officer_id,
      email,
      password = 'Demo@12345',
    } = body;

    // 1. Validation
    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Full name must be at least 3 characters long.' },
        { status: 400 }
      );
    }
    if (!contact_number || typeof contact_number !== 'string' || contact_number.trim().length < 8) {
      return NextResponse.json(
        { success: false, error: 'A valid contact phone number is required.' },
        { status: 400 }
      );
    }
    if (!batch_id || typeof batch_id !== 'string' || batch_id.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'A valid inspection batch ID is required (e.g. APMC-B01).' },
        { status: 400 }
      );
    }

    const cleanOfficerId = (officer_id || `OFF-${Math.floor(100 + Math.random() * 900)}`)
      .trim()
      .toUpperCase();
    const cleanEmail = (
      email || `${cleanOfficerId.toLowerCase().replace(/[^a-z0-9]/g, '')}@apmc-demo.local`
    )
      .trim()
      .toLowerCase();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      // In environment where service role key is not yet configured, provide structured response
      return NextResponse.json(
        {
          success: false,
          error:
            'SUPABASE_SERVICE_ROLE_KEY is required for admin user creation. Please configure it in .env.local to execute Supabase Auth admin calls.',
          fallbackAllowed: true,
        },
        { status: 503 }
      );
    }

    // 2. Initialize Privileged Supabase Admin Client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 3. Create Auth User using Supabase Auth Admin API
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        officer_id: cleanOfficerId,
        full_name: full_name.trim(),
        contact_number: contact_number.trim(),
        batch_id: batch_id.trim(),
      },
    });

    if (authError || !authUser?.user) {
      // Check if user already exists
      if (authError?.message?.includes('already registered')) {
        return NextResponse.json(
          {
            success: false,
            error: `An officer with email '${cleanEmail}' is already registered in Supabase Auth.`,
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: authError?.message || 'Failed to create officer auth account.' },
        { status: 500 }
      );
    }

    // 4. Insert Profile Row in public.officers table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('officers')
      .upsert(
        {
          id: authUser.user.id,
          officer_id: cleanOfficerId,
          full_name: full_name.trim(),
          contact_number: contact_number.trim(),
          batch_id: batch_id.trim(),
          created_at: new Date().toISOString(),
        },
        { onConflict: 'officer_id' }
      )
      .select('*')
      .single();

    if (profileError) {
      console.error('[API /api/officers/register] Profile row insert error, rolling back auth user:', profileError);
      // Rollback orphaned auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      } catch (rollbackErr) {
        console.error('[API /api/officers/register] Rollback failed:', rollbackErr);
      }

      return NextResponse.json(
        {
          success: false,
          error: `Failed to create officer profile in public.officers: ${profileError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      officer: {
        id: profile.id,
        officer_id: profile.officer_id,
        full_name: profile.full_name,
        contact_number: profile.contact_number,
        batch_id: profile.batch_id,
        email: cleanEmail,
        created_at: profile.created_at,
      },
    });
  } catch (err: unknown) {
    console.error('[API /api/officers/register] Uncaught exception:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal server error occurred.',
      },
      { status: 500 }
    );
  }
}

