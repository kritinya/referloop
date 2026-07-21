"use client"

import { Network, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMarketplace, type View } from "@/lib/marketplace-store"

const NAV_ITEMS: { label: string; view: View }[] = [
  { label: "Home", view: "home" },
  { label: "Seeker View", view: "seeker" },
  { label: "Employee View", view: "employee" },
]

export function TopNav() {
  const { view, setView, currentUser, logout } = useMarketplace()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => setView("home")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Network className="size-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Referloop
          </span>
        </button>

        {/* Global Navigation View Tabs */}
        <nav className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              type="button"
              onClick={() => setView(item.view)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                view === item.view
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.label.split(" ")[0]}</span>
            </button>
          ))}
        </nav>

        {/* User Auth Info & Logout Action */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                {currentUser.name} ({currentUser.role})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 cursor-pointer"
              >
                <LogOut className="size-3.5" />
                Log Out
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("home")}
              className="cursor-pointer"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
