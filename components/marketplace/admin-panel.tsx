"use client"

import { useState, useEffect } from "react"
import { useMarketplace } from "@/lib/marketplace-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  ShieldAlert,
  Briefcase,
  Layers,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Trash2,
  RefreshCw,
  Search
} from "lucide-react"

export function AdminPanel() {
  const { setView, adminData, fetchAdminData, updateUserByAdmin, addToast } = useMarketplace()
  const [loading, setLoading] = useState(false)
  const [searchLog, setSearchLog] = useState("")

  const refresh = async () => {
    setLoading(true)
    await fetchAdminData()
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleDeleteJob = async (id: number) => {
    try {
      const res = await fetch(`/api/jobs?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        addToast("Listing deleted by Administrator.", "info")
        refresh()
      } else {
        const d = await res.json()
        addToast(d.error || "Failed to delete.", "error")
      }
    } catch (e: any) {
      addToast(e.message, "error")
    }
  }

  const toggleVerification = async (email: string, currentStatus: boolean) => {
    await updateUserByAdmin(email, !currentStatus, "")
  }

  const changeUserRole = async (email: string, newRole: string) => {
    await updateUserByAdmin(email, false, newRole)
  }

  const stats = adminData?.stats || {
    totalUsers: 0,
    verifiedUsers: 0,
    totalJobs: 0,
    totalApplications: 0
  }

  const usersList = adminData?.users || []
  const jobsList = adminData?.jobs || []
  const logsList = adminData?.auditLogs || []

  // Filter logs
  const filteredLogs = logsList.filter((log: any) =>
    log.userEmail.toLowerCase().includes(searchLog.toLowerCase()) ||
    log.action.toLowerCase().includes(searchLog.toLowerCase()) ||
    log.ip.includes(searchLog)
  )

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border py-6 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView("employee")}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Admin Control Panel</h1>
            <p className="text-sm text-muted-foreground">Monitor platform activity, manage users, and review audit logs.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`size-4 mr-2 ${loading && "animate-spin"}`} />
          Refresh Stats
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: "Total Accounts", value: stats.totalUsers, icon: Users, color: "text-blue-500 bg-blue-500/10" },
          { label: "Verified Insiders", value: stats.verifiedUsers, icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Referral Opportunities", value: stats.totalJobs, icon: Briefcase, color: "text-violet-500 bg-violet-500/10" },
          { label: "Submitted Applications", value: stats.totalApplications, icon: Layers, color: "text-pink-500 bg-pink-500/10" }
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</span>
              <span className={`p-2 rounded-xl ${c.color}`}><c.icon className="size-4" /></span>
            </div>
            <p className="mt-2 text-2xl font-bold font-display">{c.value}</p>
          </div>
        ))}
      </div>

      {/* User Management Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-8">
        <h2 className="font-display text-lg font-semibold mb-4">User Directory</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase font-medium">
                <th className="py-3 px-2">User Details</th>
                <th className="py-3 px-2">Role</th>
                <th className="py-3 px-2 text-center">Verification Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">No accounts found in database.</td>
                </tr>
              ) : (
                usersList.map((user: any) => (
                  <tr key={user.id} className="border-b border-border/60 hover:bg-muted/10">
                    <td className="py-3 px-2">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-[10px] text-muted-foreground">Phone: {user.phone || "N/A"}</p>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={user.role === "admin" ? "destructive" : user.role === "employee" ? "success" : "secondary"}>
                        {user.role}
                      </Badge>
                      {user.company && <p className="text-[10px] text-muted-foreground mt-0.5">{user.company}</p>}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant={user.isVerified ? "success" : "muted"}>
                        {user.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right space-x-1 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleVerification(user.email, user.isVerified)}
                      >
                        {user.isVerified ? "Revoke Verification" : "Verify Insider"}
                      </Button>
                      <select
                        value={user.role}
                        onChange={(e) => changeUserRole(user.email, e.target.value)}
                        className="text-xs border rounded-lg px-2 py-1 bg-background"
                      >
                        <option value="seeker">Seeker</option>
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Referral Manager Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-8">
        <h2 className="font-display text-lg font-semibold mb-4">Active Referral Postings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase font-medium">
                <th className="py-3 px-2">Opportunity</th>
                <th className="py-3 px-2">Skills</th>
                <th className="py-3 px-2">Referrer Handle</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobsList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">No referral opportunities in feed.</td>
                </tr>
              ) : (
                jobsList.map((job: any) => (
                  <tr key={job.id} className="border-b border-border/60 hover:bg-muted/10">
                    <td className="py-3 px-2">
                      <p className="font-semibold text-sm">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.category} • {job.companySize} size</p>
                      {job.bounty && <Badge variant="bounty" className="mt-1">{job.bounty}</Badge>}
                    </td>
                    <td className="py-3 px-2 font-mono text-xs">{job.stack}</td>
                    <td className="py-3 px-2 text-xs text-muted-foreground font-semibold">{job.postedBy}</td>
                    <td className="py-3 px-2 text-right">
                      <Button variant="ghost" size="icon-sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteJob(job.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-1.5">
            <ShieldAlert className="size-5 text-destructive" />
            Security Audit Log (Task 15)
          </h2>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              className="w-full rounded-xl border border-input bg-background pl-9 pr-4 py-1.5 text-xs outline-none focus-visible:border-ring"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground uppercase font-medium">
                <th className="py-2.5 px-2">Timestamp</th>
                <th className="py-2.5 px-2">User Email</th>
                <th className="py-2.5 px-2">Action / Event</th>
                <th className="py-2.5 px-2">IP Address</th>
                <th className="py-2.5 px-2">Client Meta</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted-foreground">No audit entries match filter query.</td>
                </tr>
              ) : (
                filteredLogs.map((log: any) => (
                  <tr key={log.id} className="border-b border-border/40 hover:bg-muted/5 font-mono text-[11px]">
                    <td className="py-2.5 px-2 text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 font-semibold text-foreground">
                      {log.userEmail}
                    </td>
                    <td className="py-2.5 px-2 text-foreground">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-2 text-muted-foreground">
                      {log.ip}
                    </td>
                    <td className="py-2.5 px-2 text-muted-foreground">
                      {log.device} ({log.browser})
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
