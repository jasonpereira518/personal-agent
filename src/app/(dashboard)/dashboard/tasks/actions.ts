"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { insertTask, patchTask } from "@/lib/tasks/mutations"

type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

const TASK_PATH = "/dashboard/tasks"
const HOME_PATH = "/dashboard"

async function getUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")
  return userId
}

// ── Create ─────────────────────────────────────────────────
const CreateSchema = z.object({
  title: z.string().min(1).max(500),
  isStarred: z.boolean().optional().default(false),
  projectId: z.string().uuid().optional(),
  dueAt: z.string().datetime().optional(),
  notes: z.string().max(10000).optional(),
})

export async function createTask(
  input: z.infer<typeof CreateSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await getUserId()
    const parsed = CreateSchema.parse(input)
    const id = await insertTask({ userId, ...parsed })
    revalidatePath(TASK_PATH)
    revalidatePath(HOME_PATH)
    return { ok: true, data: { id } }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ── Update ─────────────────────────────────────────────────
const UpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500).optional(),
  notes: z.string().max(10000).optional(),
  isStarred: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
  projectId: z.string().uuid().nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  tags: z.array(z.string()).optional(),
})

export async function updateTask(
  input: z.infer<typeof UpdateSchema>
): Promise<ActionResult> {
  try {
    await getUserId()
    const { id, ...rest } = UpdateSchema.parse(input)
    const patch: Record<string, unknown> = {}
    if (rest.title !== undefined) patch.title = rest.title
    if (rest.notes !== undefined) patch.notes = rest.notes
    if (rest.isStarred !== undefined) patch.is_starred = rest.isStarred
    if (rest.priority !== undefined) patch.priority = rest.priority
    if (rest.projectId !== undefined) patch.project_id = rest.projectId
    if (rest.dueAt !== undefined) patch.due_at = rest.dueAt
    if (rest.tags !== undefined) patch.tags = rest.tags
    await patchTask(id, patch)
    revalidatePath(TASK_PATH)
    revalidatePath(HOME_PATH)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ── Complete ───────────────────────────────────────────────
export async function completeTask(id: string): Promise<ActionResult> {
  try {
    await getUserId()
    z.string().uuid().parse(id)
    await patchTask(id, {
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    revalidatePath(TASK_PATH)
    revalidatePath(HOME_PATH)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ── Uncomplete ─────────────────────────────────────────────
export async function uncompleteTask(id: string): Promise<ActionResult> {
  try {
    await getUserId()
    z.string().uuid().parse(id)
    await patchTask(id, { status: "active", completed_at: null })
    revalidatePath(TASK_PATH)
    revalidatePath(HOME_PATH)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ── Star ───────────────────────────────────────────────────
export async function starTask(
  id: string,
  starred: boolean
): Promise<ActionResult> {
  try {
    await getUserId()
    z.string().uuid().parse(id)
    await patchTask(id, { is_starred: starred })
    revalidatePath(TASK_PATH)
    revalidatePath(HOME_PATH)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ── Archive ────────────────────────────────────────────────
export async function archiveTask(id: string): Promise<ActionResult> {
  try {
    await getUserId()
    z.string().uuid().parse(id)
    await patchTask(id, { status: "archived" })
    revalidatePath(TASK_PATH)
    revalidatePath(HOME_PATH)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ── Delete ─────────────────────────────────────────────────
export async function deleteTask(id: string): Promise<ActionResult> {
  try {
    await getUserId()
    z.string().uuid().parse(id)
    const { createClient } = await import("@/lib/supabase/server")
    const db = await createClient()
    const { error } = await db.from("tasks").delete().eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath(TASK_PATH)
    revalidatePath(HOME_PATH)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ── Assign project ─────────────────────────────────────────
export async function assignProject(
  id: string,
  projectId: string | null
): Promise<ActionResult> {
  try {
    await getUserId()
    z.string().uuid().parse(id)
    if (projectId) z.string().uuid().parse(projectId)
    await patchTask(id, { project_id: projectId })
    revalidatePath(TASK_PATH)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ── Move Kanban column ──────────────────────────────────────
const KanbanColumns = ["today", "this_week", "this_month", "someday"] as const
type KanbanColumn = (typeof KanbanColumns)[number]

function columnToDueAt(column: KanbanColumn): string | null {
  const d = new Date()
  switch (column) {
    case "today":
      return d.toISOString()
    case "this_week":
      d.setDate(d.getDate() + 3)
      return d.toISOString()
    case "this_month":
      d.setDate(d.getDate() + 14)
      return d.toISOString()
    case "someday":
      return null
  }
}

export async function moveTaskColumn(
  id: string,
  column: KanbanColumn
): Promise<ActionResult> {
  try {
    await getUserId()
    z.string().uuid().parse(id)
    z.enum(KanbanColumns).parse(column)
    const dueAt = columnToDueAt(column)
    await patchTask(id, { due_at: dueAt })
    revalidatePath(TASK_PATH)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
