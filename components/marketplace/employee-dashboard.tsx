"use client"

import {
  ArrowRight,
  BadgeCheck,
  Clock,
  FileText,
  Gift,
  Inbox,
  KanbanSquare,
  PlusCircle,
  Sparkles,
  UserRound,
  MessageSquare,
  X,
} from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/marketplace/modal"
import { cn } from "@/lib/utils"
import {
  CATEGORIES,
  STATUS_LABELS,
  useMarketplace,
  type Application,
  type ApplicationStatus,
  type Category,
} from "@/lib/marketplace-store"

type Tab = "post" | "review"

export function EmployeeDashboard() {
  const [tab, setTab] = useState<Tab>("post")

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Employee Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Post roles and review incoming referrals.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-border bg-card px-2 py-1.5 pr-4 shadow-sm">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
            AN
          </span>
          <Badge variant="success">
            <BadgeCheck className="size-3" />
            Verified Employee
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-card p-1">
        {(
          [
            { id: "post", label: "Post New Role", icon: PlusCircle },
            { id: "review", label: "Candidate Review", icon: KanbanSquare },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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

      {tab === "post" ? <PostRole onPosted={() => setTab("review")} /> : null}
      {tab === "review" ? <CandidateReview /> : null}
    </div>
  )
}

/* ---------------- Post New Role ---------------- */

function PostRole({ onPosted }: { onPosted: () => void }) {
  const { postJob } = useMarketplace()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<Category>("Software Engineering")
  const [companySize, setCompanySize] = useState("50–200")
  const [stack, setStack] = useState("")
  const [bounty, setBounty] = useState("")
  const [posted, setPosted] = useState(false)

  const canSubmit = title.trim() && stack.trim()

  const submit = () => {
    if (!canSubmit) return
    postJob({
      title: title.trim(),
      category,
      companySize,
      stack: stack.trim(),
      bounty: bounty.trim() ? bounty.trim() : null,
    })
    setTitle("")
    setStack("")
    setBounty("")
    setPosted(true)
  }

  const field =
    "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
        <h2 className="font-display text-lg font-semibold">
          Post an anonymous opportunity
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          It appears instantly in the seeker Job Feed under your anonymous
          handle.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
              Job Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className={field}
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-1.5 block text-sm font-medium"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={field}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="size" className="mb-1.5 block text-sm font-medium">
              Company Size
            </label>
            <select
              id="size"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className={field}
            >
              {["1–10", "11–50", "50–200", "200–500", "500–1,000", "1,000–5,000", "5,000+"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s} employees
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="stack" className="mb-1.5 block text-sm font-medium">
              Required Skills / Stack
            </label>
            <input
              id="stack"
              value={stack}
              onChange={(e) => setStack(e.target.value)}
              placeholder="e.g. React, TypeScript, GraphQL"
              className={field}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="bounty" className="mb-1.5 block text-sm font-medium">
              Bounty Pledge{" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              id="bounty"
              value={bounty}
              onChange={(e) => setBounty(e.target.value)}
              placeholder="e.g. $50 Gift Card"
              className={field}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={submit} disabled={!canSubmit}>
            <PlusCircle />
            Post Opportunity
          </Button>
          {posted ? (
            <Button variant="outline" onClick={onPosted}>
              View applicants
              <ArrowRight />
            </Button>
          ) : null}
        </div>

        {posted ? (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-success">
            <BadgeCheck className="size-4" />
            Live in the seeker Job Feed. A fresh applicant is already in your
            review board.
          </p>
        ) : null}
      </div>

      {/* Preview / tips */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Gift className="size-5 text-bounty-foreground" />
          <h3 className="font-display text-base font-semibold">
            Bounties get results
          </h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Roles with a pledged bounty receive{" "}
          <span className="font-medium text-foreground">3.2x</span> more
          high-signal applicants. Your identity stays anonymous the entire time.
        </p>
        <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{category}</Badge>
            {bounty.trim() ? (
              <Badge variant="bounty">
                <Gift className="size-3" />
                {bounty}
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 font-display font-semibold">
            {title.trim() || "Your role title"}
          </p>
          <p className="text-sm text-muted-foreground">
            {stack.trim() || "Skills preview"}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Candidate Review (Kanban) ---------------- */

const COLUMNS: ApplicationStatus[] = ["pending", "shortlisted", "referred"]

function CandidateReview() {
  const { applications } = useMarketplace()
  const [resumeFor, setResumeFor] = useState<Application | null>(null)

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Inbox className="size-7" />
        </span>
        <h3 className="mt-4 font-display text-lg font-semibold">
          No applicants yet
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Post a role to start receiving referrals.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((status) => {
          const items = applications.filter((a) => a.status === status)
          return (
            <div
              key={status}
              className="rounded-2xl border border-border bg-muted/40 p-3"
            >
              <div className="flex items-center justify-between px-1 pb-3">
                <h3 className="text-sm font-semibold">
                  {STATUS_LABELS[status].employee}
                </h3>
                <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.map((app) => (
                  <KanbanCard
                    key={app.id}
                    app={app}
                    onViewResume={() => setResumeFor(app)}
                  />
                ))}
                {items.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                    Nothing here yet
                  </p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
      <ResumeModal app={resumeFor} onClose={() => setResumeFor(null)} />
    </>
  )
}

function KanbanCard({
  app,
  onViewResume,
}: {
  app: Application
  onViewResume: () => void
}) {
  const { updateApplicationStatus } = useMarketplace()

  const matchVariant =
    app.matchScore >= 90 ? "success" : app.matchScore >= 80 ? "accent" : "muted"

  const hoursAgo = Math.max(
    1,
    Math.round((Date.now() - app.appliedAt) / (60 * 60 * 1000)),
  )

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {app.candidateName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">
              {app.candidateName}
            </p>
            <p className="text-xs text-muted-foreground">{app.primarySkill}</p>
          </div>
        </div>
        <Badge variant={matchVariant}>
          <Sparkles className="size-3" />
          {app.matchScore}% Match
        </Badge>
      </div>

      <p className="mt-2 truncate text-xs text-muted-foreground">
        {app.jobTitle}
      </p>

      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="size-3.5" />
        Applied {hoursAgo}h ago
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onViewResume}>
          <FileText />
          View Resume
        </Button>
        {app.status === "pending" ? (
          <Button
            size="sm"
            onClick={() => updateApplicationStatus(app.id, "shortlisted")}
          >
            Shortlist
          </Button>
        ) : null}
        {app.status === "shortlisted" ? (
          <Button
            size="sm"
            onClick={() => updateApplicationStatus(app.id, "referred")}
          >
            Refer
          </Button>
        ) : null}
        {app.status === "referred" ? (
          <Badge variant="success" className="self-center">
            <BadgeCheck className="size-3" />
            Referred
          </Badge>
        ) : null}
      </div>
    </div>
  )
}

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

function ResumeModal({
  app,
  onClose,
}: {
  app: Application | null
  onClose: () => void
}) {
  const isChatEnabled = app ? app.status !== "pending" : false

  return (
    <Modal
      open={app !== null}
      onClose={onClose}
      title={app ? app.candidateName : "Candidate"}
      description={app ? `Applying for ${app.jobTitle}` : undefined}
      className={cn("transition-all duration-300", isChatEnabled ? "max-w-4xl" : "max-w-2xl")}
    >
      {app ? (
        <div className={cn("grid gap-6", isChatEnabled ? "md:grid-cols-2" : "grid-cols-1")}>
          {/* Resume details */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{app.category}</Badge>
              <Badge
                variant={
                  app.matchScore >= 90
                    ? "success"
                    : app.matchScore >= 80
                      ? "accent"
                      : "muted"
                }
              >
                <Sparkles className="size-3" />
                {app.matchScore}% AI Match
              </Badge>
            </div>

            {/* Why Me pitch */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                &ldquo;Why Me?&rdquo; pitch
              </p>
              <p className="text-sm text-pretty">{app.pitch}</p>
            </div>

            {/* Mock resume */}
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary">
                  {app.candidateName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <p className="font-display font-semibold">{app.candidateName}</p>
                  <p className="text-sm text-muted-foreground">
                    {app.primarySkill} Specialist
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-3 text-sm">
                {app.resumeSummary ? (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        AI Resume Summary
                      </p>
                      <p className="mt-1 text-pretty text-xs italic">
                        {app.resumeSummary.summary}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Candidate Strengths
                      </p>
                      <ul className="mt-1 space-y-1 text-xs">
                        {app.resumeSummary.strengths?.map((str: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-success" />
                            {str}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Optimization Areas
                      </p>
                      <ul className="mt-1 space-y-1 text-xs">
                        {app.resumeSummary.weaknesses?.map((weak: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <Clock className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                            {weak}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Parsed Skills
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {app.resumeSummary.skills?.map((s: string) => (
                          <Badge key={s} variant="outline">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Summary
                      </p>
                      <p className="mt-1 text-pretty">
                        Results-driven professional with a track record in{" "}
                        {app.primarySkill.toLowerCase()}. Known for shipping quickly
                        and raising the bar on quality.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Experience
                      </p>
                      <ul className="mt-1 space-y-1">
                        <li className="flex items-start gap-2">
                          <UserRound className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                          Senior role · 4 yrs · led cross-functional initiatives
                        </li>
                        <li className="flex items-start gap-2">
                          <UserRound className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                          Mid-level role · 3 yrs · owned core product surface
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Top Skills
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {[app.primarySkill, "Collaboration", "Ownership", "Communication"].map(
                          (s) => (
                            <Badge key={s} variant="outline">
                              {s}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Close
              </Button>
              {app.resumePdf && (
                <Button 
                  variant="default" 
                  className="flex-1 gap-1.5" 
                  onClick={() => {
                    const newWindow = window.open()
                    if (newWindow) {
                      newWindow.document.write(
                        `<iframe src="${app.resumePdf}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`
                      )
                    }
                  }}
                >
                  <FileText className="size-4" />
                  View Original PDF
                </Button>
              )}
            </div>
          </div>

          {/* Anonymous Chat Section */}
          {isChatEnabled && (
            <div className="flex flex-col justify-between h-full border-t pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-6">
              <h3 className="font-display text-base font-semibold mb-3 flex items-center gap-1.5">
                <MessageSquare className="size-4 text-primary" />
                Collaborate Anonymously
              </h3>
              <ChatBox applicationId={app.id} role="employee" />
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  )
}
