import { GlassCard } from "@/components/shared/glass-card"
import { Heart } from "lucide-react"

export default function HealthPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassCard
        title="Health"
        icon={<Heart className="h-4 w-4 text-[#7F77DD]" />}
        phase={7}
        className="max-w-md w-full"
      >
        <p className="text-sm text-muted-foreground">
          Sleep, nutrition, workout, and wellness tracking with Apple Health
          integration — coming in Phase 7.
        </p>
      </GlassCard>
    </div>
  )
}
