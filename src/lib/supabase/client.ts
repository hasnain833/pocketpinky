import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

function isValidSupabaseUrl(url: string | undefined): url is string {
  if (!url?.trim()) return false;
  const u = url.trim();
  return u.startsWith("https://") || u.startsWith("http://");
}

export function createClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!isValidSupabaseUrl(supabaseUrl) || !supabaseAnonKey) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
