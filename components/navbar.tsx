"use client"

import {
  Bell,
  Briefcase,
  CheckCircle2,
  Home,
  Menu,
  Sparkles,
  UserRound,
  X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useApp } from "@/lib/app-context"

export type View = "home" | "seeker" | "employee"

const links: { key: View; label: string; icon: typeof Home }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "seeker", label: "Seeker View", icon: UserRound },
  { key: "employee", label: "Employee View", icon: Briefcase },
]

export function Navbar({
  view,
  onChange,
}: {
  view: View
  onChange: (view: View) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button
          onClick={() => onChange("home")}
          className="flex items-center gap-2"
          aria-label="ReferLoop home"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="size-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">ReferLoop</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 md:flex">
            {links.map(({ key, label, icon: Icon }) => {
              const active = view === key
              return (
                <button
                  key={key}
                  onClick={() => onChange(key)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              )
            })}
          </div>

          <NotificationBell />

          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-foreground hover:bg-secondary md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border bg-background px-4 py-2 md:hidden">
          {links.map(({ key, label, icon: Icon }) => {
            const active = view === key
            return (
              <button
                key={key}
                onClick={() => {
                  onChange(key)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            )
          })}
        </div>
      )}
    </header>
  )
}
