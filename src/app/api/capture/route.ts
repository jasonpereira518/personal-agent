import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { verifyCaptureRequest, AuthError } from "@/lib/capture/auth"
import {
  CapturePayloadSchema,
  payloadToTaskInsert,
} from "@/lib/capture/route-task"
import { ZodError } from "zod"

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const userAgent = req.headers.get("user-agent") ?? "unknown"
  const db = createServiceClient()

  let userId: string | undefined
  let deviceTokenId: string | undefined

  async function log(statusCode: number, errorMessage?: string, taskId?: string) {
    await db.from("capture_webhook_log").insert({
      user_id: userId ?? null,
      device_token_id: deviceTokenId ?? null,
      source: undefined,
      payload_preview: rawBody.slice(0, 200),
      status_code: statusCode,
      error_message: errorMessage ?? null,
      ip_address: ip,
      user_agent: userAgent,
    })
  }

  // ── Auth ─────────────────────────────────────────────────
  let authResult: Awaited<ReturnType<typeof verifyCaptureRequest>>
  try {
    authResult = await verifyCaptureRequest(req, rawBody)
    userId = authResult.userId
    deviceTokenId = authResult.deviceTokenId
  } catch (e) {
    if (e instanceof AuthError) {
      await log(401, e.code)
      return NextResponse.json({ error: "auth_failed" }, { status: 401 })
    }
    await log(500, String(e))
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }

  // ── Validate payload ──────────────────────────────────────
  let parsed: ReturnType<typeof CapturePayloadSchema.parse>
  try {
    parsed = CapturePayloadSchema.parse(JSON.parse(rawBody))
  } catch (e) {
    if (e instanceof ZodError) {
      await log(400, e.message)
      return NextResponse.json(
        { error: "validation_failed", details: e.issues },
        { status: 400 }
      )
    }
    await log(400, "invalid_json")
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  // ── Insert task ───────────────────────────────────────────
  try {
    const taskRow = payloadToTaskInsert(parsed, authResult.userId)
    const { data, error } = await db
      .from("tasks")
      .insert(taskRow)
      .select("id")
      .single()

    if (error) throw new Error(error.message)

    await log(200, undefined)
    return NextResponse.json({ ok: true, task_id: data.id }, { status: 200 })
  } catch (e) {
    await log(500, String(e))
    return NextResponse.json({ error: "insert_failed" }, { status: 500 })
  }
}
