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
  Pencil,
  Trash2,
  Briefcase,
  AlertCircle
} from "lucide-react"
import { useState, useMemo, useEffect } from "react"

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
  type Job
} from "@/lib/marketplace-store"

type Tab = "post" | "review" | "manage"

export function EmployeeDashboard() {
  const [tab, setTab] = useState<Tab>("post")
  const { currentUser } = useMarketplace()

  const getInitials = () => {
    if (!currentUser?.name) return "E"
    return currentUser.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Employee Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Post roles, review candidate queues, and manage active listings.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-border bg-card px-2 py-1.5 pr-4 shadow-sm">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
            {getInitials()}
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
            { id: "manage", label: "Manage Postings", icon: Briefcase }
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
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

      {tab === "post" ? <PostRole onPosted={() => setTab("manage")} /> : null}
      {tab === "review" ? <CandidateReview /> : null}
      {tab === "manage" ? <ManagePostings /> : null}
    </div>
  )
}

/* ---------------- Post New Role ---------------- */

function PostRole({ onPosted }: { onPosted: () => void }) {
  const { postJob, currentUser } = useMarketplace()
  
  // Strict form fields (Requirement 2)
  const [companyName, setCompanyName] = useState(currentUser?.company || "")
  const [companyUrl, setCompanyUrl] = useState("")
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [workModel, setWorkModel] = useState<"remote" | "hybrid" | "on-site">("remote")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<Category>("Software Engineering")
  const [companySize, setCompanySize] = useState("50–200")
  const [stack, setStack] = useState("")
  const [bounty, setBounty] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [posted, setPosted] = useState(false)

  const validate = () => {
    const tempErrors: Record<string, string> = {}
    if (!companyName.trim()) tempErrors.companyName = "Company Name is required."
    if (!companyUrl.trim()) tempErrors.companyUrl = "Company Website URL is required."
    if (!title.trim() || title.trim().length < 3) tempErrors.title = "Job Title is required (min 3 chars)."
    if (!location.trim()) tempErrors.location = "Job Location is required."
    if (!workModel) tempErrors.workModel = "Work Model is required."
    if (!description.trim()) tempErrors.description = "Job Description & Requirements are required."
    if (!stack.trim() || stack.trim().length < 2) tempErrors.stack = "Required skills / stack are required."

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    const res = await postJob({
      title: title.trim(),
      category,
      companySize,
      stack: stack.trim(),
      bounty: bounty.trim() ? bounty.trim() : null,
      companyName: companyName.trim(),
      companyUrl: companyUrl.trim(),
      location: location.trim(),
      workModel,
      description: description.trim()
    })
    if (res.ok) {
      setTitle("")
      setStack("")
      setBounty("")
      setLocation("")
      setDescription("")
      setCompanyUrl("")
      setPosted(true)
      onPosted()
    }
  }

  const field = (hasError: boolean) => cn(
    "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 transition-colors",
    hasError ? "border-destructive focus-visible:ring-destructive/30" : "border-input"
  )

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
        <h2 className="font-display text-lg font-semibold">
          Post an anonymous opportunity
        </h2>
        <p className="mt-1 text-sm text-muted-foreground mb-6">
          Provide detailed requirements. It appears instantly in the seeker Job Feed under your anonymous handle.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Company Name */}
          <div>
            <label htmlFor="companyName" className="mb-1.5 block text-sm font-medium">
              Company Name <span className="text-destructive">*</span>
            </label>
            <input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Stripe"
              className={field(!!errors.companyName)}
            />
            {errors.companyName && (
              <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" /> {errors.companyName}
              </p>
            )}
          </div>

          {/* Company Website URL */}
          <div>
            <label htmlFor="companyUrl" className="mb-1.5 block text-sm font-medium">
              Company Website URL <span className="text-destructive">*</span>
            </label>
            <input
              id="companyUrl"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              placeholder="e.g. https://stripe.com"
              className={field(!!errors.companyUrl)}
            />
            {errors.companyUrl && (
              <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" /> {errors.companyUrl}
              </p>
            )}
          </div>

          {/* Job Title */}
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
              Job Title / Role <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className={field(!!errors.title)}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" /> {errors.title}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium">
              Category <span className="text-destructive">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={field(false)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Company Size */}
          <div>
            <label htmlFor="size" className="mb-1.5 block text-sm font-medium">
              Company Size
            </label>
            <select
              id="size"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className={field(false)}
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

          {/* Location */}
          <div>
            <label htmlFor="location" className="mb-1.5 block text-sm font-medium">
              Location (City, State/Country) <span className="text-destructive">*</span>
            </label>
            <input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className={field(!!errors.location)}
            />
            {errors.location && (
              <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" /> {errors.location}
              </p>
            )}
          </div>

          {/* Work Model */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Work Model <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-4 mt-2">
              {(["remote", "hybrid", "on-site"] as const).map((m) => (
                <label key={m} className="flex items-center gap-1.5 text-sm capitalize cursor-pointer select-none">
                  <input
                    type="radio"
                    name="workModel"
                    checked={workModel === m}
                    onChange={() => setWorkModel(m)}
                    className="text-primary focus:ring-ring"
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>

          {/* Required Skills */}
          <div className="sm:col-span-2">
            <label htmlFor="stack" className="mb-1.5 block text-sm font-medium">
              Required Skills / Tech Stack <span className="text-destructive">*</span>
            </label>
            <input
              id="stack"
              value={stack}
              onChange={(e) => setStack(e.target.value)}
              placeholder="e.g. React, TypeScript, GraphQL"
              className={field(!!errors.stack)}
            />
            {errors.stack && (
              <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" /> {errors.stack}
              </p>
            )}
          </div>

          {/* Bounty Pledge */}
          <div className="sm:col-span-2">
            <label htmlFor="bounty" className="mb-1.5 block text-sm font-medium">
              Bounty Pledge <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              id="bounty"
              value={bounty}
              onChange={(e) => setBounty(e.target.value)}
              placeholder="e.g. $500 Amazon Voucher or referral bonus cut"
              className={field(false)}
            />
          </div>

          {/* Job Description & Requirements */}
          <div className="sm:col-span-2">
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
              Job Description & Requirements <span className="text-destructive">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a summary of the role, responsibilities, and qualifications."
              className={field(!!errors.description)}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" /> {errors.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={submit}>
            <PlusCircle />
            Post Opportunity
          </Button>
        </div>
      </div>

      {/* Preview Card */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Live Feed Preview
        </h3>
        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{category}</Badge>
            {bounty.trim() ? (
              <Badge variant="bounty">
                <Gift className="size-3" />
                {bounty}
              </Badge>
            ) : null}
          </div>
          <p className="mt-3 font-display font-semibold text-base leading-tight">
            {title.trim() || "Job Role Title"}
          </p>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            {companyName.trim() || "Anonymous Company"} • {location.trim() || "City, State"}
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="text-[10px] uppercase font-bold">{workModel}</Badge>
            <Badge variant="outline" className="text-[10px]">{companySize} size</Badge>
          </div>
          <p className="mt-3 text-xs text-muted-foreground font-mono truncate">
            Skills: {stack.trim() || "Skills preview"}
          </p>
          {description.trim() && (
            <p className="mt-3 text-xs text-muted-foreground line-clamp-3 border-t border-border/60 pt-2 italic">
              {description}
            </p>
          )}
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
    Math.floor((Date.now() - app.appliedAt) / (1000 * 60 * 60))
  )

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-display text-sm font-semibold leading-tight">
          {app.candidateName}
        </h4>
        <Badge variant={matchVariant} className="text-[10px]">
          {app.matchScore}% Match
        </Badge>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{app.jobTitle}</p>

      {app.pitch && (
        <p className="mt-2 rounded bg-muted/30 px-2 py-1.5 text-xs italic text-muted-foreground line-clamp-2">
          &ldquo;{app.pitch}&rdquo;
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="size-3" />
          {hoursAgo}h ago
        </span>

        <div className="flex gap-1">
          <Button variant="outline" size="icon-sm" onClick={onViewResume} title="View Details & Chat">
            <MessageSquare className="size-3.5" />
          </Button>
          {app.status === "pending" && (
            <Button
              size="sm"
              onClick={() => updateApplicationStatus(app.id, "shortlisted")}
            >
              Shortlist
            </Button>
          )}
          {app.status === "shortlisted" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => updateApplicationStatus(app.id, "referred")}
            >
              Refer
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Manage My Postings (CRUD Dashboard) ---------------- */

function ManagePostings() {
  const { jobs, deleteJob, currentUser } = useMarketplace()
  const [editJob, setEditJob] = useState<Job | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const myJobs = useMemo(() => {
    if (!currentUser?.email) return []
    return jobs.filter((j) => j.postedByEmail?.toLowerCase() === currentUser.email.toLowerCase())
  }, [jobs, currentUser])

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="border-b border-border pb-4 mb-4 flex justify-between items-center">
        <div>
          <h2 className="font-display text-lg font-semibold">Active Referral Postings</h2>
          <p className="text-sm text-muted-foreground">Modify details or close active listings you created.</p>
        </div>
        <span className="text-xs font-semibold bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
          {myJobs.length} postings
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs uppercase font-medium">
              <th className="py-3 px-2">Role Opportunity</th>
              <th className="py-3 px-2">Location & Model</th>
              <th className="py-3 px-2">Stack / Skills</th>
              <th className="py-3 px-2">Bounty</th>
              <th className="py-3 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {myJobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground italic">
                  You haven't posted any referral opportunities yet.
                </td>
              </tr>
            ) : (
              myJobs.map((job) => {
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
                  <tr key={job.id} className="border-b border-border/60 hover:bg-muted/10">
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-3">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={`${companyName} logo`}
                            className="size-8 rounded-lg object-contain border border-border bg-white p-0.5"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 font-display font-bold text-primary border border-border text-[10px]">
                            {companyName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-primary text-[10px] uppercase tracking-wider">{companyName}</p>
                          <p className="font-bold text-foreground text-sm mt-0.5">{job.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{job.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-xs">
                      <p className="font-medium">{job.location}</p>
                      <Badge variant="outline" className="text-[10px] mt-1 capitalize font-semibold">{job.workModel}</Badge>
                    </td>
                  <td className="py-3.5 px-2 font-mono text-xs text-muted-foreground">
                    {job.stack}
                  </td>
                  <td className="py-3.5 px-2">
                    {job.bounty ? (
                      <Badge variant="bounty">{job.bounty}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </td>
                  <td className="py-3.5 px-2 text-right space-x-1 whitespace-nowrap">
                    <Button variant="outline" size="sm" onClick={() => setEditJob(job)} className="gap-1 cursor-pointer">
                      <Pencil className="size-3" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteId(job.id)} className="text-destructive hover:bg-destructive/10 cursor-pointer">
                      <Trash2 className="size-3" /> Delete
                    </Button>
                  </td>
                </tr>
              )
            })
          )}
          </tbody>
        </table>
      </div>

      {/* Edit Job Modal */}
      {editJob && (
        <EditJobModal job={editJob} onClose={() => setEditJob(null)} />
      )}

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <Modal
          open={true}
          onClose={() => setDeleteId(null)}
          title="Confirm Deletion"
          description="Are you sure you want to delete this job listing? This action cannot be undone."
          className="max-w-md"
        >
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await deleteJob(deleteId)
                setDeleteId(null)
              }}
              className="cursor-pointer"
            >
              Delete Listing
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ---------------- Edit Job Modal Component ---------------- */

function EditJobModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const { updateJob } = useMarketplace()

  const [companyName, setCompanyName] = useState(job.companyName || "")
  const [companyUrl, setCompanyUrl] = useState(job.companyUrl || "")
  const [title, setTitle] = useState(job.title || "")
  const [location, setLocation] = useState(job.location || "")
  const [workModel, setWorkModel] = useState<"remote" | "hybrid" | "on-site">(
    (job.workModel as "remote" | "hybrid" | "on-site") || "remote"
  )
  const [description, setDescription] = useState(job.description || "")
  const [category, setCategory] = useState<Category>(job.category || "Software Engineering")
  const [companySize, setCompanySize] = useState(job.companySize || "50–200")
  const [stack, setStack] = useState(job.stack || "")
  const [bounty, setBounty] = useState(job.bounty || "")

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const tempErrors: Record<string, string> = {}
    if (!companyName.trim()) tempErrors.companyName = "Company Name is required."
    if (!companyUrl.trim()) tempErrors.companyUrl = "Company Website URL is required."
    if (!title.trim() || title.trim().length < 3) tempErrors.title = "Job Title is required (min 3 chars)."
    if (!location.trim()) tempErrors.location = "Job Location is required."
    if (!workModel) tempErrors.workModel = "Work Model is required."
    if (!description.trim()) tempErrors.description = "Job Description & Requirements are required."
    if (!stack.trim() || stack.trim().length < 2) tempErrors.stack = "Required skills / stack are required."

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const save = async () => {
    if (!validate()) return
    setLoading(true)
    const res = await updateJob(job.id, {
      title: title.trim(),
      category,
      companySize,
      stack: stack.trim(),
      bounty: bounty.trim() ? bounty.trim() : null,
      companyName: companyName.trim(),
      companyUrl: companyUrl.trim(),
      location: location.trim(),
      workModel,
      description: description.trim()
    })
    setLoading(false)
    if (res.ok) {
      onClose()
    }
  }

  const field = (hasError: boolean) => cn(
    "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 transition-colors",
    hasError ? "border-destructive focus-visible:ring-destructive/30" : "border-input"
  )

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Edit Job Opportunity"
      description="Update listing fields and details below."
      className="max-w-2xl"
    >
      <div className="grid gap-4 sm:grid-cols-2 mt-4 max-h-[60vh] overflow-y-auto pr-1">
        {/* Company Name */}
        <div>
          <label htmlFor="editCompanyName" className="mb-1.5 block text-sm font-medium">
            Company Name <span className="text-destructive">*</span>
          </label>
          <input
            id="editCompanyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={field(!!errors.companyName)}
          />
          {errors.companyName && <p className="text-xs text-destructive mt-1">{errors.companyName}</p>}
        </div>

        {/* Company Website URL */}
        <div>
          <label htmlFor="editCompanyUrl" className="mb-1.5 block text-sm font-medium">
            Company Website URL <span className="text-destructive">*</span>
          </label>
          <input
            id="editCompanyUrl"
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            placeholder="e.g. https://stripe.com"
            className={field(!!errors.companyUrl)}
          />
          {errors.companyUrl && <p className="text-xs text-destructive mt-1">{errors.companyUrl}</p>}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="editTitle" className="mb-1.5 block text-sm font-medium">
            Job Title / Role <span className="text-destructive">*</span>
          </label>
          <input
            id="editTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={field(!!errors.title)}
          />
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="editCategory" className="mb-1.5 block text-sm font-medium">Category</label>
          <select
            id="editCategory"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className={field(false)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Company Size */}
        <div>
          <label htmlFor="editSize" className="mb-1.5 block text-sm font-medium">Company Size</label>
          <select
            id="editSize"
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
            className={field(false)}
          >
            {["1–10", "11–50", "50–200", "200–500", "500–1,000", "1,000–5,000", "5,000+"].map(
              (s) => <option key={s} value={s}>{s} employees</option>
            )}
          </select>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="editLocation" className="mb-1.5 block text-sm font-medium">
            Location <span className="text-destructive">*</span>
          </label>
          <input
            id="editLocation"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={field(!!errors.location)}
          />
          {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
        </div>

        {/* Work Model */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Work Model <span className="text-destructive">*</span></label>
          <div className="flex gap-4 mt-2">
            {(["remote", "hybrid", "on-site"] as const).map((m) => (
              <label key={m} className="flex items-center gap-1.5 text-sm capitalize cursor-pointer">
                <input
                  type="radio"
                  name="editWorkModel"
                  checked={workModel === m}
                  onChange={() => setWorkModel(m)}
                />
                {m}
              </label>
            ))}
          </div>
        </div>

        {/* Stack */}
        <div className="sm:col-span-2">
          <label htmlFor="editStack" className="mb-1.5 block text-sm font-medium">
            Required Stack <span className="text-destructive">*</span>
          </label>
          <input
            id="editStack"
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            className={field(!!errors.stack)}
          />
          {errors.stack && <p className="text-xs text-destructive mt-1">{errors.stack}</p>}
        </div>

        {/* Bounty */}
        <div className="sm:col-span-2">
          <label htmlFor="editBounty" className="mb-1.5 block text-sm font-medium">Bounty Pledge</label>
          <input
            id="editBounty"
            value={bounty}
            onChange={(e) => setBounty(e.target.value)}
            className={field(false)}
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="editDescription" className="mb-1.5 block text-sm font-medium">
            Description & Requirements <span className="text-destructive">*</span>
          </label>
          <textarea
            id="editDescription"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={field(!!errors.description)}
          />
          {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t mt-4">
        <Button variant="outline" onClick={onClose} disabled={loading} className="cursor-pointer">
          Cancel
        </Button>
        <Button onClick={save} disabled={loading} className="cursor-pointer">
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Modal>
  )
}

/* ---------------- Resume Details Modal (Real AI Summary) ---------------- */

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

            {/* Resume Summary */}
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
                {(app.aiSummary || app.resumeSummary) ? (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        AI Resume Summary
                      </p>
                      <p className="mt-1 text-pretty text-xs italic">
                        {(app.aiSummary || app.resumeSummary).summary}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Candidate Strengths
                      </p>
                      <ul className="mt-1 space-y-1 text-xs">
                        {(app.aiSummary || app.resumeSummary).strengths?.map((str: string, i: number) => (
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
                        {(app.aiSummary || app.resumeSummary).weaknesses?.map((weak: string, i: number) => (
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
                        {(app.aiSummary || app.resumeSummary).skills?.map((s: string) => (
                          <Badge key={s} variant="outline">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-muted-foreground italic">No AI Resume Summary is available for this application.</p>
                  </div>
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

/* ---------------- ChatBox ---------------- */

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
