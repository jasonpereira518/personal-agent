import { GlassCard } from "@/components/shared/glass-card"
import { Flag } from "lucide-react"

export default function GoalsPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassCard
        title="Goals"
        icon={<Flag className="h-4 w-4 text-[#7F77DD]" />}
        phase={6}
        className="max-w-md w-full"
      >
        <p className="text-sm text-muted-foreground">
          Yearly, monthly, and weekly goals with milestones, progress tracking,
          and linked tasks — coming in Phase 6.
        </p>
      </GlassCard>
    </div>
  )
}
