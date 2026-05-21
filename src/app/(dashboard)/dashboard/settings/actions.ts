"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { createServiceClient } from "@/lib/supabase/service"

function randomHex(bytes: number) {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("")
}

async function getProfile(userId: string) {
  const db = createServiceClient()
  const { data, error } = await db
    .from("users_profile")
    .select("preferences")
    .eq("user_id", userId)
    .single()
  if (error || !data) throw new Error("Profile not found")
  const row = data as unknown as { preferences: Record<string, unknown> }
  return { db, prefs: row.preferences }
}

export async function regenerateCaptureSecret() {
  const { userId } = await auth()
  if (!userId) return { ok: false, error: "Not authenticated" }

  try {
    const { db, prefs } = await getProfile(userId)
    const newSecret = randomHex(16)
    await db
      .from("users_profile")
      .update({
        preferences: { ...prefs, capture_secret: newSecret },
      })
      .eq("user_id", userId)
    revalidatePath("/dashboard/settings")
    return { ok: true, secret: newSecret }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function addDeviceToken(label: string) {
  const { userId } = await auth()
  if (!userId) return { ok: false, error: "Not authenticated" }

  try {
    const { db, prefs } = await getProfile(userId)
    const tokens = (prefs.device_tokens ?? {}) as Record<string, unknown>
    const n = Object.keys(tokens).length + 1
    const tokenId = `iphone-jp-${n}`
    const updated = {
      ...tokens,
      [tokenId]: {
        label: label || `Device ${n}`,
        created_at: new Date().toISOString(),
        last_used_at: null,
        is_revoked: false,
      },
    }
    await db
      .from("users_profile")
      .update({ preferences: { ...prefs, device_tokens: updated } })
      .eq("user_id", userId)
    revalidatePath("/dashboard/settings")
    return { ok: true, tokenId }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function revokeDeviceToken(tokenId: string) {
  const { userId } = await auth()
  if (!userId) return { ok: false, error: "Not authenticated" }

  try {
    const { db, prefs } = await getProfile(userId)
    const tokens = (prefs.device_tokens ?? {}) as Record<
      string,
      Record<string, unknown>
    >
    if (!tokens[tokenId]) return { ok: false, error: "Token not found" }
    tokens[tokenId] = { ...tokens[tokenId], is_revoked: true }
    await db
      .from("users_profile")
      .update({ preferences: { ...prefs, device_tokens: tokens } })
      .eq("user_id", userId)
    revalidatePath("/dashboard/settings")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
