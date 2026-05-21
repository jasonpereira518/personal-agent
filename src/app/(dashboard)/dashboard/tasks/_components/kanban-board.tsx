"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"
import { type Task, type Project } from "@/lib/tasks/queries"
import { TaskRow } from "./task-row"
import { TaskDetailSheet } from "./task-detail-sheet"
import { moveTaskColumn } from "../actions"
import { cn } from "@/lib/utils"

type Column = "today" | "this_week" | "this_month" | "someday"

const COLUMNS: { id: Column; label: string; description: string }[] = [
  { id: "today", label: "Today", description: "Due today or starred" },
  { id: "this_week", label: "This Week", description: "Due within 7 days" },
  { id: "this_month", label: "This Month", description: "Due within 30 days" },
  { id: "someday", label: "Someday", description: "No due date" },
]

function SortableTaskCard({
  task,
  onOpenDetail,
}: {
  task: Task
  onOpenDetail: (t: Task) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <TaskRow task={task} onOpenDetail={onOpenDetail} />
    </div>
  )
}

function KanbanColumn({
  column,
  tasks,
  onOpenDetail,
  isOver,
}: {
  column: (typeof COLUMNS)[0]
  tasks: Task[]
  onOpenDetail: (t: Task) => void
  isOver: boolean
}) {
  const { setNodeRef } = useDroppable({ id: column.id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-2xl border p-3 min-h-[200px] transition-colors",
        isOver
          ? "border-[#7F77DD]/50 bg-[#7F77DD]/5"
          : "border-white/8 bg-white/3"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-medium">{column.label}</h3>
        <span className="font-mono text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.length === 0 ? (
          <p className="flex-1 flex items-center justify-center text-[11px] text-muted-foreground/40 py-6">
            {column.description}
          </p>
        ) : (
          <div className="space-y-0.5">
            {tasks.map((t) => (
              <SortableTaskCard
                key={t.id}
                task={t}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>
        )}
      </SortableContext>
    </div>
  )
}

interface KanbanBoardProps {
  today: Task[]
  thisWeek: Task[]
  thisMonth: Task[]
  someday: Task[]
  projects: Project[]
}

export function KanbanBoard({
  today: initialToday,
  thisWeek: initialThisWeek,
  thisMonth: initialThisMonth,
  someday: initialSomeday,
  projects,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<Record<Column, Task[]>>({
    today: initialToday,
    this_week: initialThisWeek,
    this_month: initialThisMonth,
    someday: initialSomeday,
  })
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [overColumn, setOverColumn] = useState<Column | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const findColumn = useCallback(
    (taskId: string): Column | null => {
      for (const [col, tasks] of Object.entries(columns)) {
        if (tasks.find((t) => t.id === taskId)) return col as Column
      }
      return null
    },
    [columns]
  )

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string
    for (const tasks of Object.values(columns)) {
      const t = tasks.find((t) => t.id === id)
      if (t) { setActiveTask(t); break }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    setOverColumn(null)
    if (!over) return

    const taskId = active.id as string
    const targetCol = (over.id as string) as Column
    const sourceCol = findColumn(taskId)

    if (!sourceCol || !COLUMNS.find((c) => c.id === targetCol)) return
    if (sourceCol === targetCol) return

    // Optimistic update
    const task = columns[sourceCol].find((t) => t.id === taskId)!
    setColumns((prev) => ({
      ...prev,
      [sourceCol]: prev[sourceCol].filter((t) => t.id !== taskId),
      [targetCol]: [task, ...prev[targetCol]],
    }))

    const result = await moveTaskColumn(taskId, targetCol)
    if (!result.ok) {
      // Rollback
      setColumns((prev) => ({
        ...prev,
        [targetCol]: prev[targetCol].filter((t) => t.id !== taskId),
        [sourceCol]: [task, ...prev[sourceCol]],
      }))
      toast.error("Failed to move task")
    }
  }

  const allTasks = Object.values(columns).flat()

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={(e) => {
          const col = e.over?.id as Column | undefined
          setOverColumn(COLUMNS.find((c) => c.id === col) ? col ?? null : null)
        }}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={columns[col.id]}
              onOpenDetail={setSelectedTask}
              isOver={overColumn === col.id}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rounded-xl border border-[#7F77DD]/30 bg-[#0e0e1a] shadow-xl">
              <TaskRow task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskDetailSheet
        task={selectedTask}
        projects={projects}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  )
}
