import { z } from "zod"

export const CapturePayloadSchema = z.object({
  content: z.string().min(1).max(5000),
  source: z.enum(["shortcuts_ios", "siri", "reminders", "dashboard"]),
  list_name: z.string().max(200).optional(),
  due_at: z.string().datetime().optional(),
  device_token_id: z.string().max(100),
})

export type CapturePayload = z.infer<typeof CapturePayloadSchema>

export function payloadToTaskInsert(
  payload: CapturePayload,
  userId: string
) {
  return {
    user_id: userId,
    title: payload.content.slice(0, 200),
    notes: payload.content,
    apple_list_name: payload.list_name ?? null,
    source: payload.source,
    due_at: payload.due_at ?? null,
    status: "active" as const,
    priority: 0,
  }
}
