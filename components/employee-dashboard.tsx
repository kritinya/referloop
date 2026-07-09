"use client"

import {
  AlarmClock,
  BadgeCheck,
  CheckCircle2,
  FileText,
  Gift,
  GraduationCap,
  Send,
  Sparkles,
  ThumbsUp,
  UserRound,
  X,
} from "lucide-react"
import { useState } from "react"
import {
  CATEGORIES,
  type Category,
  type CandidateApplication,
  type KanbanStatus,
} from "@/lib/mock-data"
import { useApp } from "@/lib/app-context"

type Tab = "post" | "review"

const columns: { key: KanbanStatus; label: string }[] = [
  { key: "New Applicant", label: "New Applicants" },
  { key: "Shortlisted", label: "Shortlisted" },
  { key: "Referred", label: "Referred" },
]

export function EmployeeDashboard() {
  const [tab, setTab] = useState<Tab>("review")

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Post roles anonymously and refer great candidates.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="flex items-center gap-1 text-sm font-semibold">
              Anonymous_Emp_01
              <BadgeCheck className="size-4 text-primary" />
            </p>
            <p className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              <BadgeCheck className="size-3" />
              Verified Employee &middot; @verified-domain.com
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg border border-border bg-secondary p-1">
        <TabButton active={tab === "review"} onClick={() => setTab("review")}>
          Candidate Review
        </TabButton>
        <TabButton active={tab === "post"} onClick={() => setTab("post")}>
          Post New Role
        </TabButton>
      </div>

      {tab === "review" ? <KanbanBoard /> : <PostRoleForm />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function KanbanBoard() {
  const { candidates, listings } = useApp()
  const [viewing, setViewing] = useState<CandidateApplication | null>(null)

  const roleTitle = (roleId: number) =>
    listings.find((j) => j.id === roleId)?.title ?? "Unknown Role"

  return (
    <>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {columns.map((col) => {
          const items = candidates.filter((c) => c.status === col.key)
          return (
            <div
              key={col.key}
              className="rounded-2xl border border-border bg-secondary/50 p-3"
            >
              <div className="flex items-center justify-between px-1 pb-3">
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                    No candidates yet
                  </p>
                ) : (
                  items.map((c) => (
                    <CandidateCard
                      key={c.id}
                      candidate={c}
                      roleTitle={roleTitle(c.roleId)}
                      onView={() => setViewing(c)}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {viewing && (
        <ResumeModal
          candidate={viewing}
          roleTitle={roleTitle(viewing.roleId)}
          onCloseAction={() => setViewing(null)}
        />
      )}
    </>
  )
}

function CandidateCard({
  candidate,
  roleTitle,
  onView,
}: {
  candidate: CandidateApplication
  roleTitle: string
  onView: () => void
}) {
  const { updateCandidateStatus } = useApp()
  const urgent = candidate.daysRemaining != null && candidate.daysRemaining <= 1
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {candidate.candidateName.charAt(0)}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{candidate.candidateName}</p>
            <p className="text-xs text-muted-foreground">{roleTitle}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3" />
          {candidate.matchScore}% Match
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {candidate.topSkills.map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={onView}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary"
        >
          <FileText className="size-3.5" />
          View Resume
        </button>
        {candidate.daysRemaining != null && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              urgent ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            <AlarmClock className="size-3.5" />
            Expires in {candidate.daysRemaining}d
          </span>
        )}
      </div>

      {/* Real-time stage actions */}
      <div className="mt-3 flex gap-2 border-t border-border pt-3">
        {candidate.status === "New Applicant" && (
          <button
            onClick={() => updateCandidateStatus(candidate.id, "Shortlisted")}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <ThumbsUp className="size-3.5" />
            Shortlist
          </button>
        )}
        {candidate.status === "Shortlisted" && (
          <button
            onClick={() => updateCandidateStatus(candidate.id, "Referred")}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Send className="size-3.5" />
            Refer to HR
          </button>
        )}
        {candidate.status === "Referred" && (
          <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary">
            <CheckCircle2 className="size-3.5" />
            Referred to HR
          </span>
        )}
      </div>
    </article>
  )
}

function ResumeModal({
  candidate,
  roleTitle,
  onCloseAction,
}: {
  candidate: CandidateApplication
  roleTitle: string
  onCloseAction: () => void
}) {
  const { updateCandidateStatus } = useApp()
  const { resume } = candidate
  const nextStage: KanbanStatus | null =
    candidate.status === "New Applicant"
      ? "Shortlisted"
      : candidate.status === "Shortlisted"
        ? "Referred"
        : null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Resume for ${candidate.candidateName}`}
    >
      <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
              {candidate.candidateName.charAt(0)}
            </span>
            <div className="leading-tight">
              <p className="flex items-center gap-1.5 text-base font-semibold">
                {candidate.candidateName}
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  <Sparkles className="size-3" />
                  {candidate.matchScore}% Match
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Applying to {roleTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onCloseAction}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Why Me pitch */}
        <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            &quot;Why Me?&quot; Pitch
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">
            {candidate.whyMe}
          </p>
        </div>

        {/* Mock resume */}
        <div className="mt-5 rounded-xl border border-border bg-background p-4">
          <p className="text-sm font-semibold">{resume.headline}</p>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Experience
            </p>
            <ul className="mt-2 space-y-2">
              {resume.experience.map((exp) => (
                <li key={exp.role} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    <span className="font-medium">{exp.role}</span> &middot;{" "}
                    {exp.company}
                    <span className="block text-xs text-muted-foreground">
                      {exp.period}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Skills
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {resume.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Education
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-sm">
              <GraduationCap className="size-4 text-primary" />
              {resume.education}
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCloseAction}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Close
          </button>
          {nextStage ? (
            <button
              onClick={() => {
                updateCandidateStatus(candidate.id, nextStage)
                onCloseAction()
              }}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {nextStage === "Shortlisted" ? "Shortlist Candidate" : "Refer to HR"}
            </button>
          ) : (
            <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary">
              <CheckCircle2 className="size-4" />
              Referred to HR
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function PostRoleForm() {
  const { addListing } = useApp()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<Category>(CATEGORIES[0])
  const [industry, setIndustry] = useState("")
  const [size, setSize] = useState("")
  const [skills, setSkills] = useState("")
  const [bounty, setBounty] = useState("")
  const [posted, setPosted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addListing({
      title: title.trim(),
      category,
      industry: industry.trim() || "Undisclosed",
      size: size.trim() || "Not specified",
      stack: skills.trim() || "Various",
      bounty: bounty.trim() ? bounty.trim() : null,
    })
    setPosted(true)
    setTitle("")
    setIndustry("")
    setSize("")
    setSkills("")
    setBounty("")
    setCategory(CATEGORIES[0])
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      {posted && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
          <CheckCircle2 className="size-5" />
          Opportunity posted &mdash; it&apos;s now live in the seeker job feed.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium">
            Job Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="industry" className="text-sm font-medium">
            Industry
          </label>
          <input
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. E-Commerce"
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="size" className="text-sm font-medium">
            Company Size
          </label>
          <input
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="e.g. 1000-5000 employees"
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-1.5">
        <label htmlFor="skills" className="text-sm font-medium">
          Required Skills / Tech Stack
        </label>
        <input
          id="skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g. React, Node.js, AWS"
          className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="mt-5 flex flex-col gap-1.5">
        <label htmlFor="bounty" className="flex items-center gap-1.5 text-sm font-medium">
          <Gift className="size-4 text-primary" />
          Bounty Pledge <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="bounty"
          value={bounty}
          onChange={(e) => setBounty(e.target.value)}
          placeholder="e.g. $50 Gift Card"
          className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <button
        type="submit"
        className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
      >
        Post Opportunity
      </button>
    </form>
  )
}
