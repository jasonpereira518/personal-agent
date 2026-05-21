import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function LandingPage() {
  const user = await currentUser()
  if (user) redirect("/dashboard")

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a12]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7F77DD]/10 blur-[120px]" />
      </div>

      <div className="text-center space-y-6 px-6">
        <p className="font-mono text-xs tracking-widest text-[#7F77DD] uppercase">
          Personal OS
        </p>
        <h1 className="font-medium text-4xl text-white">
          Welcome, Jason.
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Your unified dashboard for tasks, calendar, finances, and everything
          else.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center rounded-xl bg-[#7F77DD] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Sign in to continue
        </Link>
      </div>
    </div>
  )
}
