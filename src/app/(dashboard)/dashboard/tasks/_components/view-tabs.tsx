"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "today", label: "Today" },
  { id: "inbox", label: "Inbox" },
  { id: "kanban", label: "Kanban" },
] as const

export function ViewTabs({ active }: { active: "today" | "inbox" | "kanban" }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/3 p-1 w-fit">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={`/dashboard/tasks?view=${tab.id}`}
          className={cn(
            "rounded-lg px-4 py-1.5 text-sm transition-colors",
            active === tab.id
              ? "bg-[#7F77DD]/20 text-[#7F77DD]"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
