import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yvhikjqcvowhpxqvkbfx.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key";
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

let client: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return !!(
    supabaseUrl &&
    supabaseUrl.includes("supabase.co") &&
    supabaseAnonKey &&
    !supabaseAnonKey.includes("dummy_anon_key")
  );
}

export function getSupabase(): SupabaseClient {
  if (client) return client;
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
  return client;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;
  adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return adminClient;
}

export const supabase = getSupabase();
export const supabaseAdmin = getSupabaseAdmin();
