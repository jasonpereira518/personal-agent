import { GlassCard } from "@/components/shared/glass-card"
import { BookOpen } from "lucide-react"

export default function JournalPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassCard
        title="Journal"
        icon={<BookOpen className="h-4 w-4 text-[#7F77DD]" />}
        phase={6}
        className="max-w-md w-full"
      >
        <p className="text-sm text-muted-foreground">
          Daily journaling with prompts, mood tracking, and AI-powered
          reflection summaries — coming in Phase 6.
        </p>
      </GlassCard>
    </div>
  )
}
