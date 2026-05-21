import { SidebarNav } from "@/components/shared/sidebar-nav"
import { Toaster } from "@/components/ui/sonner"
import { runSeedIfNeeded } from "@/lib/seed/run-seed-action"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No-op after first run; idempotent seed check
  await runSeedIfNeeded()

  return (
    <div className="relative min-h-screen">
      {/* Radial gradient background */}
      <div className="fixed inset-0 -z-10 bg-[#f5f3ff] dark:bg-[#0a0a12]">
        <div className="absolute right-0 top-0 h-[700px] w-[700px] -translate-y-1/4 translate-x-1/4 rounded-full bg-[#7F77DD]/8 blur-[120px] dark:bg-[#7F77DD]/12" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] translate-y-1/4 -translate-x-1/4 rounded-full bg-[#7F77DD]/5 blur-[100px] dark:bg-[#7F77DD]/8" />
      </div>

      <SidebarNav />

      <main className="ml-60 min-h-screen p-6">{children}</main>

      <Toaster richColors position="bottom-right" />
    </div>
  )
}
