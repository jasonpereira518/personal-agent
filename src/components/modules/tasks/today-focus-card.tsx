import { getTodayFocusTasks } from "@/lib/tasks/queries"
import { GlassCard } from "@/components/shared/glass-card"
import { Target, Star } from "lucide-react"
import { FocusCheckbox } from "./focus-checkbox"

export async function TodayFocusCard() {
  let tasks: Awaited<ReturnType<typeof getTodayFocusTasks>> = []
  try {
    tasks = await getTodayFocusTasks()
  } catch {
    // Not authenticated or DB not ready — show empty state
  }

  return (
    <GlassCard
      title="Today's Focus"
      icon={<Target className="h-4 w-4 text-[#7F77DD]" />}
      index={0}
    >
      {tasks.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No focused tasks.{" "}
          <a
            href="/dashboard/tasks?view=today"
            className="text-[#7F77DD] hover:underline"
          >
            Star tasks
          </a>{" "}
          to focus on today.
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-2">
              <FocusCheckbox taskId={task.id} />
              <span className="flex-1 min-w-0">
                <span className="text-xs leading-snug line-clamp-2">
                  {task.title}
                </span>
                {task.project && (
                  <span
                    className="mt-0.5 block text-[10px]"
                    style={{ color: task.project.color }}
                  >
                    {task.project.name}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}
