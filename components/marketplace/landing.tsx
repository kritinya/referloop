"use client"

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileText,
  Gift,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CATEGORIES, useMarketplace, type Category } from "@/lib/marketplace-store"

export function Landing() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <HeroBadge />
      <div className="grid gap-6 lg:grid-cols-2">
        <SeekerPanel />
        <EmployeePanel />
      </div>
      <TrustStrip />
    </div>
  )
}

function HeroBadge() {
  return (
    <div className="flex flex-col items-center py-10 text-center sm:py-14">
      <Badge variant="accent" className="mb-4">
        <Sparkles className="size-3" />
        The referral marketplace for insiders
      </Badge>
      <h1 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
        Get referred. Skip the line.
      </h1>
      <p className="mt-4 max-w-xl text-base text-muted-foreground text-pretty sm:text-lg">
        Backchannel connects job seekers with anonymous, verified employees
        inside top companies — who refer great talent and earn bounties.
      </p>
    </div>
  )
}

function SeekerPanel() {
  const { enterSeeker } = useMarketplace()
  const [resume, setResume] = useState<string | null>(null)
  const [expertise, setExpertise] = useState<Category[]>([])
  const [dragging, setDragging] = useState(false)

  const canContinue = resume !== null && expertise.length > 0

  const toggle = (c: Category) =>
    setExpertise((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    )

  const mockUpload = () => setResume("Alex_Morgan_Resume_2026.pdf")

  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileText className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold">Get Referred</h2>
          <p className="text-sm text-muted-foreground">
            Upload once, apply with one click.
          </p>
        </div>
      </div>

      {/* Resume dropzone */}
      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium">Resume</label>
        {resume ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-success/40 bg-success/10 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/20 text-success">
                <CheckCircle2 className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{resume}</p>
                <p className="text-xs text-muted-foreground">
                  Uploaded successfully
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Remove resume"
              onClick={() => setResume(null)}
            >
              <X />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={mockUpload}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              mockUpload()
            }}
            className={cn(
              "flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
              dragging
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/40 hover:border-primary/50 hover:bg-muted",
            )}
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="size-5" />
            </span>
            <span className="text-sm font-medium">
              Drop your resume or click to upload
            </span>
            <span className="text-xs text-muted-foreground">
              PDF or DOCX, up to 5MB
            </span>
          </button>
        )}
      </div>

      {/* Expertise multi-select */}
      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium">
          Your expertise{" "}
          <span className="text-muted-foreground">(select one or more)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = expertise.includes(c)
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggle(c)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {c}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Button
          size="lg"
          className="w-full"
          disabled={!canContinue}
          onClick={() => resume && enterSeeker(expertise, resume)}
        >
          Find Referrals
          <ArrowRight />
        </Button>
        {!canContinue ? (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Upload a resume and pick at least one expertise to continue.
          </p>
        ) : null}
      </div>
    </section>
  )
}

function EmployeePanel() {
  const { setView, verifiedEmail, setVerifiedEmail, addToast } = useMarketplace()
  const [step, setStep] = useState<"initial" | "email" | "code">("initial")
  const [emailInput, setEmailInput] = useState("")
  const [codeInput, setCodeInput] = useState("")
  const [codeError, setCodeError] = useState(false)
  const [loading, setLoading] = useState(false)

  const verified = verifiedEmail !== null

  const handleSendCode = async () => {
    if (!emailInput.trim() || !emailInput.includes("@")) {
      addToast("Please enter a valid work email address.", "error")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code.")
      }

      setCodeError(false)
      setStep("code")
      setCodeInput("")
      if (data.mock) {
        addToast(`[Mock Mode] Verification code generated: ${data.code}`, "info")
      } else {
        addToast("Verification code sent to your email!", "success")
      }
    } catch (err: any) {
      addToast(err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (codeInput.trim().length !== 6) {
      addToast("Please enter the 6-digit verification code.", "error")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/verify/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          code: codeInput.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCodeError(true)
        throw new Error(data.error || "Incorrect code. Please try again.")
      }

      setVerifiedEmail(emailInput.trim())
      setStep("initial")
      addToast("Email verified successfully!", "success")
    } catch (err: any) {
      addToast(err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setVerifiedEmail(null)
    setEmailInput("")
    setCodeInput("")
    setStep("initial")
  }

  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-bounty/25 text-bounty-foreground">
          <Gift className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold">Refer Talent</h2>
          <p className="text-sm text-muted-foreground">
            Post anonymously. Earn bonuses.
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {[
          {
            icon: ShieldCheck,
            title: "Stay anonymous",
            body: "Post roles behind an anonymous handle — your identity is never shown.",
          },
          {
            icon: Gift,
            title: "Pledge a bounty",
            body: "Attach a referral bounty to attract high-signal candidates.",
          },
          {
            icon: Sparkles,
            title: "AI-ranked applicants",
            body: "See match scores and micro-pitches before you spend a referral.",
          },
        ].map((item) => (
          <li key={item.title} className="flex gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <item.icon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground text-pretty">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Work email verification steps */}
      {verified ? (
        <div className="mt-6 rounded-xl border border-success/40 bg-success/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-success" />
              <span className="text-sm font-medium">Work email verification</span>
            </div>
            <Badge variant="success">
              <BadgeCheck className="size-3" />
              Domain Authenticated
            </Badge>
          </div>
          <p className="mt-3 text-xs text-success">
            {verifiedEmail} verified — domain matches a known employer.
          </p>
          <button
            onClick={handleLogout}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground underline block cursor-pointer"
          >
            Log out / Reset Email
          </button>
        </div>
      ) : step === "initial" ? (
        <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Work email verification</span>
            </div>
            <Badge variant="muted">Required</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => setStep("email")}
          >
            Verify work email
          </Button>
        </div>
      ) : step === "email" ? (
        <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Verify Work Domain</span>
            <button
              onClick={() => setStep("initial")}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="e.g. alex@stripe.com"
            className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
          <Button
            size="sm"
            className="w-full"
            onClick={handleSendCode}
            disabled={!emailInput.trim() || !emailInput.includes("@") || loading}
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </Button>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Enter 6-Digit Code</span>
            <button
              onClick={() => setStep("email")}
              disabled={loading}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Back
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Enter the 6-digit security code sent to {emailInput}.
          </p>
          <input
            type="text"
            maxLength={6}
            value={codeInput}
            disabled={loading}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="6-digit code"
            className={cn(
              "w-full text-center tracking-widest font-mono rounded-xl border px-3 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
              codeError ? "border-destructive text-destructive" : "border-input bg-background"
            )}
          />
          <Button
            size="sm"
            className="w-full"
            onClick={handleVerifyCode}
            disabled={codeInput.length !== 6 || loading}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
        </div>
      )}

      <div className="mt-auto pt-6">
        <Button
          size="lg"
          variant={verified ? "default" : "secondary"}
          className="w-full"
          disabled={!verified}
          onClick={() => setView("employee")}
        >
          Enter as Employee
          <ArrowRight />
        </Button>
        {!verified ? (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Verify your work email to unlock the employee dashboard.
          </p>
        ) : null}
      </div>
    </section>
  )
}

function TrustStrip() {
  const stats = [
    { value: "12k+", label: "Referrals made" },
    { value: "$1.4M", label: "Bounties paid" },
    { value: "3.2x", label: "Interview rate" },
    { value: "48h", label: "Avg. response" },
  ]
  return (
    <div className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <p className="font-display text-2xl font-bold text-primary">
            {s.value}
          </p>
          <p className="text-xs text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
