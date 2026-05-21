# iOS Shortcut — Capture to Personal OS

Two auth modes are supported:

| Mode | How | When to use |
|------|-----|-------------|
| **Bearer token** (v1, tonight) | `Authorization: Bearer <capture_secret>` | iOS Shortcuts natively — no extra apps |
| **HMAC-SHA256** (v2, Phase 4) | `X-Signature: hmac(body, secret)` | After setting up Scriptable |

---

## Step 1 — Get your credentials

1. Sign in to your Personal OS at your deployed URL
2. Go to **Settings** → **Capture Secret** → click **Reveal** → copy the value
3. Your **Clerk user ID** is shown in Supabase after first sign-in:
   ```sql
   SELECT user_id FROM users_profile LIMIT 1;
   ```
4. Your device token ID is `iphone-jp-1` (unless you added more in Settings)

---

## Step 2 — Test with curl first

```bash
curl -X POST https://YOUR-DOMAIN.vercel.app/api/capture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CAPTURE_SECRET" \
  -H "X-User-Id: YOUR_CLERK_USER_ID" \
  -H "X-Device-Token-Id: iphone-jp-1" \
  -H "X-Timestamp: $(date +%s)" \
  -d '{
    "content": "Test task from curl",
    "source": "shortcuts_ios",
    "device_token_id": "iphone-jp-1"
  }'
```

Expected response: `{"ok":true,"task_id":"..."}` — then check your Inbox view.

---

## Step 3 — Create the Shortcut

### Option A — Voice dictation (recommended)

1. Open **Shortcuts** app → tap **+** → name it `Capture to OS`
2. Add action: **Dictate Text** → language English → tap to insert result

3. Add action: **Get Current Date** → set variable `Timestamp`
   - Tap the Date → **Format Date** → Custom format: `X` (Unix timestamp)

4. Add action: **Get Contents of URL**
   - **URL**: `https://YOUR-DOMAIN.vercel.app/api/capture`
   - **Method**: POST
   - **Headers**:
     | Key | Value |
     |-----|-------|
     | `Content-Type` | `application/json` |
     | `Authorization` | `Bearer YOUR_CAPTURE_SECRET` |
     | `X-User-Id` | `YOUR_CLERK_USER_ID` |
     | `X-Device-Token-Id` | `iphone-jp-1` |
     | `X-Timestamp` | `[Timestamp variable]` |
   - **Request Body**: JSON
     ```json
     {
       "content": "[Dictated Text variable]",
       "source": "shortcuts_ios",
       "device_token_id": "iphone-jp-1"
     }
     ```

5. Add action: **Show Notification** — Body: `Captured!` (optional)

### Option B — Text input (manual)

Replace the **Dictate Text** action with **Ask for Input** (text prompt).

### Option C — Share Sheet (from any app)

1. Add the Shortcut to Share Sheet in Shortcut settings
2. Use **Shortcut Input** instead of Dictate Text

---

## Step 4 — Bind to Action Button or Siri

- **Action Button** (iPhone 15 Pro+): Settings → Action Button → Shortcut → Capture to OS
- **Siri**: "Hey Siri, Capture to OS" will trigger it and prompt for dictation

---

## Step 5 — Apple Reminders sync (one-way, tonight)

To capture from the **Reminders** app automatically:

1. Create another shortcut: **New Shortcut** → name `Sync Reminders`
2. Add action: **Find Reminders** → filter by list **Inbox** → completed: **No**
3. For each reminder → **Get Contents of URL** (same as above, but):
   - `"source": "reminders"`
   - `"list_name": "[Reminder List]"`
   - `"content": "[Reminder Title]"`
4. Add action: **Mark as Complete** (optional — marks it done in Reminders after syncing)
5. Run this shortcut via **Automation** → Time of Day → every hour

> ⚠️ This is a manual one-way sync. Reminders completed in the dashboard do NOT
> sync back to Apple Reminders in Phase 2. Two-way sync ships in Phase 4.

---

## HMAC Setup (Phase 4 — Scriptable)

When Phase 4 ships, replace the Bearer token with proper HMAC:

1. Install **Scriptable** from the App Store
2. Create a script `hmac_sign.js`:
   ```javascript
   const body = args.plainTexts[0]
   const secret = args.plainTexts[1]
   // Scriptable has built-in CryptoKit bindings
   const sig = await Crypto.hmac("sha256", secret, body)
   Script.setShortcutOutput(sig)
   ```
3. In the Shortcut, run this script with `body` and `capture_secret` as inputs
4. Use the output as `X-Signature` header (remove the Bearer header)
