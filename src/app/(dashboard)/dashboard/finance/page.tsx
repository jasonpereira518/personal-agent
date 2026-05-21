import { GlassCard } from "@/components/shared/glass-card"
import { Wallet } from "lucide-react"

export default function FinancePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassCard
        title="Finance"
        icon={<Wallet className="h-4 w-4 text-[#7F77DD]" />}
        phase={4}
        className="max-w-md w-full"
      >
        <p className="text-sm text-muted-foreground">
          Net worth tracking, Plaid bank sync, budgets, and spending analytics
          — coming in Phase 4.
        </p>
      </GlassCard>
    </div>
  )
}
