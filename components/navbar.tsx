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

function NotificationBell() {
  const { notifications, markNotificationsRead } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
        aria-label="Open notifications"
        aria-expanded={isOpen}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2.5">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  markNotificationsRead()
                }}
                className="text-xs font-semibold text-primary hover:underline transition-colors cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <Bell className="size-5" />
                </div>
                <p className="mt-3 text-sm font-medium">All caught up!</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-[200px]">
                  You'll get notified here when an employee updates your referral status.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 rounded-lg p-2.5 transition-colors ${
                    n.read ? "bg-background border border-border/50" : "bg-primary/5 border-l-2 border-primary"
                  }`}
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="size-3.5" />
                  </span>
                  <div className="leading-tight flex-1">
                    <p className="text-xs font-semibold flex items-center justify-between">
                      {n.candidateName}
                      {!n.read && (
                        <span className="size-1.5 rounded-full bg-primary" />
                      )}
                    </p>
                    <p className="text-xs text-foreground/80 mt-0.5">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
