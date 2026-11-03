import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const hasValidSupabaseConfig = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
      /^https?:\/\//i.test(url) &&
      !url.includes('your_supabase_project_url_here') &&
      key &&
      key.length > 20 &&
      !key.includes('your_supabase_anon_key_here')
  );
};

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if middleware is refreshing sessions.
        }
      },
    },
  });
}
