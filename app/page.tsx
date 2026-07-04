"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"

import { EmployeeDashboard } from "@/components/marketplace/employee-dashboard"
import { Landing } from "@/components/marketplace/landing"
import { SeekerDashboard } from "@/components/marketplace/seeker-dashboard"
import { TopNav } from "@/components/marketplace/top-nav"
import { MarketplaceProvider, useMarketplace } from "@/lib/marketplace-store"
import { cn } from "@/lib/utils"
import { Chatbot } from "@/components/marketplace/chatbot"

function Toaster() {
  const { toasts, removeToast } = useMarketplace()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const iconMap = {
          success: <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />,
          info: <Info className="size-5 text-blue-500 shrink-0" />,
          error: <AlertCircle className="size-5 text-rose-500 shrink-0" />,
        }
        const bgMap = {
          success: "border-emerald-500/20 bg-card/90 shadow-emerald-500/5",
          info: "border-blue-500/20 bg-card/90 shadow-blue-500/5",
          error: "border-rose-500/20 bg-card/90 shadow-rose-500/5",
        }
        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md transition-all duration-300 animate-slide-in",
              bgMap[toast.type]
            )}
          >
            <div className="flex items-start gap-2.5">
              {iconMap[toast.type]}
              <p className="text-sm font-medium text-foreground">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

function Router() {
  const { view, confettiTrigger } = useMarketplace()

  useEffect(() => {
    if (confettiTrigger > 0) {
      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#5200FF", "#00F0FF", "#00FF66", "#FF007A", "#FFB800"],
        })
      } catch (e) {
        console.error("Confetti execution failed:", e)
      }
    }
  }, [confettiTrigger])

  return (
    <main className="min-h-screen bg-background">
      <TopNav />
      {view === "home" && <Landing />}
      {view === "seeker" && <SeekerDashboard />}
      {view === "employee" && <EmployeeDashboard />}
      <Toaster />
      <Chatbot />
    </main>
  )
}

export default function Page() {
  return (
    <MarketplaceProvider>
      <Router />
    </MarketplaceProvider>
  )
}
