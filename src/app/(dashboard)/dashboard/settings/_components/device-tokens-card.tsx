"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Smartphone, Plus, XCircle } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { Button } from "@/components/ui/button"
import { addDeviceToken, revokeDeviceToken } from "../actions"

type DeviceToken = {
  label: string
  created_at: string
  last_used_at: string | null
  is_revoked: boolean
}

export function DeviceTokensCard({
  tokens: initialTokens,
}: {
  tokens: Record<string, DeviceToken>
}) {
  const [tokens, setTokens] = useState(initialTokens)
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    startTransition(async () => {
      const result = await addDeviceToken(newLabel)
      if (result.ok && result.tokenId) {
        setTokens((prev) => ({
          ...prev,
          [result.tokenId!]: {
            label: newLabel || `Device ${Object.keys(prev).length + 1}`,
            created_at: new Date().toISOString(),
            last_used_at: null,
            is_revoked: false,
          },
        }))
        setNewLabel("")
        setAdding(false)
        toast.success(`Device token ${result.tokenId} created`)
      } else {
        toast.error("Failed to add device")
      }
    })
  }

  function handleRevoke(tokenId: string) {
    startTransition(async () => {
      const result = await revokeDeviceToken(tokenId)
      if (result.ok) {
        setTokens((prev) => ({
          ...prev,
          [tokenId]: { ...prev[tokenId], is_revoked: true },
        }))
        toast.success("Device token revoked")
      } else {
        toast.error("Failed to revoke")
      }
    })
  }

  const entries = Object.entries(tokens)

  return (
    <GlassCard
      title="Device Tokens"
      icon={<Smartphone className="h-4 w-4 text-[#7F77DD]" />}
    >
      <p className="mb-3 text-xs text-muted-foreground">
        Each device that sends to the capture endpoint needs a token.
      </p>

      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 py-2">No devices yet.</p>
      ) : (
        <ul className="space-y-2 mb-3">
          {entries.map(([id, token]) => (
            <li
              key={id}
              className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">
                  {token.label}
                  {token.is_revoked && (
                    <span className="ml-2 text-red-400">(revoked)</span>
                  )}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {id}
                  {token.last_used_at && (
                    <> · last used {new Date(token.last_used_at).toLocaleDateString()}</>
                  )}
                </p>
              </div>
              {!token.is_revoked && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground/40 hover:text-red-400"
                  onClick={() => handleRevoke(id)}
                  disabled={isPending}
                >
                  <XCircle className="h-3.5 w-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Device label (e.g. iPhone)"
            className="flex-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd()
              if (e.key === "Escape") setAdding(false)
            }}
          />
          <Button size="sm" className="h-7 text-xs bg-[#7F77DD] hover:bg-[#6260B5] text-white" onClick={handleAdd} disabled={isPending}>
            Add
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => setAdding(true)}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add device
        </Button>
      )}
    </GlassCard>
  )
}
