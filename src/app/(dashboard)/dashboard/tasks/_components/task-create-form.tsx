"use client"

import { useRef, useEffect, KeyboardEvent } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { createTask } from "../actions"

interface TaskCreateFormProps {
  onCreated?: () => void
}

export function TaskCreateForm({ onCreated }: TaskCreateFormProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Press "/" anywhere on page to focus
  useEffect(() => {
    function handler(e: globalThis.KeyboardEvent) {
      const target = e.target as HTMLElement
      if (
        e.key === "/" &&
        target.tagName !== "INPUT" &&
        target.tagName !== "TEXTAREA"
      ) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  async function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return
    const title = inputRef.current?.value.trim()
    if (!title) return

    const isStarred = e.metaKey || e.ctrlKey

    const result = await createTask({ title, isStarred })
    if (result.ok) {
      if (inputRef.current) inputRef.current.value = ""
      toast.success(isStarred ? "Starred task added" : "Task added")
      onCreated?.()
    } else {
      toast.error("Failed to create task")
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
      <Plus className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      <input
        ref={inputRef}
        type="text"
        placeholder='New task — press Enter to add, ⌘+Enter to star, "/" to focus'
        className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/40 outline-none"
        onKeyDown={handleKey}
      />
    </div>
  )
}
