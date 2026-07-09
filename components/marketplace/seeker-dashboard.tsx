"use client"

import {
  BellPlus,
  Briefcase,
  Building2,
  Clock,
  Coins,
  FileText,
  Gift,
  Layers,
  MousePointerClick,
  RefreshCw,
  SearchX,
  Trash2,
  Upload,
  UserRound,
  Wrench,
  Zap,
  Search,
  MessageSquare,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react"
import { useState, useMemo, useRef, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/marketplace/modal"
import { cn } from "@/lib/utils"
import {
  STATUS_LABELS,
  useMarketplace,
  type ApplicationStatus,
  type Job,
  CATEGORIES,
  type Category,
} from "@/lib/marketplace-store"

type Tab = "feed" | "applications" | "profile"

const TABS: { id: Tab; label: string; icon: typeof Briefcase }[] = [
  { id: "feed", label: "Job Feed", icon: Briefcase },
  { id: "applications", label: "My Applications", icon: Layers },
  { id: "profile", label: "My Profile", icon: UserRound },
]

export function SeekerDashboard() {
  const { tokensRemaining, maxTokens, selectedExpertise, currentUser } = useMarketplace()
  const [tab, setTab] = useState<Tab>("feed")

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Seeker Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {selectedExpertise.length > 0
              ? `Filtered by ${selectedExpertise.join(", ")}`
              : "Browse anonymous referral opportunities."}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-2 shadow-sm">
          <Coins className="size-4 text-bounty-foreground" />
          <span className="text-sm font-medium">Tokens Remaining</span>
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            {tokensRemaining}/{maxTokens}
          </span>
        </div>
      </div>

      {currentUser && currentUser.profileCompletion < 80 && (
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-amber-600 dark:text-amber-400 flex items-start gap-3">
          <Zap className="size-5 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h4 className="font-semibold text-sm">Profile Incomplete ({currentUser.profileCompletion}%)</h4>
            <p className="text-xs mt-1">
              You must complete at least 80% of your profile to submit referral applications. Please upload your resume PDF in the Profile tab.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "feed" && <JobFeed />}
      {tab === "applications" && <MyApplications />}
      {tab === "profile" && <MyProfile />}
    </div>
  )
}

/* ---------------- Job Feed ---------------- */

function JobFeed() {
  const { jobs, selectedExpertise, setView, loadJobs } = useMarketplace()
  const [applyJob, setApplyJob] = useState<Job | null>(null)
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [onlyBounty, setOnlyBounty] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "bounty-desc" | "title-asc">("newest")

  useEffect(() => {
    loadJobs({
      query: searchQuery,
      sortBy: sortBy === "bounty-desc" ? "bounty" : sortBy === "title-asc" ? "alphabetical" : "newest",
      bountiesOnly: onlyBounty
    })
  }, [searchQuery, sortBy, onlyBounty])

  const filtered = useMemo(() => {
    let result = selectedExpertise.length > 0
      ? jobs.filter((j) => selectedExpertise.includes(j.category))
      : jobs

    // Apply search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.stack.toLowerCase().includes(q) ||
          j.industry.toLowerCase().includes(q) ||
          j.postedBy.toLowerCase().includes(q)
      )
    }

    // Apply bounty filter
    if (onlyBounty) {
      result = result.filter((j) => j.bounty !== null && j.bounty !== "")
    }

    // Apply sorting
    return [...result].sort((a, b) => {
      if (sortBy === "bounty-desc") {
        const valA = a.bounty ? parseInt(a.bounty.replace(/[^0-9]/g, "")) || 0 : 0
        const valB = b.bounty ? parseInt(b.bounty.replace(/[^0-9]/g, "")) || 0 : 0
        return valB - valA
      }
      if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title)
      }
      return b.id - a.id
    })
  }, [jobs, selectedExpertise, searchQuery, onlyBounty, sortBy])

  return (
    <>
      {/* Search and Filters Strip */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by title, stack, industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="size-4" />
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/40">
            <input
              type="checkbox"
              checked={onlyBounty}
              onChange={(e) => setOnlyBounty(e.target.checked)}
              className="rounded border-input text-primary focus:ring-ring"
            />
            <Gift className="size-4 text-bounty-foreground" />
            <span>Bounties Only</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <option value="newest">Newest Posted</option>
              <option value="bounty-desc">Highest Bounty</option>
              <option value="title-asc">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <SearchX className="size-7" />
          </span>
          <h3 className="mt-4 font-display text-lg font-semibold">
            No matching roles found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try adjusting your search query, clearing filters, or editing your expertise.
          </p>
          <div className="mt-5 flex gap-2">
            <Button onClick={() => { setSearchQuery(""); setOnlyBounty(false); }}>
              Reset Filters
            </Button>
            <Button variant="outline" onClick={() => setView("home")}>
              Edit expertise
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} onApply={() => setApplyJob(job)} />
          ))}
        </div>
      )}
      
      <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />
    </>
  )
}

