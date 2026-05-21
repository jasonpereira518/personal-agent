import { createServerClient } from "@supabase/ssr"
import { auth } from "@clerk/nextjs/server"
import { cookies } from "next/headers"
import { type Database } from "./types"

export async function createClient() {
  const cookieStore = await cookies()
  const { getToken } = await auth()
  const supabaseToken = await getToken({ template: "supabase" })

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: supabaseToken
          ? { Authorization: `Bearer ${supabaseToken}` }
          : {},
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — session refresh handled by middleware
          }
        },
      },
    }
  )
}
