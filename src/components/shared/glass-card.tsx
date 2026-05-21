"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  phase?: number
  children?: React.ReactNode
  className?: string
  index?: number
}

export function GlassCard({
  title,
  subtitle,
  icon,
  phase,
  children,
  className,
  index = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border p-6",
        "bg-black/5 border-black/10",
        "dark:bg-white/5 dark:border-white/10",
        "backdrop-blur-xl",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        {phase !== undefined && (
          <span className="rounded-full border border-[#7F77DD]/30 px-2 py-0.5 font-mono text-[10px] text-[#7F77DD]">
            Phase {phase}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mb-3 text-xs text-muted-foreground">{subtitle}</p>
      )}
      {children}
    </motion.div>
  )
}