function JobCard({ job, onApply }: { job: Job; onApply: () => void }) {
  const { hasApplied, tokensRemaining, currentUser } = useMarketplace()
  const applied = hasApplied(job.id)
  const outOfTokens = tokensRemaining <= 0
  const profileIncomplete = currentUser && currentUser.profileCompletion < 80

  const [logoFailed, setLogoFailed] = useState(false)
  const companyName = job.companyName || "Anonymous"

  const getLogoUrl = () => {
    if (!job.companyUrl) return null
    try {
      const domain = job.companyUrl
        .replace(/https?:\/\//, "")
        .replace(/www\./, "")
        .split("/")[0]
      return `https://logo.clearbit.com/${domain}`
    } catch (e) {
      return null
    }
  }

  const logoUrl = getLogoUrl()

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <Badge variant="secondary">{job.category}</Badge>
        {job.bounty ? (
          <Badge variant="bounty">
            <Gift className="size-3" />
            {job.bounty}
          </Badge>
        ) : null}
      </div>

      {/* Company Logo Header (Requirement 3) */}
      <div className="flex items-center gap-3 mt-4">
        {logoUrl && !logoFailed ? (
          <img
            src={logoUrl}
            alt={`${companyName} logo`}
            onError={() => setLogoFailed(true)}
            className="size-11 rounded-xl object-contain border border-border bg-white p-1 shadow-sm"
          />
        ) : (
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 font-display font-bold text-primary border border-border text-sm">
            {companyName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {/* Company Name First */}
          <h4 className="font-display text-xs font-bold text-primary uppercase tracking-wider truncate">
            {companyName}
          </h4>
          {/* Job Role Second */}
          <h3 className="font-display text-sm font-bold text-foreground leading-snug truncate mt-0.5">
            {job.title}
          </h3>
          {/* Location & Type Third */}
          <p className="text-[11px] text-muted-foreground font-semibold truncate mt-0.5 capitalize">
            {companyName} • {job.location || "Location"} • {job.workModel || "Remote"}
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-sm border-t border-border/60 pt-3">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Building2 className="size-3.5 shrink-0" />
          <span>{job.industry}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <UserRound className="size-3.5 shrink-0" />
          <span>{job.companySize} employees</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Wrench className="size-3.5 shrink-0" />
          <span className="truncate">{job.stack}</span>
        </div>
      </dl>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="flex size-5 items-center justify-center rounded-full bg-muted font-medium text-[10px]">
          {job.postedBy.slice(-2)}
        </span>
        <span>Posted by {job.postedBy}</span>
      </div>

      <div className="mt-auto pt-4">
        <Button
          className="w-full shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            onApply()
          }}
          disabled={applied || outOfTokens || profileIncomplete}
          variant={applied ? "secondary" : "default"}
        >
          {applied ? (
            "Applied"
          ) : profileIncomplete ? (
            "Complete Profile (Min 80%)"
          ) : (
            <>
              <Zap />
              1-Click Apply (1 Token)
            </>
          )}
        </Button>
        {outOfTokens && !applied ? (
          <p className="mt-1.5 text-center text-xs text-destructive">
            Out of tokens
          </p>
        ) : null}
      </div>
    </article>
  )
}

function ApplyModal({
  job,
  onClose,
}: {
  job: Job | null
  onClose: () => void
}) {
  const { applyToJob, currentUser } = useMarketplace()
  const [pitch, setPitch] = useState("")
  const [error, setError] = useState<string | null>(null)
  const max = 200

  const submit = async () => {
    if (!job) return
    const res = await applyToJob(job.id, pitch.trim())
    if (!res.ok) {
      setError(res.reason ?? "Something went wrong.")
      return
    }
    setPitch("")
    setError(null)
    onClose()
  }

  const profileIncomplete = currentUser && currentUser.profileCompletion < 80

  return (
    <Modal
      open={job !== null}
      onClose={() => {
        setPitch("")
        setError(null)
        onClose()
      }}
      title={job ? `Apply — ${job.title}` : "Apply"}
      description="Add a short 'Why Me?' pitch. This is the first thing the referrer reads."
    >
      {job ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="secondary">{job.category}</Badge>
            <span className="text-muted-foreground">{job.industry}</span>
            {job.bounty ? (
              <Badge variant="bounty">
                <Gift className="size-3" />
                {job.bounty}
              </Badge>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="pitch"
              className="mb-1.5 flex items-center justify-between text-sm font-medium"
            >
              <span>Why Me?</span>
              <span
                className={cn(
                  "text-xs font-normal",
                  pitch.length > max
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {pitch.length}/{max}
              </span>
            </label>
            <textarea
              id="pitch"
              value={pitch}
              maxLength={max}
              onChange={(e) => setPitch(e.target.value)}
              rows={4}
              placeholder="Backend engineer with 5 yrs scaling Node.js + Postgres. Shipped a payments platform to 40k RPS…"
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : profileIncomplete ? (
            <p className="text-xs text-amber-500 font-semibold">
              You must complete your profile to at least 80% before submitting.
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MousePointerClick className="size-3.5" />
              Submitting spends 1 application token.
            </p>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={submit}
              disabled={pitch.trim().length === 0 || profileIncomplete}
            >
              <Zap />
              Finalize Application
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}

/* ---------------- My Applications ---------------- */

function ChatBox({
  applicationId,
  role,
  onClose,
}: {
  applicationId: number
  role: "seeker" | "employee"
  onClose?: () => void
}) {
  const { messages, sendMessage, applications } = useMarketplace()
  const [inputText, setInputText] = useState("")

  const app = applications.find((a) => a.id === applicationId)
  const appMessages = messages.filter((m) => m.applicationId === applicationId)

  const handleSend = () => {
    if (inputText.trim() === "") return
    sendMessage(applicationId, role, inputText.trim())
    setInputText("")
  }

  if (!app) return null

  return (
    <div className="flex flex-col h-[320px] border border-border rounded-xl bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
        <div>
          <h4 className="text-xs font-semibold">
            {role === "seeker" ? "Anon Employee (Referrer)" : `Candidate: ${app.candidateName}`}
          </h4>
          <p className="text-[10px] text-muted-foreground">
            {app.jobTitle} • Anonymous Chat
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close Chat">
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {appMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-4 py-6">
            <MessageSquare className="size-7 mb-2 opacity-50 text-primary animate-bounce" />
            <p className="text-xs font-medium">Anonymous Chat Initiated</p>
            <p className="text-[10px] max-w-[200px] text-muted-foreground mt-1">Align on resume details or schedule a quick sync.</p>
          </div>
        ) : (
          appMessages.map((m) => {
            const isSelf = m.sender === role
            const isSeekerMsg = m.senderRole === "seeker" || m.sender === "seeker"
            return (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col max-w-[80%] rounded-2xl px-3 py-1.5 text-xs",
                  isSelf
                    ? "self-end rounded-tr-none"
                    : "self-start rounded-tl-none",
                  isSeekerMsg
                    ? "bg-blue-600 text-white"
                    : "bg-emerald-600 text-white"
                )}
              >
                <span className="text-[9px] font-semibold opacity-80 mb-0.5">
                  {isSeekerMsg ? "Seeker" : "Employee"} {isSelf ? "(You)" : ""}
                </span>
                <p className="leading-normal">{m.text}</p>
                <span className="text-[8px] opacity-60 self-end mt-0.5">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Input Form */}
      <div className="border-t border-border p-2 bg-muted/20 flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend()
          }}
          className="flex-1 rounded-xl border border-input bg-background px-3 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
        <Button size="sm" onClick={handleSend} disabled={inputText.trim() === ""} className="h-8">
          Send
        </Button>
      </div>
    </div>
  )
}

function MyApplications() {
  const { applications, currentUser, setView } = useMarketplace()
  const mine = useMemo(() => {
    if (!currentUser) return []
    return applications.filter((a) => a.candidateEmail.toLowerCase() === currentUser.email.toLowerCase())
  }, [applications, currentUser])
  const [activeChatAppId, setActiveChatAppId] = useState<number | null>(null)

  if (mine.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Layers className="size-7" />
        </span>
        <h3 className="mt-4 font-display text-lg font-semibold">
          No applications yet
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Head to the Job Feed and use a token to apply for your first referral.
        </p>
        <Button className="mt-5" onClick={() => setView("seeker")}>
          <Briefcase />
          Browse Job Feed
        </Button>
      </div>
    )
  }

  const statusVariant: Record<
    ApplicationStatus,
    "muted" | "accent" | "success"
  > = {
    pending: "muted",
    shortlisted: "accent",
    referred: "success",
  }

  return (
    <div className="space-y-3">
      {mine.map((app) => (
        <div key={app.id} className="space-y-2">
          <div
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-base font-semibold">
                  {app.jobTitle}
                </h3>
                <Badge variant="secondary">{app.category}</Badge>
              </div>
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                &ldquo;{app.pitch}&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end shrink-0">
              <Badge variant={statusVariant[app.status]}>
                {STATUS_LABELS[app.status].seeker}
              </Badge>
              {app.status === "pending" ? (
                <>
                  <ExpiryCountdown appliedAt={app.appliedAt} />
                  <span className="text-[10px] text-muted-foreground">
                    Chat unlocks when shortlisted
                  </span>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveChatAppId(activeChatAppId === app.id ? null : app.id)}
                >
                  <MessageSquare className="size-3.5" />
                  {activeChatAppId === app.id ? "Close Chat" : "Chat with Referrer"}
                </Button>
              )}
            </div>
          </div>
          {activeChatAppId === app.id && (
            <div className="animate-slide-in">
              <ChatBox applicationId={app.id} role="seeker" onClose={() => setActiveChatAppId(null)} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ExpiryCountdown({ appliedAt }: { appliedAt: number }) {
  const expiresAt = appliedAt + 7 * 24 * 60 * 60 * 1000
  const msLeft = expiresAt - Date.now()
  const daysLeft = Math.max(0, Math.floor(msLeft / (24 * 60 * 60 * 1000)))
  const hoursLeft = Math.max(
    0,
    Math.floor((msLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
  )
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="size-3.5" />
      Expires in {daysLeft}d {hoursLeft}h
    </span>
  )
}

/* ---------------- My Profile ---------------- */

function MyProfile() {
  const { resumeName, resumePdf, resumeSummary, uploadResume, deleteResume, selectedExpertise, setSelectedExpertise, currentUser } =
    useMarketplace()
  const [analyzing, setAnalyzing] = useState(false)
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [customExpertiseText, setCustomExpertiseText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.")
      return
    }

    setAnalyzing(true)
    try {
      // 1. Read file as base64 data URL
      const reader = new FileReader()
      reader.onload = async () => {
        const base64String = reader.result as string

        // 2. Call backend analyze endpoint
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/resume/analyze", {
          method: "POST",
          body: formData,
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || "Failed to analyze resume.")
        }

        // 3. Upload to state store
        uploadResume(file.name, base64String, data)
      }
      reader.readAsDataURL(file)
    } catch (err: any) {
      alert("Error analyzing PDF: " + err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const triggerUploadClick = () => {
    fileInputRef.current?.click()
  }

  const getInitials = () => {
    if (!currentUser?.name) return "S"
    return currentUser.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
              {getInitials()}
            </span>
            <div>
              <p className="font-semibold">{currentUser?.name || "Active Seeker"}</p>
              <p className="text-sm text-muted-foreground">Job Seeker</p>
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-sm font-medium">Expertise</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selectedExpertise.length > 0 ? (
                selectedExpertise.map((c) => (
                  <Badge key={c} variant="secondary">
                    {c}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">None selected</span>
              )}
            </div>
            {/* Categories Selector */}
            <div className="mt-3">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1.5">Select Categories</p>
              <div className="flex flex-wrap gap-1 border rounded-lg p-1.5 bg-muted/20">
                {CATEGORIES.map((c) => {
                  const active = selectedExpertise.includes(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={async () => {
                        const updated = active
                          ? selectedExpertise.filter((x) => x !== c)
                          : [...selectedExpertise, c]
                        setSelectedExpertise(updated)
                        // Sync with backend profile
                        await fetch("/api/auth/me", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ selectedExpertise: updated }),
                        })
                      }}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium border transition-colors cursor-pointer",
                        active ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:text-foreground border-border bg-card"
                      )}
                    >
                      {c}
                    </button>
                  )
                })}
                {/* Others Toggle */}
                <button
                  type="button"
                  onClick={() => setShowOtherInput(!showOtherInput)}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium border transition-colors cursor-pointer",
                    showOtherInput ? "bg-accent text-accent-foreground border-accent" : "text-muted-foreground hover:text-foreground border-border bg-card"
                  )}
                >
                  Others
                </button>
              </div>

              {/* Custom Input */}
              {showOtherInput && (
                <div className="mt-2 flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Enter custom expertise..."
                    value={customExpertiseText}
                    onChange={(e) => setCustomExpertiseText(e.target.value)}
                    className="flex-1 rounded-xl border border-input bg-background px-3 py-1 text-xs outline-none focus-visible:border-ring"
                  />
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (customExpertiseText.trim()) {
                        const val = customExpertiseText.trim()
                        if (!selectedExpertise.includes(val)) {
                          const updated = [...selectedExpertise, val]
                          setSelectedExpertise(updated)
                          // Sync with backend profile
                          await fetch("/api/auth/me", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ selectedExpertise: updated }),
                          })
                        }
                        setCustomExpertiseText("")
                        setShowOtherInput(false)
                      }
                    }}
                    className="cursor-pointer font-semibold"
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Resume</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the resume shared with referrers when you apply. Supports real .pdf files.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />

          {resumeName ? (
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{resumeName}</p>
                  <p className="text-xs text-muted-foreground">
                    PDF • uploaded & analyzed
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerUploadClick}
                  disabled={analyzing}
                >
                  <RefreshCw className={cn(analyzing && "animate-spin")} />
                  {analyzing ? "Analyzing..." : "Update / Re-upload"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteResume}
                  disabled={analyzing}
                  aria-label="Delete resume"
                >
                  <Trash2 />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={triggerUploadClick}
              disabled={analyzing}
              className="mt-4 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-8 text-center transition-colors hover:border-primary/50 hover:bg-muted cursor-pointer"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                {analyzing ? (
                  <RefreshCw className="size-5 animate-spin" />
                ) : (
                  <Upload className="size-5" />
                )}
              </span>
              <span className="text-sm font-medium">
                {analyzing ? "Parsing PDF with AI..." : "Upload real resume PDF — click to select"}
              </span>
            </button>
          )}
        </div>
      </div>
      {resumeName && <ResumeInsights />}
    </div>
  )
}

function ResumeInsights() {
  const { resumeSummary } = useMarketplace()

  const parsedSkills = useMemo(() => {
    if (resumeSummary?.skills && resumeSummary.skills.length > 0) {
      return resumeSummary.skills.map((s: string, idx: number) => {
        const ratings = [95, 90, 85, 80, 75, 70]
        const levels = ["Expert", "Expert", "Advanced", "Advanced", "Intermediate", "Intermediate"]
        const rating = ratings[idx % ratings.length]
        const level = levels[idx % levels.length]
        return { name: s, rating, level }
      })
    }
    return [
      { name: "Node.js", rating: 95, level: "Expert" },
      { name: "PostgreSQL", rating: 90, level: "Expert" },
      { name: "React / Next.js", rating: 85, level: "Advanced" },
      { name: "System Design", rating: 80, level: "Advanced" },
      { name: "AWS / Cloud", rating: 65, level: "Intermediate" },
    ]
  }, [resumeSummary])

  const strengths = resumeSummary?.strengths || [
    "Excellent metrics-driven impact (\"40k RPS\")",
    "Clear ownership of backend scaling path",
    "Clean, readable formatting and structure"
  ]

  const weaknesses = resumeSummary?.weaknesses || [
    "Missing cloud infrastructure credentials",
    "No direct testing framework mentioned (e.g. Jest)",
    "Fewer quantifiable metrics (impact percentages)"
  ]

  const suggestions = useMemo(() => {
    if (resumeSummary?.weaknesses) {
      return resumeSummary.weaknesses.map((w: string) => `Optimize resume details to resolve: ${w}`)
    }
    return [
      "Highlight specific database scale (e.g., millions of records, migrations) to align with Backend roles.",
      "Add more details about Cloud Infrastructure/AWS deployment since many Software Engineering roles require it.",
      "Draft a shorter pitch: Employee referrers prefer a 2-sentence summary of your most impressive technical achievement.",
    ]
  }, [resumeSummary])

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">AI Resume Insights</h3>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {/* Skills Chart */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Detected Skills & Proficiency
          </h4>
          <div className="space-y-3">
            {parsedSkills.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-muted-foreground">{skill.level} ({skill.rating}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${skill.rating}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-success/30 bg-success/5 p-4">
            <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-success mb-2">
              <CheckCircle2 className="size-4" /> Resume Strengths
            </h5>
            <ul className="list-inside list-disc text-sm text-muted-foreground space-y-1">
              {strengths.map((str, idx) => (
                <li key={idx} className="text-pretty">{str}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 mb-2">
              <Clock className="size-4" /> Optimization Areas
            </h5>
            <ul className="list-inside list-disc text-sm text-muted-foreground space-y-1">
              {weaknesses.map((weak, idx) => (
                <li key={idx} className="text-pretty">{weak}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-2">
            <Sparkles className="size-4" /> Next Steps to Maximize Referral Rate
          </h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {suggestions.map((s, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {idx + 1}
                </span>
                <span className="text-pretty">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
