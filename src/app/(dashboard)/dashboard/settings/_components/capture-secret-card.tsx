"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Copy, RefreshCw, Key } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { regenerateCaptureSecret } from "../actions"

export function CaptureSecretCard({ secret }: { secret: string | null }) {
  const [current, setCurrent] = useState(secret)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [revealed, setRevealed] = useState(false)

  function handleCopy() {
    if (!current) return
    navigator.clipboard.writeText(current)
    toast.success("Copied to clipboard")
  }

  function handleRegenerate() {
    startTransition(async () => {
      const result = await regenerateCaptureSecret()
      if (result.ok && result.secret) {
        setCurrent(result.secret)
        setRevealed(true)
        setShowConfirm(false)
        toast.success("Secret regenerated — update your iOS Shortcut")
      } else {
        toast.error("Failed to regenerate")
      }
    })
  }

  const display = current
    ? revealed
      ? current
      : current.slice(0, 4) + "••••••••••••••••••••••••••••"
    : "No secret — sign out and back in to seed your profile"

  return (
    <>
      <GlassCard
        title="Capture Secret"
        icon={<Key className="h-4 w-4 text-[#7F77DD]" />}
      >
        <p className="mb-3 text-xs text-muted-foreground">
          Used to authenticate your iOS Shortcut. Treat it like a password.
        </p>
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
          <code
            className="flex-1 font-mono text-xs truncate cursor-pointer select-all"
            onClick={() => setRevealed((r) => !r)}
          >
            {display}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleCopy}
            disabled={!current}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground h-7"
            onClick={() => setRevealed((r) => !r)}
          >
            {revealed ? "Hide" : "Reveal"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 h-7 ml-auto"
            onClick={() => setShowConfirm(true)}
            disabled={isPending}
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Regenerate
          </Button>
        </div>
      </GlassCard>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate capture secret?</DialogTitle>
            <DialogDescription>
              This invalidates all existing iOS Shortcuts. You&apos;ll need to
              update the secret in every device that uses the capture endpoint.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowConfirm(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRegenerate}
              disabled={isPending}
            >
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
