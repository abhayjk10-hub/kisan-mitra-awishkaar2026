import { describe, it, expect } from 'vitest';
import { hasValidSupabaseConfig } from '@/lib/supabase/client';
import { loginMandi } from '@/lib/mandi-service';

describe('Authentication & Security Audit (Section C)', () => {
  it('hasValidSupabaseConfig rejects missing, placeholder, or invalid keys', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      expect(hasValidSupabaseConfig()).toBe(false);

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your_supabase_project_url_here.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'your_supabase_anon_key_here';
      expect(hasValidSupabaseConfig()).toBe(false);

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://valid-project-id.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_valid_long_anon_key_for_testing';
      expect(hasValidSupabaseConfig()).toBe(true);
    } finally {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    }
  });

  it('loginMandi requires a password and rejects missing password', async () => {
    const result = await loginMandi('APMC-PUN-01');
    expect(result.session).toBeNull();
    expect(result.error).toMatch(/password is required/i);
  });

  it('loginMandi rejects empty identifier', async () => {
    const result = await loginMandi('  ', 'somepassword');
    expect(result.session).toBeNull();
    expect(result.error).toMatch(/required/i);
  });
});
