"use client"

import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Coins,
  Eye,
  FileText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react"
import { useState } from "react"
import { CATEGORIES, type Category } from "@/lib/mock-data"
import { useApp } from "@/lib/app-context"
import type { View } from "@/components/navbar"

export function LandingPage({ onNavigate }: { onNavigate: (view: View) => void }) {
  const { expertise, setExpertise, resume, setResume } = useApp()
  const [showVerify, setShowVerify] = useState(false)

  const toggle = (cat: Category) =>
    setExpertise(
      expertise.includes(cat)
        ? expertise.filter((c) => c !== cat)
        : [...expertise, cat],
    )

  const canFindReferrals = resume != null && expertise.length > 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      {/* Split hero */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            <Eye className="size-3.5" /> For Job Seekers
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Get Referred. Skip the Line.
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Apply to anonymous listings backed by real employees. One click puts
            your profile in front of someone who can actually refer you.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-primary p-8 text-primary-foreground shadow-sm transition-shadow hover:shadow-md">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">
            <Coins className="size-3.5" /> For Employees
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Refer Talent. Earn Bonuses.
          </h1>
          <p className="mt-3 leading-relaxed text-primary-foreground/80">
            Post roles anonymously, review vetted candidates on a simple board,
            and cash in on your company&apos;s referral bonus program.
          </p>
        </div>
      </div>

      {/* Seeker onboarding flow */}
      <section className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h2 className="text-xl font-semibold">Start as a Job Seeker</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your resume and pick your expertise to see matching referral
          opportunities.
        </p>

        {/* Resume dropzone */}
        <ResumeDropzone resume={resume} onUpload={setResume} onRemoveAction={() => setResume(null)} />

        {/* Expertise multi-select */}
        <div className="mt-6">
          <p className="text-sm font-medium">Your expertise</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {CATEGORIES.map((cat) => {
              const active = expertise.includes(cat)
              return (
                <button
                  key={cat}
                  onClick={() => toggle(cat)}
                  aria-pressed={active}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => onNavigate("seeker")}
          disabled={!canFindReferrals}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Find Referrals
          <ArrowRight className="size-4" />
        </button>
        {!canFindReferrals && (
          <p className="mt-2 text-xs text-muted-foreground">
            Upload a resume and select at least one expertise to continue.
          </p>
        )}
      </section>

      {/* Employee flow */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Are you a corporate employee?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Post roles anonymously and earn referral bonuses.
            </p>
          </div>
          <button
            onClick={() => setShowVerify(true)}
            className="group inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            <ShieldCheck className="size-4 text-primary" />
            Enter as Employee
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {showVerify && (
        <VerificationModal
          onCloseAction={() => setShowVerify(false)}
          onVerifiedAction={() => {
            setShowVerify(false)
            onNavigate("employee")
          }}
        />
      )}
    </div>
  )
}

function ResumeDropzone({
  resume,
  onUpload,
  onRemoveAction,
}: {
  resume: { name: string; size: string } | null
  onUpload: (file: { name: string; size: string }) => void
  onRemoveAction: () => void
}) {
  if (resume) {
    return (
      <div className="mt-5 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              {resume.name}
              <CheckCircle2 className="size-4 text-primary" />
            </p>
            <p className="text-xs text-muted-foreground">
              {resume.size} &middot; Uploaded successfully
            </p>
          </div>
        </div>
        <button
          onClick={onRemoveAction}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Remove resume"
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => onUpload({ name: "Alex_Morgan_Resume.pdf", size: "248 KB" })}
      className="mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-secondary/40"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UploadCloud className="size-5" />
      </span>
      <span className="text-sm font-semibold">Drop your resume here</span>
      <span className="text-xs text-muted-foreground">
        PDF or DOCX, up to 5MB &middot; click to attach a sample file
      </span>
    </button>
  )
}

function VerificationModal({
  onCloseAction,
  onVerifiedAction,
}: {
  onCloseAction: () => void
  onVerifiedAction: () => void
}) {
  const [email, setEmail] = useState("")
  const [verified, setVerified] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Work email verification"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <h3 className="text-lg font-semibold">Work Email Verification</h3>
          </div>
          <button
            onClick={onCloseAction}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          To keep the marketplace trustworthy, employees must verify their
          corporate email. Your identity stays anonymous &mdash; we only confirm
          your domain.
        </p>

        <label className="mt-5 block text-sm font-medium" htmlFor="work-email">
          Work email
        </label>
        <input
          id="work-email"
          type="email"
          value={email}
          disabled={verified}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />

        {verified ? (
          <>
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
              <BadgeCheck className="size-5" />
              Domain Authenticated
            </div>
            <button
              onClick={onVerifiedAction}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Continue to Employee Dashboard
              <ArrowRight className="size-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setVerified(true)}
            disabled={!email.includes("@") || !email.includes(".")}
            className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send verification
          </button>
        )}
      </div>
    </div>
  )
}
