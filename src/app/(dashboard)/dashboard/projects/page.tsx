import { GlassCard } from "@/components/shared/glass-card"
import { FolderKanban } from "lucide-react"

export default function ProjectsPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassCard
        title="Projects"
        icon={<FolderKanban className="h-4 w-4 text-[#7F77DD]" />}
        phase={5}
        className="max-w-md w-full"
      >
        <p className="text-sm text-muted-foreground">
          Project kanban boards, milestone tracking, and next-action management
          for all active projects — coming in Phase 5.
        </p>
      </GlassCard>
    </div>
  )
}
