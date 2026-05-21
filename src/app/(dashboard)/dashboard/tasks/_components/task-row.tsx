"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, MoreHorizontal, Archive, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { type Task } from "@/lib/tasks/queries"
import {
  completeTask,
  uncompleteTask,
  starTask,
  archiveTask,
  deleteTask,
} from "../actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const SOURCE_LABELS: Record<string, string> = {
  shortcuts_ios: "Shortcuts",
  siri: "Siri",
  reminders: "Reminders",
  dashboard: "",
}

function RelativeTime({ iso }: { iso: string }) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return <span>just now</span>
  if (mins < 60) return <span>{mins}m ago</span>
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return <span>{hrs}h ago</span>
  return <span>{Math.floor(hrs / 24)}d ago</span>
}

interface TaskRowProps {
  task: Task
  onOpenDetail?: (task: Task) => void
  /** Renders as a larger checkbox for Today/Focus view */
  large?: boolean
}

export function TaskRow({ task, onOpenDetail, large }: TaskRowProps) {
  const [visible, setVisible] = useState(true)
  const [starred, setStarred] = useState(task.is_starred)
  const [completing, setCompleting] = useState(false)

  async function handleComplete() {
    setCompleting(true)
    const result = await completeTask(task.id)
    if (!result.ok) {
      setCompleting(false)
      toast.error("Failed to complete task")
      return
    }
    toast.success("Task completed", {
      action: {
        label: "Undo",
        onClick: async () => {
          await uncompleteTask(task.id)
          setCompleting(false)
          setVisible(true)
        },
      },
    })
    setTimeout(() => setVisible(false), 500)
  }

  async function handleStar() {
    const next = !starred
    setStarred(next)
    const result = await starTask(task.id, next)
    if (!result.ok) setStarred(!next)
  }

  async function handleArchive() {
    const result = await archiveTask(task.id)
    if (result.ok) {
      setVisible(false)
      toast.success("Archived", {
        action: {
          label: "Undo",
          onClick: () => setVisible(true),
        },
      })
    } else {
      toast.error("Failed to archive")
    }
  }

  async function handleDelete() {
    const result = await deleteTask(task.id)
    if (result.ok) {
      setVisible(false)
      toast.success("Deleted")
    } else {
      toast.error("Failed to delete")
    }
  }

  const sourceLabel = SOURCE_LABELS[task.source] ?? ""
  const overdue =
    task.due_at && new Date(task.due_at) < new Date() && task.status === "active"

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          layout
          initial={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25 }}
          className={cn(
            "group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors",
            "hover:bg-white/5",
            completing && "opacity-50 pointer-events-none"
          )}
        >
          {/* Checkbox */}
          <button
            onClick={handleComplete}
            className={cn(
              "mt-0.5 shrink-0 rounded-full border-2 transition-colors flex items-center justify-center",
              large ? "h-5 w-5" : "h-4 w-4",
              completing
                ? "border-[#7F77DD] bg-[#7F77DD]"
                : "border-muted-foreground/40 hover:border-[#7F77DD]"
            )}
            aria-label="Complete task"
          >
            {completing && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                viewBox="0 0 10 8"
                fill="none"
                className="h-2.5 w-2.5"
              >
                <path
                  d="M1 4l3 3 5-5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            )}
          </button>

          {/* Content */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onOpenDetail?.(task)}
          >
            <p
              className={cn(
                "text-sm leading-snug",
                completing && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </p>

            {/* Metadata row */}
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {task.project && (
                <span
                  className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: `${task.project.color}22`,
                    color: task.project.color,
                  }}
                >
                  {task.project.name}
                </span>
              )}
              {task.due_at && (
                <span
                  className={cn(
                    "font-mono text-[10px]",
                    overdue ? "text-red-400" : "text-muted-foreground"
                  )}
                >
                  {new Date(task.due_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
              {sourceLabel && (
                <Badge
                  variant="outline"
                  className="h-4 px-1 text-[9px] font-normal text-muted-foreground"
                >
                  {sourceLabel}
                </Badge>
              )}
              <span className="font-mono text-[10px] text-muted-foreground/60">
                <RelativeTime iso={task.created_at} />
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleStar}
              className={cn(
                "rounded p-1 transition-colors",
                starred
                  ? "text-yellow-400"
                  : "text-muted-foreground/40 hover:text-yellow-400"
              )}
              aria-label="Star task"
            >
              <Star className="h-3.5 w-3.5" fill={starred ? "currentColor" : "none"} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded p-1 text-muted-foreground/40 hover:text-foreground transition-colors">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onOpenDetail?.(task)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="mr-2 h-3.5 w-3.5" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-400 focus:text-red-400"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
