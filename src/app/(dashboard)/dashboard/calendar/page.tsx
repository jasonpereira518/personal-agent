import { GlassCard } from "@/components/shared/glass-card"
import { Calendar } from "lucide-react"

export default function CalendarPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassCard
        title="Calendar"
        icon={<Calendar className="h-4 w-4 text-[#7F77DD]" />}
        phase={3}
        className="max-w-md w-full"
      >
        <p className="text-sm text-muted-foreground">
          Full calendar view with Google Calendar sync, event creation, and
          scheduling — coming in Phase 3.
        </p>
      </GlassCard>
    </div>
  )
}
