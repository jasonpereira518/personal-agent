import { GlassCard } from "@/components/shared/glass-card"
import { GraduationCap } from "lucide-react"

export default function AcademicsPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassCard
        title="Academics"
        icon={<GraduationCap className="h-4 w-4 text-[#7F77DD]" />}
        phase={4}
        className="max-w-md w-full"
      >
        <p className="text-sm text-muted-foreground">
          Course tracking, GPA calculator, assignment due dates, and semester
          planning — coming in Phase 4.
        </p>
      </GlassCard>
    </div>
  )
}
