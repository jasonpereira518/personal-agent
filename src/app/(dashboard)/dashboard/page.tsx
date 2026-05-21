import { Greeting } from "@/components/shared/greeting"
import { GlassCard } from "@/components/shared/glass-card"
import { SemesterWeek } from "@/components/shared/semester-week"
import {
  Target,
  Clock,
  Repeat,
  Inbox,
  FolderKanban,
  LayoutGrid,
  Wallet,
  Flag,
  Briefcase,
  CalendarDays,
} from "lucide-react"

const ic = "h-4 w-4 text-[#7F77DD]"

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* ── Row 1: Top bar ──────────────────────────────────────── */}
      <div className="col-span-12 flex items-center justify-between py-2">
        <Greeting />
        <div className="flex items-center gap-4">
          <SemesterWeek />
          <span className="font-mono text-sm text-muted-foreground">
            72°F · Arlington
          </span>
        </div>
      </div>

      {/* ── Row 2: Left column (4 cols) ─────────────────────────── */}
      <div className="col-span-4 flex flex-col gap-6">
        <GlassCard
          title="Today's Focus"
          icon={<Target className={ic} />}
          phase={2}
          index={0}
        >
          <p className="text-xs text-muted-foreground">
            The 3 most important tasks for today, starred from your task list.
          </p>
        </GlassCard>

        <GlassCard
          title="Next Up"
          icon={<Clock className={ic} />}
          phase={3}
          index={1}
        >
          <p className="text-xs text-muted-foreground">
            Your next 3 calendar events with time-until indicators.
          </p>
        </GlassCard>

        <GlassCard
          title="Daily Habits"
          icon={<Repeat className={ic} />}
          phase={6}
          index={2}
        >
          <p className="text-xs text-muted-foreground">
            Your daily habit checklist with completion percentage.
          </p>
        </GlassCard>
      </div>

      {/* ── Row 2: Middle column (5 cols) ───────────────────────── */}
      <div className="col-span-5 flex flex-col gap-6">
        <GlassCard
          title="Inbox"
          icon={<Inbox className={ic} />}
          phase={3}
          index={3}
        >
          <p className="text-xs text-muted-foreground">
            Recently captured voice notes and quick thoughts awaiting
            classification.
          </p>
        </GlassCard>

        <GlassCard
          title="Active Projects"
          icon={<FolderKanban className={ic} />}
          phase={5}
          index={4}
        >
          <p className="text-xs text-muted-foreground">
            Case Closed, Intelitrade, AWS Internship — status and next actions.
          </p>
        </GlassCard>

        <GlassCard
          title="This Week"
          icon={<LayoutGrid className={ic} />}
          phase={2}
          index={5}
        >
          <p className="text-xs text-muted-foreground">
            Kanban board: Today / This Week / This Month / Someday.
          </p>
        </GlassCard>
      </div>

      {/* ── Row 2: Right column (3 cols) ────────────────────────── */}
      <div className="col-span-3 flex flex-col gap-6">
        <GlassCard
          title="Finance Pulse"
          icon={<Wallet className={ic} />}
          phase={4}
          index={6}
        >
          <p className="text-xs text-muted-foreground">
            Net worth and monthly spending. Hidden by default.
          </p>
        </GlassCard>

        <GlassCard
          title="Goals"
          icon={<Flag className={ic} />}
          phase={6}
          index={7}
        >
          <p className="text-xs text-muted-foreground">
            Yearly, monthly, and weekly goals with progress.
          </p>
        </GlassCard>

        <GlassCard
          title="Applications"
          icon={<Briefcase className={ic} />}
          phase={5}
          index={8}
        >
          <p className="text-xs text-muted-foreground">
            Fellowships and internships in flight.
          </p>
        </GlassCard>
      </div>

      {/* ── Row 3: Mini Calendar (full width) ───────────────────── */}
      <div className="col-span-12">
        <GlassCard
          title="Mini Calendar"
          icon={<CalendarDays className={ic} />}
          phase={3}
          index={9}
        >
          <p className="text-xs text-muted-foreground">
            14-day calendar strip showing event density.
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
