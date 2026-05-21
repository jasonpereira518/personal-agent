import { createClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"
import { GlassCard } from "@/components/shared/glass-card"
import { Settings, Key, Smartphone } from "lucide-react"
import { CaptureSecretCard } from "./_components/capture-secret-card"
import { DeviceTokensCard } from "./_components/device-tokens-card"

async function getPreferences() {
  try {
    const { userId } = await auth()
    if (!userId) return null
    const db = await createClient()
    const { data } = await db
      .from("users_profile")
      .select("preferences")
      .eq("user_id", userId)
      .maybeSingle()
    return data?.preferences as Record<string, unknown> | null
  } catch {
    return null
  }
}

export default async function SettingsPage() {
  const prefs = await getPreferences()
  const captureSecret = prefs?.capture_secret as string | undefined
  const deviceTokens = (prefs?.device_tokens ?? {}) as Record<
    string,
    {
      label: string
      created_at: string
      last_used_at: string | null
      is_revoked: boolean
    }
  >

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-medium text-lg">Settings</h1>

      <CaptureSecretCard secret={captureSecret ?? null} />
      <DeviceTokensCard tokens={deviceTokens} />

      <GlassCard
        title="More settings"
        icon={<Settings className="h-4 w-4 text-[#7F77DD]" />}
        phase={3}
      >
        <p className="text-sm text-muted-foreground">
          Notification preferences, integrations, and account settings — coming
          in Phase 3.
        </p>
      </GlassCard>
    </div>
  )
}
