import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Service role client — bypasses RLS.
// ONLY use in /api/capture and lib/seed. Never in Server Components or Actions.
// Intentionally untyped: the service role bypasses all type-safe RLS guards anyway.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}
