import { createServiceClient } from "@/lib/supabase/service"

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("")
}

export async function runInitialSeed(userId: string, email: string) {
  const db = createServiceClient()

  // ── 1. users_profile ──────────────────────────────────────
  const { data: existingProfile } = await db
    .from("users_profile")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()

  if (existingProfile) return { seeded: false }

  const captureSecret = randomHex(16) // 32-char hex

  const { error: profileError } = await db.from("users_profile").insert({
    user_id: userId,
    name: "Jason Pereira",
    email,
    location: "Arlington, VA",
    timezone: "America/New_York",
    preferences: {
      capture_secret: captureSecret,
      device_tokens: {
        "iphone-jp-1": {
          label: "Jason's iPhone",
          created_at: new Date().toISOString(),
          last_used_at: null,
          is_revoked: false,
        },
      },
    },
  })
  if (profileError) throw new Error(`Profile seed: ${profileError.message}`)

  // ── 2. Semesters ──────────────────────────────────────────
  const { data: semesters, error: semErr } = await db
    .from("semesters")
    .insert([
      {
        user_id: userId,
        name: "Summer 2026",
        season: "summer",
        year: 2026,
        start_date: "2026-05-12",
        end_date: "2026-08-01",
        is_current: true,
      },
      {
        user_id: userId,
        name: "Fall 2026",
        season: "fall",
        year: 2026,
        start_date: "2026-08-18",
        end_date: "2026-12-12",
        is_current: false,
      },
    ])
    .select("id, name")

  if (semErr) throw new Error(`Semester seed: ${semErr.message}`)

  // ── 3. Projects ───────────────────────────────────────────
  const { error: projErr } = await db.from("projects").insert([
    {
      user_id: userId,
      name: "Case Closed",
      description: "Legal tech startup",
      status: "active",
      color: "#7F77DD",
    },
    {
      user_id: userId,
      name: "Intelitrade",
      description: "Algorithmic trading project",
      status: "active",
      color: "#4CAF50",
    },
    {
      user_id: userId,
      name: "AWS Internship",
      description: "Amazon Web Services SDE Intern — Summer 2026",
      status: "active",
      color: "#FF9900",
    },
    {
      user_id: userId,
      name: "Personal OS",
      description: "This dashboard",
      status: "active",
      color: "#9B96E8",
    },
  ])
  if (projErr) throw new Error(`Project seed: ${projErr.message}`)

  // ── 4. Paycheck schedule ──────────────────────────────────
  const { error: pcErr } = await db.from("paycheck_schedules").insert({
    user_id: userId,
    employer: "Amazon Web Services",
    frequency: "biweekly",
    day_of_week: 5,
    anchor_date: "2026-05-29",
    is_active: true,
  })
  if (pcErr) throw new Error(`Paycheck seed: ${pcErr.message}`)

  // ── 5. Calendar accounts ──────────────────────────────────
  const { error: calErr } = await db.from("calendar_accounts").insert([
    {
      user_id: userId,
      provider: "google",
      name: "UNC Google",
      email: "jasonp5@unc.edu",
      is_active: true,
    },
    {
      user_id: userId,
      provider: "google",
      name: "Personal Google",
      email: null,
      is_active: false,
    },
    {
      user_id: userId,
      provider: "exchange",
      name: "AWS Exchange",
      email: null,
      is_active: false,
    },
  ])
  if (calErr) throw new Error(`Calendar seed: ${calErr.message}`)

  // ── 6. Habits ─────────────────────────────────────────────
  const { error: habitErr } = await db.from("habits").insert([
    {
      user_id: userId,
      name: "Gym",
      description: "Lift 4x per week",
      frequency: "weekly",
      target_days_per_week: 4,
      color: "#FF6B6B",
      is_active: true,
    },
    {
      user_id: userId,
      name: "Read 30 min",
      description: "Read non-fiction or fiction for 30 minutes",
      frequency: "daily",
      target_days_per_week: 7,
      color: "#4ECDC4",
      is_active: true,
    },
    {
      user_id: userId,
      name: "Deep work block",
      description: "Minimum 2-hour focused work session",
      frequency: "daily",
      target_days_per_week: 7,
      color: "#7F77DD",
      is_active: true,
    },
    {
      user_id: userId,
      name: "Journal",
      description: "Daily evening reflection",
      frequency: "daily",
      target_days_per_week: 7,
      color: "#FFD93D",
      is_active: true,
    },
  ])
  if (habitErr) throw new Error(`Habit seed: ${habitErr.message}`)

  return { seeded: true, captureSecret }
}
