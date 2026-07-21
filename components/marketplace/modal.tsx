"use client"

import { X } from "lucide-react"
import { useEffect, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-sm animate-in fade-in"
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg overflow-hidden rounded-t-2xl border border-border bg-card text-card-foreground shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:rounded-2xl sm:zoom-in-95",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="space-y-0.5">
            <h2 className="font-display text-lg font-semibold leading-tight text-balance">
              {title}
            </h2>
            {description ? (
              <p className="text-sm text-muted-foreground text-pretty">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </Button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
