import { GlassCard } from "@/components/shared/glass-card"
import { Briefcase } from "lucide-react"

export default function ApplicationsPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassCard
        title="Applications"
        icon={<Briefcase className="h-4 w-4 text-[#7F77DD]" />}
        phase={5}
        className="max-w-md w-full"
      >
        <p className="text-sm text-muted-foreground">
          Fellowship and internship pipeline — track status, deadlines, and
          contacts for every opportunity in flight — coming in Phase 5.
        </p>
      </GlassCard>
    </div>
  )
}
