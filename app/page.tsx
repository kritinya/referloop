"use client"

import { useState } from "react"
import { AppProvider } from "@/lib/app-context"
import { Navbar, type View } from "@/components/navbar"
import { LandingPage } from "@/components/landing-page"
import { SeekerDashboard } from "@/components/seeker-dashboard"
import { EmployeeDashboard } from "@/components/employee-dashboard"

export default function Page() {
  const [view, setView] = useState<View>("home")

  return (
    <AppProvider>
      <main className="min-h-dvh bg-background">
        <Navbar view={view} onChange={setView} />
        {view === "home" && <LandingPage onNavigate={setView} />}
        {view === "seeker" && <SeekerDashboard />}
        {view === "employee" && <EmployeeDashboard />}
      </main>
    </AppProvider>
  )
}
