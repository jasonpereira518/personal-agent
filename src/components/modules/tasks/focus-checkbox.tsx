"use client"

import { useState } from "react"
import { completeTask } from "@/app/(dashboard)/dashboard/tasks/actions"
import { cn } from "@/lib/utils"

export function FocusCheckbox({ taskId }: { taskId: string }) {
  const [done, setDone] = useState(false)

  async function handle() {
    if (done) return
    setDone(true)
    await completeTask(taskId)
  }

  return (
    <button
      onClick={handle}
      className={cn(
        "mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-colors flex items-center justify-center",
        done
          ? "border-[#7F77DD] bg-[#7F77DD]"
          : "border-muted-foreground/40 hover:border-[#7F77DD]"
      )}
      aria-label="Complete"
    >
      {done && (
        <svg viewBox="0 0 10 8" fill="none" className="h-2 w-2">
          <path
            d="M1 4l3 3 5-5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
