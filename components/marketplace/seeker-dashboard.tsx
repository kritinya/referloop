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
} from "lucide-react"
import { useState, useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/marketplace/modal"
import { cn } from "@/lib/utils"
import {
  STATUS_LABELS,
  useMarketplace,
  type ApplicationStatus,
  type Job,
} from "@/lib/marketplace-store"

type Tab = "feed" | "applications" | "profile"

const TABS: { id: Tab; label: string; icon: typeof Briefcase }[] = [
  { id: "feed", label: "Job Feed", icon: Briefcase },
  { id: "applications", label: "My Applications", icon: Layers },
  { id: "profile", label: "My Profile", icon: UserRound },
]

export function SeekerDashboard() {
  const { tokensRemaining, maxTokens, selectedExpertise } = useMarketplace()
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
  const { jobs, selectedExpertise, setView } = useMarketplace()
  const [applyJob, setApplyJob] = useState<Job | null>(null)
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [onlyBounty, setOnlyBounty] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "bounty-desc" | "title-asc">("newest")

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
  const { hasApplied, tokensRemaining } = useMarketplace()
  const applied = hasApplied(job.id)
  const outOfTokens = tokensRemaining <= 0

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <Badge variant="secondary">{job.category}</Badge>
        {job.bounty ? (
          <Badge variant="bounty">
            <Gift className="size-3" />
            {job.bounty}
          </Badge>
        ) : null}
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-balance">
        {job.title}
      </h3>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="size-4 shrink-0" />
          <span>{job.industry}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <UserRound className="size-4 shrink-0" />
          <span>{job.companySize} employees</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wrench className="size-4 shrink-0" />
          <span>{job.stack}</span>
        </div>
      </dl>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="flex size-5 items-center justify-center rounded-full bg-muted font-medium">
          {job.postedBy.slice(-2)}
        </span>
        Posted by {job.postedBy}
      </div>

      <div className="mt-auto pt-4">
        <Button
          className="w-full"
          onClick={onApply}
          disabled={applied || outOfTokens}
          variant={applied ? "secondary" : "default"}
        >
          {applied ? (
            "Applied"
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
  const { applyToJob } = useMarketplace()
  const [pitch, setPitch] = useState("")
  const [error, setError] = useState<string | null>(null)
  const max = 200

  const submit = () => {
    if (!job) return
    const res = applyToJob(job.id, pitch.trim())
    if (!res.ok) {
      setError(res.reason ?? "Something went wrong.")
      return
    }
    setPitch("")
    setError(null)
    onClose()
  }

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
              disabled={pitch.trim().length === 0}
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
            return (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col max-w-[80%] rounded-2xl px-3 py-1.5 text-xs",
                  isSelf
                    ? "bg-primary text-primary-foreground self-end rounded-tr-none"
                    : "bg-muted text-foreground self-start rounded-tl-none"
                )}
              >
                <span className="text-[9px] font-semibold opacity-70 mb-0.5">
                  {isSelf ? "You" : role === "seeker" ? "Employee" : "Candidate"}
                </span>
                <p className="leading-normal">{m.text}</p>
                <span className="text-[8px] opacity-50 self-end mt-0.5">
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
  const { applications, seekerName, setView } = useMarketplace()
  const mine = applications.filter((a) => a.candidateName === seekerName)
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
  const { resumeName, uploadResume, deleteResume, seekerName, selectedExpertise } =
    useMarketplace()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
              AM
            </span>
            <div>
              <p className="font-semibold">{seekerName}</p>
              <p className="text-sm text-muted-foreground">Job Seeker</p>
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-sm font-medium">Expertise</p>
            <div className="flex flex-wrap gap-1.5">
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
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Resume</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the resume shared with referrers when you apply.
          </p>

          {resumeName ? (
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{resumeName}</p>
                  <p className="text-xs text-muted-foreground">
                    PDF • uploaded
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    uploadResume(`Alex_Morgan_Resume_v${Date.now() % 100}.pdf`)
                  }
                >
                  <RefreshCw />
                  Update / Re-upload
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteResume}
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
              onClick={() => uploadResume("Alex_Morgan_Resume_2026.pdf")}
              className="mt-4 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-8 text-center transition-colors hover:border-primary/50 hover:bg-muted"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Upload className="size-5" />
              </span>
              <span className="text-sm font-medium">
                No resume on file — click to upload
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
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(true)

  const triggerAnalysis = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setAnalyzed(true)
    }, 1500)
  }

  const parsedSkills = [
    { name: "Node.js", rating: 95, level: "Expert" },
    { name: "PostgreSQL", rating: 90, level: "Expert" },
    { name: "React / Next.js", rating: 85, level: "Advanced" },
    { name: "System Design", rating: 80, level: "Advanced" },
    { name: "AWS / Cloud", rating: 65, level: "Intermediate" },
  ]

  const suggestions = [
    "Highlight specific database scale (e.g., millions of records, migrations) to align with Backend roles.",
    "Add more details about Cloud Infrastructure/AWS deployment since many Software Engineering roles require it.",
    "Draft a shorter pitch: Employee referrers prefer a 2-sentence summary of your most impressive technical achievement.",
  ]

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">AI Resume Insights</h3>
        </div>
        {!analyzed && (
          <Button size="sm" onClick={triggerAnalysis} disabled={analyzing}>
            {analyzing ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Scan Resume"
            )}
          </Button>
        )}
      </div>

      {analyzing ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <RefreshCw className="size-8 animate-spin text-primary" />
          <p className="mt-4 text-sm font-medium">Extracting resume semantics...</p>
          <p className="text-xs text-muted-foreground">Matching against 1,200+ industry job descriptions</p>
        </div>
      ) : analyzed ? (
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
                <li>Excellent metrics-driven impact ("40k RPS")</li>
                <li>Clear ownership of backend scaling path</li>
                <li>Clean, readable formatting and structure</li>
              </ul>
            </div>
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
              <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 mb-2">
                <Clock className="size-4" /> Optimization Areas
              </h5>
              <ul className="list-inside list-disc text-sm text-muted-foreground space-y-1">
                <li>Missing cloud architecture credentials</li>
                <li>No direct testing framework mentioned (e.g. Jest)</li>
                <li>Relatively brief description for your SDE II role</li>
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
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary animate-pulse">
                    {idx + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground text-center py-6">
          Scan your resume to unlock matching metrics, skills breakdown, and recommendations.
        </p>
      )}
    </div>
  )
}
