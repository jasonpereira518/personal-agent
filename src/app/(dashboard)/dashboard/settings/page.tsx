import { GlassCard } from "@/components/shared/glass-card"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassCard
        title="Settings"
        icon={<Settings className="h-4 w-4 text-[#7F77DD]" />}
        phase={2}
        className="max-w-md w-full"
      >
        <p className="text-sm text-muted-foreground">
          Account preferences, integrations, notification settings, and theme
          configuration — coming in Phase 2.
        </p>
      </GlassCard>
    </div>
  )
}
