import { Suspense } from "react"
import {
  getTodayTasks,
  getInboxTasks,
  getTasksByColumn,
  getProjects,
} from "@/lib/tasks/queries"
import { TaskCreateForm } from "./_components/task-create-form"
import { TaskList } from "./_components/task-list"
import { InboxList } from "./_components/inbox-list"
import { KanbanBoard } from "./_components/kanban-board"
import { GlassCard } from "@/components/shared/glass-card"
import { ViewTabs } from "./_components/view-tabs"
import { Target, Clock, CheckSquare, Inbox } from "lucide-react"

interface PageProps {
  searchParams: Promise<{ view?: string }>
}

export default async function TasksPage({ searchParams }: PageProps) {
  const { view = "today" } = await searchParams
  const validView = ["today", "inbox", "kanban"].includes(view)
    ? (view as "today" | "inbox" | "kanban")
    : "today"

  const projects = await getProjects()

  return (
    <div className="space-y-4 max-w-5xl">
      <h1 className="font-medium text-lg">Tasks</h1>
      <ViewTabs active={validView} />
      <TaskCreateForm />

      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground py-4">Loading…</p>
        }
      >
        {validView === "today" && <TodayView projects={projects} />}
        {validView === "inbox" && <InboxView projects={projects} />}
        {validView === "kanban" && <KanbanView projects={projects} />}
      </Suspense>
    </div>
  )
}

// ── View sub-components (async, co-located) ───────────────────

type Projects = Awaited<ReturnType<typeof getProjects>>

async function TodayView({ projects }: { projects: Projects }) {
  const { focus, overdue, dueToday } = await getTodayTasks()

  return (
    <div className="space-y-4">
      <GlassCard
        title="Focus"
        icon={<Target className="h-4 w-4 text-[#7F77DD]" />}
      >
        <TaskList
          tasks={focus}
          projects={projects}
          emptyMessage="Nothing starred. Star tasks from Inbox or Kanban to focus on today."
        />
      </GlassCard>

      {overdue.length > 0 && (
        <GlassCard
          title="Overdue"
          icon={<Clock className="h-4 w-4 text-red-400" />}
        >
          <TaskList tasks={overdue} projects={projects} />
        </GlassCard>
      )}

      <GlassCard
        title="Due Today"
        icon={<CheckSquare className="h-4 w-4 text-[#7F77DD]" />}
      >
        <TaskList
          tasks={dueToday}
          projects={projects}
          emptyMessage="No tasks due today."
        />
      </GlassCard>
    </div>
  )
}

async function InboxView({ projects }: { projects: Projects }) {
  const tasks = await getInboxTasks()
  return (
    <GlassCard
      title="Inbox"
      icon={<Inbox className="h-4 w-4 text-[#7F77DD]" />}
    >
      <InboxList tasks={tasks} projects={projects} />
    </GlassCard>
  )
}

async function KanbanView({ projects }: { projects: Projects }) {
  const { today, thisWeek, thisMonth, someday } = await getTasksByColumn()
  return (
    <KanbanBoard
      today={today}
      thisWeek={thisWeek}
      thisMonth={thisMonth}
      someday={someday}
      projects={projects}
    />
  )
}
