import { createClient } from "@/lib/supabase/server"

export type Task = {
  id: string
  user_id: string
  title: string
  notes: string | null
  status: "active" | "completed" | "archived"
  is_starred: boolean
  priority: number
  project_id: string | null
  due_at: string | null
  completed_at: string | null
  apple_list_name: string | null
  apple_reminder_id: string | null
  source: "dashboard" | "shortcuts_ios" | "siri" | "reminders"
  tags: string[]
  created_at: string
  updated_at: string
  project?: { id: string; name: string; color: string } | null
}

export type Project = {
  id: string
  user_id: string
  name: string
  description: string | null
  status: string
  color: string
}

const TASK_SELECT = `
  id, user_id, title, notes, status, is_starred, priority,
  project_id, due_at, completed_at, apple_list_name, apple_reminder_id,
  source, tags, created_at, updated_at,
  project:projects(id, name, color)
`

export async function getTodayFocusTasks(): Promise<Task[]> {
  const db = await createClient()
  const { data, error } = await db
    .from("tasks")
    .select(TASK_SELECT)
    .eq("status", "active")
    .eq("is_starred", true)
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) throw new Error(error.message)
  return (data ?? []) as Task[]
}

export async function getTodayTasks(): Promise<{
  focus: Task[]
  overdue: Task[]
  dueToday: Task[]
}> {
  const db = await createClient()
  const today = new Date().toISOString().split("T")[0]
  const now = new Date().toISOString()

  const [focusRes, overdueRes, dueTodayRes] = await Promise.all([
    db
      .from("tasks")
      .select(TASK_SELECT)
      .eq("status", "active")
      .eq("is_starred", true)
      .order("created_at", { ascending: false }),

    db
      .from("tasks")
      .select(TASK_SELECT)
      .eq("status", "active")
      .eq("is_starred", false)
      .lt("due_at", today)
      .order("due_at", { ascending: true }),

    db
      .from("tasks")
      .select(TASK_SELECT)
      .eq("status", "active")
      .eq("is_starred", false)
      .gte("due_at", `${today}T00:00:00`)
      .lte("due_at", `${today}T23:59:59`)
      .order("due_at", { ascending: true }),
  ])

  if (focusRes.error) throw new Error(focusRes.error.message)
  if (overdueRes.error) throw new Error(overdueRes.error.message)
  if (dueTodayRes.error) throw new Error(dueTodayRes.error.message)

  return {
    focus: (focusRes.data ?? []) as Task[],
    overdue: (overdueRes.data ?? []) as Task[],
    dueToday: (dueTodayRes.data ?? []) as Task[],
  }
}

export async function getInboxTasks(): Promise<Task[]> {
  const db = await createClient()
  const { data, error } = await db
    .from("tasks")
    .select(TASK_SELECT)
    .eq("status", "active")
    .or(
      "apple_list_name.eq.Inbox,source.eq.siri,source.eq.shortcuts_ios,project_id.is.null"
    )
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Task[]
}

export async function getTasksByColumn(): Promise<{
  today: Task[]
  thisWeek: Task[]
  thisMonth: Task[]
  someday: Task[]
}> {
  const db = await createClient()
  const now = new Date()
  const todayStr = now.toISOString().split("T")[0]
  const weekEnd = new Date(now.getTime() + 7 * 86400_000).toISOString()
  const monthEnd = new Date(now.getTime() + 30 * 86400_000).toISOString()

  const { data, error } = await db
    .from("tasks")
    .select(TASK_SELECT)
    .eq("status", "active")
    .order("due_at", { ascending: true, nullsFirst: false })

  if (error) throw new Error(error.message)
  const tasks = (data ?? []) as Task[]

  const today: Task[] = []
  const thisWeek: Task[] = []
  const thisMonth: Task[] = []
  const someday: Task[] = []

  for (const t of tasks) {
    if (!t.due_at && !t.is_starred) {
      someday.push(t)
    } else if (
      t.is_starred ||
      (t.due_at && t.due_at.split("T")[0] <= todayStr)
    ) {
      today.push(t)
    } else if (t.due_at && t.due_at <= weekEnd) {
      thisWeek.push(t)
    } else if (t.due_at && t.due_at <= monthEnd) {
      thisMonth.push(t)
    } else {
      someday.push(t)
    }
  }

  return { today, thisWeek, thisMonth, someday }
}

export async function getTaskById(id: string): Promise<Task | null> {
  const db = await createClient()
  const { data, error } = await db
    .from("tasks")
    .select(TASK_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as Task | null
}

export async function getProjects(): Promise<Project[]> {
  const db = await createClient()
  const { data, error } = await db
    .from("projects")
    .select("id, user_id, name, description, status, color")
    .eq("status", "active")
    .order("name")

  if (error) throw new Error(error.message)
  return (data ?? []) as Project[]
}
