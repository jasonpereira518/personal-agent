"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { type Task, type Project } from "@/lib/tasks/queries"
import { TaskRow } from "./task-row"
import { TaskDetailSheet } from "./task-detail-sheet"
import { assignProject } from "../actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InboxListProps {
  tasks: Task[]
  projects: Project[]
}

function InboxTaskRow({
  task,
  projects,
  onOpenDetail,
}: {
  task: Task
  projects: Project[]
  onOpenDetail: (t: Task) => void
}) {
  const router = useRouter()

  async function handleAssign(projectId: string) {
    const result = await assignProject(
      task.id,
      projectId === "none" ? null : projectId
    )
    if (result.ok) {
      toast.success("Assigned to project")
      router.refresh()
    } else {
      toast.error("Failed to assign")
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <TaskRow task={task} onOpenDetail={onOpenDetail} />
      </div>
      <div className="shrink-0 w-36">
        <Select
          value={task.project_id ?? "none"}
          onValueChange={handleAssign}
        >
          <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10">
            <SelectValue placeholder="Assign…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No project</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export function InboxList({ tasks, projects }: InboxListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  return (
    <>
      {tasks.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-muted-foreground">Inbox zero 🎉</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Captured tasks will appear here for sorting.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {tasks.map((t) => (
            <InboxTaskRow
              key={t.id}
              task={t}
              projects={projects}
              onOpenDetail={setSelectedTask}
            />
          ))}
        </div>
      )}

      <TaskDetailSheet
        task={selectedTask}
        projects={projects}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  )
}
