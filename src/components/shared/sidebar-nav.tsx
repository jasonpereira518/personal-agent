"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"
import {
  Home,
  CheckSquare,
  Calendar,
  Wallet,
  GraduationCap,
  FolderKanban,
  Briefcase,
  BookOpen,
  Repeat,
  Flag,
  Brain,
  Heart,
  Settings,
} from "lucide-react"

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { label: "Finance", href: "/dashboard/finance", icon: Wallet },
  { label: "Academics", href: "/dashboard/academics", icon: GraduationCap },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Applications", href: "/dashboard/applications", icon: Briefcase },
  { label: "Journal", href: "/dashboard/journal", icon: BookOpen },
  { label: "Habits", href: "/dashboard/habits", icon: Repeat },
  { label: "Goals", href: "/dashboard/goals", icon: Flag },
  { label: "Brain", href: "/dashboard/brain", icon: Brain },
  { label: "Health", href: "/dashboard/health", icon: Heart },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col border-r border-white/8 bg-black/20 dark:bg-white/3 backdrop-blur-xl z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <span className="font-medium text-sm tracking-wide text-[#7F77DD]">
          Personal OS
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-normal transition-colors",
                isActive
                  ? "bg-[#7F77DD]/15 text-[#7F77DD]"
                  : "text-muted-foreground hover:bg-white/8 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}

        <div className="my-3 border-t border-white/8" />

        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-normal transition-colors",
            pathname === "/dashboard/settings"
              ? "bg-[#7F77DD]/15 text-[#7F77DD]"
              : "text-muted-foreground hover:bg-white/8 hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <UserButton />
          <span className="truncate text-xs text-muted-foreground">
            Jason Pereira
          </span>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  )
}
