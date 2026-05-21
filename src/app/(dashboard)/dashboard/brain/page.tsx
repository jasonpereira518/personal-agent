import { GlassCard } from "@/components/shared/glass-card"
import { Brain } from "lucide-react"

export default function BrainPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassCard
        title="Brain"
        icon={<Brain className="h-4 w-4 text-[#7F77DD]" />}
        phase={8}
        className="max-w-md w-full"
      >
        <p className="text-sm text-muted-foreground">
          Personal knowledge graph, AI memory, semantic search, and chat with
          your captured notes — coming in Phase 8.
        </p>
      </GlassCard>
    </div>
  )
}
