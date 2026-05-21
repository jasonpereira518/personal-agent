import { createServiceClient } from "@/lib/supabase/service"
import { hmacSHA256, timingSafeEqual } from "@/lib/crypto/hmac"

const CLOCK_SKEW_SECONDS = 300 // 5 minutes

export type AuthResult = {
  userId: string
  captureSecret: string
  deviceTokenId: string
}

export async function verifyCaptureRequest(
  req: Request,
  rawBody: string
): Promise<AuthResult> {
  const userId = req.headers.get("x-user-id")
  const deviceTokenId = req.headers.get("x-device-token-id")
  const timestampHeader = req.headers.get("x-timestamp")
  const signatureHeader = req.headers.get("x-signature")
  const authHeader = req.headers.get("authorization")

  if (!userId) throw new AuthError("missing_user_id", 401)
  if (!deviceTokenId) throw new AuthError("missing_device_token_id", 401)

  // Fetch user profile with service role (bypasses RLS)
  const db = createServiceClient()
  const { data: profile, error } = await db
    .from("users_profile")
    .select("preferences")
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !profile) throw new AuthError("user_not_found", 401)

  const prefs = profile.preferences as Record<string, unknown>
  const captureSecret = prefs.capture_secret as string | undefined
  if (!captureSecret) throw new AuthError("no_capture_secret", 401)

  const deviceTokens = (prefs.device_tokens ?? {}) as Record<
    string,
    { is_revoked?: boolean }
  >
  const deviceToken = deviceTokens[deviceTokenId]
  if (!deviceToken) throw new AuthError("unknown_device_token", 401)
  if (deviceToken.is_revoked) throw new AuthError("device_token_revoked", 401)

  // ── Bearer-token auth (primary path for iOS Shortcuts v1) ──
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    if (!timingSafeEqual(token, captureSecret)) {
      throw new AuthError("auth_failed", 401)
    }
    return { userId, captureSecret, deviceTokenId }
  }

  // ── HMAC auth ──────────────────────────────────────────────
  if (!timestampHeader || !signatureHeader) {
    throw new AuthError("missing_auth_headers", 401)
  }

  const ts = parseInt(timestampHeader, 10)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - ts) > CLOCK_SKEW_SECONDS) {
    throw new AuthError("timestamp_expired", 401)
  }

  const expected = await hmacSHA256(captureSecret, rawBody)
  if (!timingSafeEqual(expected, signatureHeader)) {
    throw new AuthError("auth_failed", 401)
  }

  // Update last_used_at
  await db
    .from("users_profile")
    .update({
      preferences: {
        ...prefs,
        device_tokens: {
          ...deviceTokens,
          [deviceTokenId]: {
            ...deviceToken,
            last_used_at: new Date().toISOString(),
          },
        },
      },
    })
    .eq("user_id", userId)

  return { userId, captureSecret, deviceTokenId }
}

export class AuthError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number
  ) {
    super(code)
    this.name = "AuthError"
  }
}
