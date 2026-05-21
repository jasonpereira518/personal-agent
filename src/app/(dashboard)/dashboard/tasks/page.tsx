import { GlassCard } from "@/components/shared/glass-card"
import { CheckSquare } from "lucide-react"

export default function TasksPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassCard
        title="Tasks"
        icon={<CheckSquare className="h-4 w-4 text-[#7F77DD]" />}
        phase={2}
        className="max-w-md w-full"
      >
        <p className="text-sm text-muted-foreground">
          Full task management with Apple Reminders sync, priorities, projects,
          and natural-language input — coming in Phase 2.
        </p>
      </GlassCard>
    </div>
  )
}
