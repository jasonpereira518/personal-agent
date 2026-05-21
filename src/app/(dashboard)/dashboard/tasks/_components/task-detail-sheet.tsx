"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { type Task, type Project } from "@/lib/tasks/queries"
import { updateTask, deleteTask } from "../actions"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TaskDetailSheetProps {
  task: Task | null
  projects: Project[]
  open: boolean
  onClose: () => void
}

const PRIORITY_OPTIONS = [
  { value: "0", label: "No priority" },
  { value: "1", label: "High" },
  { value: "5", label: "Medium" },
  { value: "9", label: "Low" },
]

export function TaskDetailSheet({
  task,
  projects,
  open,
  onClose,
}: TaskDetailSheetProps) {
  const [isPending, startTransition] = useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [title, setTitle] = useState(task?.title ?? "")
  const [notes, setNotes] = useState(task?.notes ?? "")
  const [projectId, setProjectId] = useState(task?.project_id ?? "none")
  const [priority, setPriority] = useState(String(task?.priority ?? 0))
  const [isStarred, setIsStarred] = useState(task?.is_starred ?? false)
  const [dueAt, setDueAt] = useState(
    task?.due_at ? task.due_at.slice(0, 16) : ""
  )
  const [tags, setTags] = useState(task?.tags?.join(", ") ?? "")

  // Sync when task changes
  if (task && task.id !== (task?.id ?? "")) {
    setTitle(task.title)
    setNotes(task.notes ?? "")
    setProjectId(task.project_id ?? "none")
    setPriority(String(task.priority))
    setIsStarred(task.is_starred)
    setDueAt(task.due_at ? task.due_at.slice(0, 16) : "")
    setTags(task.tags?.join(", ") ?? "")
  }

  function handleSave() {
    if (!task) return
    startTransition(async () => {
      const result = await updateTask({
        id: task.id,
        title: title || task.title,
        notes: notes || undefined,
        isStarred,
        priority: parseInt(priority),
        projectId: projectId === "none" ? null : projectId,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      })
      if (result.ok) {
        toast.success("Saved")
        onClose()
      } else {
        toast.error("Failed to save")
      }
    })
  }

  function handleDelete() {
    if (!task) return
    startTransition(async () => {
      const result = await deleteTask(task.id)
      if (result.ok) {
        toast.success("Deleted")
        setShowDeleteDialog(false)
        onClose()
      } else {
        toast.error("Failed to delete")
      }
    })
  }

  if (!task) return null

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="w-full max-w-md flex flex-col gap-0 bg-[#0e0e1a] border-white/10">
          <SheetHeader className="pb-4 border-b border-white/8">
            <SheetTitle className="text-sm font-medium">Edit task</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1">
            {/* Title */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Title</Label>
              <Textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="min-h-[60px] resize-none bg-white/5 border-white/10 text-sm"
                placeholder="Task title"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] resize-none bg-white/5 border-white/10 text-sm font-mono text-xs"
                placeholder="Notes (markdown)"
              />
            </div>

            {/* Project */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-sm h-8">
                  <SelectValue placeholder="No project" />
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

            {/* Due date */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Due date</Label>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm outline-none focus:border-[#7F77DD]/50"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-white/5 border-white/10 text-sm h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Starred */}
            <div className="flex items-center gap-2">
              <input
                id="starred"
                type="checkbox"
                checked={isStarred}
                onChange={(e) => setIsStarred(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="starred" className="text-sm cursor-pointer">
                Starred (Today's Focus)
              </Label>
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Tags (comma-separated)
              </Label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm outline-none focus:border-[#7F77DD]/50"
                placeholder="work, urgent, aws"
              />
            </div>

            {/* Source badge */}
            {task.source !== "dashboard" && (
              <div>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  via {task.source}
                </Badge>
              </div>
            )}
          </div>

          <SheetFooter className="pt-4 border-t border-white/8 flex flex-row gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 mr-auto"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending}
              className="bg-[#7F77DD] hover:bg-[#6260B5] text-white"
            >
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirm dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete task?</DialogTitle>
            <DialogDescription>
              This permanently deletes &ldquo;{task.title}&rdquo;. Cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
