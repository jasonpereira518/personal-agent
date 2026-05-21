"use client"

import { useState } from "react"
import { type Task, type Project } from "@/lib/tasks/queries"
import { TaskRow } from "./task-row"
import { TaskDetailSheet } from "./task-detail-sheet"

interface TaskListProps {
  tasks: Task[]
  projects: Project[]
  emptyMessage?: string
}

export function TaskList({ tasks, projects, emptyMessage }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  return (
    <>
      {tasks.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">
          {emptyMessage ?? "No tasks"}
        </p>
      ) : (
        <div className="space-y-0.5">
          {tasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
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
