import { GlassCard } from "@/components/shared/glass-card"
import { Repeat } from "lucide-react"

export default function HabitsPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassCard
        title="Habits"
        icon={<Repeat className="h-4 w-4 text-[#7F77DD]" />}
        phase={6}
        className="max-w-md w-full"
      >
        <p className="text-sm text-muted-foreground">
          Daily habit tracking with streaks, completion heatmaps, and weekly
          review — coming in Phase 6.
        </p>
      </GlassCard>
    </div>
  )
}
