import { createClient } from "@/lib/supabase/server"

export async function insertTask(values: {
  userId: string
  title: string
  notes?: string
  isStarred?: boolean
  projectId?: string
  dueAt?: string
  source?: string
}) {
  const db = await createClient()
  const { data, error } = await db
    .from("tasks")
    .insert({
      user_id: values.userId,
      title: values.title.slice(0, 500),
      notes: values.notes ?? null,
      is_starred: values.isStarred ?? false,
      project_id: values.projectId ?? null,
      due_at: values.dueAt ?? null,
      source: (values.source as "dashboard") ?? "dashboard",
      status: "active",
    })
    .select("id")
    .single()

  if (error) throw new Error(error.message)
  return data.id as string
}

export async function patchTask(
  id: string,
  patch: Record<string, unknown>
) {
  const db = await createClient()
  const { error } = await db
    .from("tasks")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)
}
