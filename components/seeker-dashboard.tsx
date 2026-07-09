"use client"

import {
  BellPlus,
  Building2,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  Gift,
  Layers,
  RefreshCw,
  SearchX,
  Trash2,
  UploadCloud,
  Users,
  XCircle,
  Zap,
} from "lucide-react"
import { useState } from "react"
import {
  type ApplicationStatus,
  type JobListing,
  type SeekerApplication,
} from "@/lib/mock-data"
import { MAX_TOKENS, useApp } from "@/lib/app-context"

type Tab = "feed" | "applications" | "profile"

export function SeekerDashboard() {
  const { listings, tokens, expertise, appliedIds, applyToJob } = useApp()
  const [tab, setTab] = useState<Tab>("feed")
  const [pitchJob, setPitchJob] = useState<JobListing | null>(null)

  const filtered =
    expertise.length > 0
      ? listings.filter((j) => expertise.includes(j.category))
      : listings

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Seeker Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Anonymous listings, one click away from a referral.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5">
          <Zap className="size-5 text-primary" fill="currentColor" />
          <div className="leading-tight">
            <p className="text-xs font-medium text-muted-foreground">
              Referral Tokens
            </p>
            <p className="text-sm font-semibold text-primary">
              Tokens Remaining: {tokens}/{MAX_TOKENS}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg border border-border bg-secondary p-1">
        <TabButton active={tab === "feed"} onClick={() => setTab("feed")}>
          Job Feed
        </TabButton>
        <TabButton
          active={tab === "applications"}
          onClick={() => setTab("applications")}
        >
          My Applications
        </TabButton>
        <TabButton active={tab === "profile"} onClick={() => setTab("profile")}>
          My Profile
        </TabButton>
      </div>

      {tab === "feed" && (
        <FeedTab
          jobs={filtered}
          appliedIds={appliedIds}
          tokens={tokens}
          onApply={setPitchJob}
        />
      )}
      {tab === "applications" && <ApplicationsTab />}
      {tab === "profile" && <ProfileTab />}

      {pitchJob && (
        <MicroPitchModal
          job={pitchJob}
          onCloseAction={() => setPitchJob(null)}
          onSubmitAction={(pitch) => {
            applyToJob(pitchJob.id, pitch)
            setPitchJob(null)
          }}
        />
      )}
    </div>
  )
}

function FeedTab({
  jobs,
  appliedIds,
  tokens,
  onApply,
}: {
  jobs: JobListing[]
  appliedIds: number[]
  tokens: number
  onApply: (job: JobListing) => void
}) {
  if (jobs.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <SearchX className="size-7" />
        </span>
        <h3 className="mt-4 text-lg font-semibold">No roles match your expertise yet</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          We&apos;ll notify you the moment a matching referral opportunity is
          posted by a verified employee.
        </p>
        <button className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
          <BellPlus className="size-4" />
          Set Alert
        </button>
      </div>
    )
  }

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => {
        const isApplied = appliedIds.includes(job.id)
        const stack = job.stack.split(",").map((s) => s.trim())
        return (
          <article
            key={job.id}
            className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Building2 className="size-3.5" />
                {job.industry}
              </span>
              {job.bounty && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <Gift className="size-3.5" />
                  {job.bounty}
                </span>
              )}
            </div>

            <h3 className="mt-3 text-lg font-semibold">{job.title}</h3>
            <p className="text-xs font-medium text-primary">{job.category}</p>

            <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="size-4 shrink-0 text-primary" />
                <span>{job.size}</span>
              </div>
              <div className="flex items-start gap-2">
                <Code2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{job.stack}</span>
              </div>
            </dl>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">{job.postedBy}</span>
              <button
                onClick={() => onApply(job)}
                disabled={isApplied || tokens <= 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isApplied ? (
                  <>
                    <CheckCircle2 className="size-4" /> Applied
                  </>
                ) : (
                  <>
                    <Zap className="size-4" /> 1-Click Apply (1 Token)
                  </>
                )}
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function ApplicationsTab() {
  const { seekerApps } = useApp()
  return (
    <div className="mt-6 space-y-3">
      {seekerApps.map((app) => (
        <ApplicationRow key={app.id} app={app} />
      ))}
    </div>
  )
}

function ProfileTab() {
  const { resume, setResume } = useApp()
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Resume</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        This is the resume shared with employees when you apply.
      </p>

      {resume ? (
        <div className="mt-5 flex flex-col gap-4 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{resume.name}</p>
              <p className="text-xs text-muted-foreground">
                {resume.size} &middot; PDF
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setResume({ name: "Alex_Morgan_Resume_v2.pdf", size: "252 KB" })
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold transition-colors hover:bg-secondary"
            >
              <RefreshCw className="size-3.5" />
              Update / Re-upload
            </button>
            <button
              onClick={() => setResume(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() =>
            setResume({ name: "Alex_Morgan_Resume.pdf", size: "248 KB" })
          }
          className="mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-secondary/40"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UploadCloud className="size-5" />
          </span>
          <span className="text-sm font-semibold">Upload a resume</span>
          <span className="text-xs text-muted-foreground">
            No resume on file &middot; click to attach a sample file
          </span>
        </button>
      )}
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

const statusStyles: Record<
  ApplicationStatus,
  { badge: string; icon: typeof Clock }
> = {
  "Pending Review": { badge: "bg-amber-100 text-amber-700", icon: Clock },
  Shortlisted: { badge: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  Referred: { badge: "bg-primary/15 text-primary", icon: CheckCircle2 },
  Declined: { badge: "bg-red-100 text-red-700", icon: XCircle },
}

function ApplicationRow({ app }: { app: SeekerApplication }) {
  const style = statusStyles[app.status]
  const Icon = style.icon
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <Layers className="size-5" />
        </span>
        <div>
          <p className="font-semibold">{app.roleTitle}</p>
          <p className="text-sm text-muted-foreground">{app.company}</p>
          {app.status === "Pending Review" && app.daysRemaining != null && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-600">
              <Clock className="size-3.5" />
              Auto-expires in {app.daysRemaining} days &mdash; Token will be
              refunded
            </p>
          )}
        </div>
      </div>
      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}
      >
        <Icon className="size-3.5" />
        {app.status}
      </span>
    </div>
  )
}

function MicroPitchModal({
  job,
  onCloseAction,
  onSubmitAction,
}: {
  job: JobListing
  onCloseAction: () => void
  onSubmitAction: (pitch: string) => void
}) {
  const [pitch, setPitch] = useState("")
  const MAX = 200
  const remaining = MAX - pitch.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Why me pitch"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Add your &quot;Why Me?&quot; pitch</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Applying to{" "}
              <span className="font-medium text-foreground">{job.title}</span>
            </p>
          </div>
          <button
            onClick={onCloseAction}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Close dialog"
          >
            <XCircle className="size-5" />
          </button>
        </div>

        <label htmlFor="pitch" className="mt-5 block text-sm font-medium">
          Your pitch
        </label>
        <textarea
          id="pitch"
          rows={4}
          value={pitch}
          maxLength={MAX}
          onChange={(e) => setPitch(e.target.value)}
          placeholder="In one or two lines, tell the referrer why you're a great fit..."
          className="mt-1.5 w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {remaining} characters left
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          <Zap className="size-4 text-primary" fill="currentColor" />
          This application costs 1 referral token.
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCloseAction}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmitAction(pitch)}
            disabled={pitch.trim().length === 0}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  )
}
