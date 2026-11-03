import { createBrowserClient } from '@supabase/ssr';

export const hasValidSupabaseConfig = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
      /^https?:\/\//i.test(url) &&
      !url.includes('example.supabase.co') &&
      !url.includes('your_supabase_project_url_here') &&
      key &&
      key.length > 20 &&
      !key.includes('demo-anon-key-placeholder') &&
      !key.includes('your_supabase_anon_key_here')
  );
};

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createBrowserClient(url, key);
}
