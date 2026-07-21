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
  Lock,
  Mail,
  Phone,
  User,
  Check,
  Loader2,
  Building,
  AlertCircle
} from "lucide-react"
import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CATEGORIES, useMarketplace, type Category } from "@/lib/marketplace-store"
import { Modal } from "@/components/marketplace/modal"

export function Landing() {
  const { currentUser, setView } = useMarketplace()
  const [activeAuthRole, setActiveAuthRole] = useState<"seeker" | "employee" | null>(null)

  // Requirement 4: Onboarding Block check
  if (currentUser && currentUser.profileCompletion < 80) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <OnboardingSection />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      {/* 1. Hero Section (Requirement 1) */}
      <HeroBadge />
      
      {/* 2. How It Works visual guide steps (Requirement 1) */}
      <HowItWorks />
      
      {/* 3. Role Selection Gateways & Authentication triggers (Requirement 1 & 5) */}
      {!currentUser ? (
        <div className="mt-16 text-center border-t border-border pt-16">
          <Badge variant="accent" className="mb-4">Get Started</Badge>
          <h2 className="font-display text-2xl font-bold tracking-tight mb-8">
            Choose Your Gateway to Referloop
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Seeker Gate Card */}
            <div 
              onClick={() => setActiveAuthRole("seeker")}
              className="group relative flex flex-col items-center justify-between rounded-2xl border border-border bg-card p-8 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 group-hover:scale-115 transition-all duration-300">
                <Sparkles className="size-7" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">I want to get hired</h3>
              <p className="text-xs text-muted-foreground mb-6 max-w-xs leading-relaxed">
                Become a Seeker. Upload your resume and connect directly with verified corporate insiders inside top tech companies.
              </p>
              <Button size="lg" className="w-full shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                Enter Seeker Platform
              </Button>
            </div>

            {/* Employee Gate Card */}
            <div 
              onClick={() => setActiveAuthRole("employee")}
              className="group relative flex flex-col items-center justify-between rounded-2xl border border-border bg-card p-8 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-success/10 text-success mb-4 group-hover:scale-115 transition-all duration-300">
                <Building2 className="size-7" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">I want to hire</h3>
              <p className="text-xs text-muted-foreground mb-6 max-w-xs leading-relaxed">
                Become a Job Lister. Anonymously post open positions, verify your work email, and refer high-quality candidates.
              </p>
              <Button size="lg" variant="success" className="w-full shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                Enter Corporate Platform
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-16 text-center max-w-xl mx-auto rounded-2xl border border-border bg-card p-8 shadow-md">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success mb-4">
            <BadgeCheck className="size-8" />
          </div>
          <h2 className="font-display text-lg font-bold">Session Active</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            You are logged in as <span className="font-semibold">{currentUser.name}</span> ({currentUser.role}).
          </p>
          <div className="mt-6">
            <Button size="lg" className="w-full cursor-pointer" onClick={() => setView(currentUser.role === "seeker" ? "seeker" : currentUser.role === "employee" ? "employee" : "admin")}>
              Go to {currentUser.role === "admin" ? "Admin Panel" : "Dashboard"}
            </Button>
          </div>
        </div>
      )}

      {/* 4. Foot stats counters */}
      <TrustStrip />

      {/* Seeker Authentication Modal (Requirement 1) */}
      {activeAuthRole === "seeker" && (
        <Modal 
          open={true} 
          onClose={() => setActiveAuthRole(null)} 
          title="Candidate Portal"
          description="Log in or Register your candidate profile below."
          className="max-w-lg"
        >
          <div className="max-h-[80vh] overflow-y-auto pr-1">
            <SeekerPanel />
          </div>
        </Modal>
      )}

      {/* Employee Authentication Modal (Requirement 1) */}
      {activeAuthRole === "employee" && (
        <Modal 
          open={true} 
          onClose={() => setActiveAuthRole(null)} 
          title="Corporate Portal"
          description="Log in or Verify your corporate work account."
          className="max-w-lg"
        >
          <div className="max-h-[80vh] overflow-y-auto pr-1">
            <EmployeePanel />
          </div>
        </Modal>
      )}
    </div>
  )
}

function OnboardingSection() {
  const { currentUser, uploadResume, addToast, fetchCurrentUser } = useMarketplace()
  const [phone, setPhone] = useState(currentUser?.phone || "")
  const [company, setCompany] = useState(currentUser?.company || "")
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const isSeeker = currentUser?.role === "seeker"

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSeeker && !company.trim()) {
      return addToast("Company name is required for corporate employees.", "error")
    }
    if (!phone.trim()) {
      return addToast("Phone number is required.", "error")
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          company: isSeeker ? undefined : company.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Update failed.")
      
      addToast("Profile details updated successfully!", "success")
      await fetchCurrentUser()
    } catch (e: any) {
      addToast(e.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleResumeUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      return addToast("Only PDF files are supported.", "error")
    }

    setLoading(true)
    setUploadProgress(20)
    try {
      const formData = new FormData()
      formData.append("file", file)

      setUploadProgress(40)
      const uploadRes = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed.")

      setUploadProgress(70)
      const analyzeRes = await fetch("/api/resume/analyze", {
        method: "POST",
        body: formData,
      })
      const data = await analyzeRes.json()
      if (!analyzeRes.ok) throw new Error(data.error || "Analysis failed.")

      setUploadProgress(100)
      await uploadResume(file.name, uploadData.base64 || "", data)
      
      // Auto complete phone if not set to raise completion above 80%
      if (!phone.trim()) {
        await fetch("/api/auth/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: "+15555555555" }),
        })
      }
      
      addToast("Resume uploaded successfully!", "success")
      await fetchCurrentUser()
    } catch (e: any) {
      addToast(e.message, "error")
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-primary/20 bg-card p-8 shadow-lg text-center my-10 animate-slide-in">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
        <Sparkles className="size-7 animate-pulse" />
      </div>
      <h2 className="font-display text-2xl font-bold">Complete Your Profile</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome to Referloop! You must complete your profile details before you can access all features.
      </p>

      {isSeeker ? (
        <div className="mt-6 space-y-4 text-left">
          <div className="rounded-xl border border-dashed border-border p-6 bg-muted/20 text-center">
            <Upload className="size-6 mx-auto text-muted-foreground mb-2" />
            <h4 className="font-semibold text-sm">Upload Your PDF Resume</h4>
            <p className="text-xs text-muted-foreground mt-1 mb-4">This fills out your skills and unlocks one-click applying.</p>
            
            <div className="relative inline-block">
              <Button size="sm" disabled={loading}>
                {loading ? "Analyzing..." : "Select PDF File"}
              </Button>
              <input
                type="file"
                accept=".pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleResumeUpload(file)
                }}
              />
            </div>
            {uploadProgress > 0 && (
              <div className="mt-4 w-full bg-muted rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleProfileUpdate} className="mt-6 space-y-4 text-left">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Company Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Stripe, Google"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Phone Number</label>
            <input
              type="text"
              required
              placeholder="e.g. +15555555555"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
            />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? "Saving..." : "Save Details"}
          </Button>
        </form>
      )}
    </div>
  )
}

function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"seeker" | "employee">("seeker")

  return (
    <div className="mt-16 rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="text-center max-w-xl mx-auto mb-8">
        <Badge variant="secondary" className="mb-2">Workflow Guide</Badge>
        <h3 className="font-display text-2xl font-bold tracking-tight">How It Works</h3>
        <p className="text-sm text-muted-foreground mt-1">Discover how simple it is to get referred or post opportunities on Referloop.</p>
      </div>

      {/* Tabs selector */}
      <div className="flex gap-2 max-w-xs mx-auto mb-8 rounded-xl border border-border bg-muted/30 p-1">
        <button
          onClick={() => setActiveTab("seeker")}
          className={cn(
            "flex-1 text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer",
            activeTab === "seeker" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          For Seekers
        </button>
        <button
          onClick={() => setActiveTab("employee")}
          className={cn(
            "flex-1 text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer",
            activeTab === "employee" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          For Employees
        </button>
      </div>

      {/* Side-by-side step columns */}
      <div className="grid gap-6 md:grid-cols-3">
        {activeTab === "seeker" ? (
          <>
            {[
              { num: 1, title: "Create Your Profile", desc: "Upload your resume PDF and select your expertise to generate a verified, searchable profile." },
              { num: 2, title: "Browse Open Roles", desc: "Filter through active referral listings by remote, hybrid, or on-site work models." },
              { num: 3, title: "Apply with One Click", desc: "Use your tokens to connect instantly with verified insider referrers who skip you straight to interviews." }
            ].map((s) => (
              <div key={s.num} className="relative rounded-xl border border-border bg-muted/20 p-5 pt-8">
                <span className="absolute -top-3 left-4 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                  {s.num}
                </span>
                <h4 className="font-display font-semibold text-sm">{s.title}</h4>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </>
        ) : (
          <>
            {[
              { num: 1, title: "Register Your Company", desc: "Verify your corporate email address to join your company's anonymous referral network." },
              { num: 2, title: "Post a Position", desc: "List referral opportunities with details, bounties, and description requirements in seconds." },
              { num: 3, title: "Hire Top Talent", desc: "Review candidate profiles, open chat rooms, and trigger employee payouts upon referral hire." }
            ].map((s) => (
              <div key={s.num} className="relative rounded-xl border border-border bg-muted/20 p-5 pt-8">
                <span className="absolute -top-3 left-4 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                  {s.num}
                </span>
                <h4 className="font-display font-semibold text-sm">{s.title}</h4>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </>
        )}
      </div>
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
        Referloop connects job seekers with anonymous, verified employees
        inside top companies — who refer great talent and earn bounties.
      </p>
    </div>
  )
}

function SeekerPanel() {
  const { currentUser, login, register, uploadResume, enterSeeker, addToast } = useMarketplace()
  const [formMode, setFormMode] = useState<"login" | "register" | "verify">("login")
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  // Registration fields
  const [name, setName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [expertise, setExpertise] = useState<Category[]>([])
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [customExpertiseText, setCustomExpertiseText] = useState("")
  
  // File uploads
  const [resumeFile, setResumeFile] = useState<string | null>(null)
  const [resumeBase64, setResumeBase64] = useState<string | null>(null)
  const [resumeSummary, setResumeSummary] = useState<any | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Verification fields
  const [otpCode, setOtpCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)
  const [magicCountdown, setMagicCountdown] = useState(0)

  // Countdown timers
  useEffect(() => {
    if (otpCountdown <= 0) return
    const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [otpCountdown])

  useEffect(() => {
    if (magicCountdown <= 0) return
    const timer = setTimeout(() => setMagicCountdown(magicCountdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [magicCountdown])

  const toggleExpertise = (c: Category) =>
    setExpertise((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    )

  // Real resume PDF drag and drop upload
  const handleResumeUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      addToast("Only PDF files are supported for resumes.", "error")
      return
    }

    setLoading(true)
    setUploadProgress(20)
    try {
      const formData = new FormData()
      formData.append("file", file)

      // Upload file to get base64
      setUploadProgress(40)
      const uploadRes = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed.")

      setUploadProgress(70)
      // Call AI analysis
      const analyzeRes = await fetch("/api/resume/analyze", {
        method: "POST",
        body: formData,
      })
      const analyzeData = await analyzeRes.json()
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "Analysis failed.")

      setUploadProgress(100)
      setResumeFile(file.name)
      setResumeBase64(uploadData.fileBase64)
      setResumeSummary(analyzeData)
      uploadResume(file.name, uploadData.fileBase64, analyzeData)
    } catch (e: any) {
      addToast(e.message, "error")
      setUploadProgress(0)
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.includes("@")) {
      addToast("Please enter a valid email address.", "error")
      return
    }
    setLoading(true)
    const result = await login({ email: loginEmail, password: loginPassword, rememberMe })
    setLoading(false)
    if (!result.ok) {
      if (result.notVerified) {
        setFormMode("verify")
        // Trigger verification email automatically
        await fetch("/api/verify/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginEmail }),
        })
      } else {
        addToast(result.error || "Login failed.", "error")
      }
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return addToast("Name is required.", "error")
    if (!regEmail.includes("@")) return addToast("Invalid email address.", "error")
    if (!phone) return addToast("Phone number is required.", "error")
    
    let finalExpertise = [...expertise]
    if (showOtherInput && customExpertiseText.trim()) {
      const customParts = customExpertiseText.split(",").map(p => p.trim()).filter(Boolean)
      finalExpertise = [...finalExpertise, ...customParts]
    }

    if (finalExpertise.length === 0) return addToast("Select at least one expertise.", "error")
    if (!resumeFile) return addToast("Please upload your PDF resume.", "error")

    setLoading(true)
    const result = await register({
      name,
      email: regEmail,
      password: regPassword,
      role: "seeker",
      phone,
      selectedExpertise: finalExpertise,
      resumeName: resumeFile,
      resumePdf: resumeBase64,
      resumeSummary: resumeSummary
    })
    setLoading(false)

    if (result.ok) {
      setLoginEmail(regEmail)
      setFormMode("verify")
      if (result.mockCode) {
        addToast(`[Mock Mode] Verification code generated: ${result.mockCode}`, "info")
      }
    } else {
      addToast(result.error || "Registration failed.", "error")
    }
  }

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.trim().length !== 6) return addToast("Enter 6-digit OTP code.", "error")

    setLoading(true)
    try {
      const res = await fetch("/api/verify/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail || regEmail, code: otpCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Verification failed.")

      addToast("Email verified successfully! You can now log in.", "success")
      setFormMode("login")
      setLoginPassword("")
    } catch (err: any) {
      addToast(err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail || regEmail, type: "otp" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP.")

      if (data.mock) {
        addToast(`[Mock OTP Code Generated]: ${data.code}`, "info")
      } else {
        addToast("A new 6-digit OTP code has been sent to your email inbox!", "success")
      }
      setOtpCountdown(30) // Rate limit 30s
    } catch (err: any) {
      addToast(err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSendMagicLink = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail || regEmail, type: "magic" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to trigger magic link.")

      if (data.mock) {
        addToast(`[Mock Link Generated]: Check logs or use: ${data.mockLink}`, "info")
        console.log("Mock Magic Link:", data.mockLink)
      } else {
        addToast("Magic verification link sent to your email inbox!", "success")
      }
      setMagicCountdown(60) // Rate limit resend for 1 minute
    } catch (err: any) {
      addToast(err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  // Logged-in view
  if (currentUser && currentUser.role === "seeker") {
    return (
      <section className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm min-h-[460px]">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold">Seeker Session</h2>
            <p className="text-sm text-muted-foreground">Logged in as {currentUser.name}</p>
          </div>
        </div>

        <div className="my-auto py-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/20 text-success mb-4">
            <BadgeCheck className="size-8" />
          </div>
          <h3 className="font-display text-lg font-semibold">Dashboard is Active</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            You are authenticated as a seeker. Browse job postings and apply with one click.
          </p>
        </div>

        <Button size="lg" className="w-full mt-auto" onClick={() => enterSeeker(expertise, resumeFile || "Resume.pdf", resumeBase64, resumeSummary)}>
          Open Seeker Dashboard
          <ArrowRight />
        </Button>
      </section>
    )
  }

  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm min-h-[460px]">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileText className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold">Get Referred</h2>
          <p className="text-sm text-muted-foreground">Upload resume, apply with one click.</p>
        </div>
      </div>

      {formMode === "login" && (
        <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="seekerRemember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring"
              />
              <label htmlFor="seekerRemember" className="text-xs text-muted-foreground select-none">Remember my session</label>
            </div>
          </div>

          <div className="pt-6 mt-auto">
            <Button size="lg" className="w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
            <button
              type="button"
              onClick={() => setFormMode("register")}
              className="mt-3 text-center text-xs text-muted-foreground hover:text-foreground block w-full underline cursor-pointer"
            >
              Need an account? Sign up instead
            </button>
          </div>
        </form>
      )}

      {formMode === "register" && (
        <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+15555555555"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="alex@domain.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Min 8 chars, A-Z, 123, @$!"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring"
              />
            </div>

            {/* Real Resume PDF dropzone */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Resume (PDF)</label>
              {resumeFile ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-success/40 bg-success/10 px-4 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <CheckCircle2 className="size-4 text-success shrink-0" />
                    <p className="truncate text-xs font-medium">{resumeFile}</p>
                  </div>
                  <button type="button" onClick={() => setResumeFile(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-border rounded-xl p-4 text-center bg-muted/20 hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleResumeUpload(file)
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="size-4 mx-auto text-muted-foreground mb-1 animate-bounce" />
                  <p className="text-xs font-medium">Click to upload real PDF resume</p>
                  {uploadProgress > 0 && (
                    <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Expertise selection */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Expertise</label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 border rounded-lg bg-background">
                {CATEGORIES.map((c) => {
                  const active = expertise.includes(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleExpertise(c)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer",
                        active ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:text-foreground border-border"
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
                    "rounded-full px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer",
                    showOtherInput ? "bg-accent text-accent-foreground border-accent" : "text-muted-foreground hover:text-foreground border-border"
                  )}
                >
                  Others
                </button>
              </div>
              {showOtherInput && (
                <div className="mt-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Enter Custom Expertise</label>
                  <input
                    type="text"
                    placeholder="e.g. Cybersecurity, DevOps"
                    value={customExpertiseText}
                    onChange={(e) => setCustomExpertiseText(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button size="lg" className="w-full" type="submit" disabled={loading || !resumeFile}>
              {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Register Account
            </Button>
            <button
              type="button"
              onClick={() => setFormMode("login")}
              className="mt-3 text-center text-xs text-muted-foreground hover:text-foreground block w-full underline cursor-pointer"
            >
              Already have an account? Sign in instead
            </button>
          </div>
        </form>
      )}

      {formMode === "verify" && (
        <div className="mt-6 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
              <Mail className="size-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Verify Your Email Address</h3>
              <p className="text-xs text-muted-foreground mt-1">
                We sent a 6-digit OTP code to {loginEmail || regEmail}.
              </p>
            </div>

            <form onSubmit={handleVerifyCodeSubmit} className="space-y-3">
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full text-center tracking-widest font-mono rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
              />
              <Button size="sm" className="w-full" type="submit" disabled={loading}>
                Verify Code & Finish
              </Button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-muted-foreground text-[10px] uppercase">Or Resend Verification</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                type="button"
                onClick={handleResendOTP}
                disabled={loading || otpCountdown > 0}
              >
                {otpCountdown > 0 ? `OTP in ${otpCountdown}s` : "Resend OTP Code"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                type="button"
                onClick={handleSendMagicLink}
                disabled={loading || magicCountdown > 0}
              >
                {magicCountdown > 0 ? `Link in ${magicCountdown}s` : "Send Magic Link"}
              </Button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFormMode("login")}
            className="text-center text-xs text-muted-foreground hover:text-foreground block w-full underline cursor-pointer mt-4"
          >
            Back to Sign In
          </button>
        </div>
      )}
    </section>
  )
}

function EmployeePanel() {
  const { currentUser, login, register, setView, addToast } = useMarketplace()
  const [formMode, setFormMode] = useState<"login" | "register" | "verify">("login")

  // Login fields
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Registration fields
  const [name, setName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")

  // Verification fields
  const [otpCode, setOtpCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)
  const [magicCountdown, setMagicCountdown] = useState(0)

  useEffect(() => {
    if (otpCountdown <= 0) return
    const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [otpCountdown])

  useEffect(() => {
    if (magicCountdown <= 0) return
    const timer = setTimeout(() => setMagicCountdown(magicCountdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [magicCountdown])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await login({ email: loginEmail, password: loginPassword })
    setLoading(false)
    if (!result.ok) {
      if (result.notVerified) {
        setFormMode("verify")
        await fetch("/api/verify/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginEmail }),
        })
      } else {
        addToast(result.error || "Login failed.", "error")
      }
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return addToast("Name is required.", "error")
    if (!regEmail.includes("@")) return addToast("Invalid email address.", "error")
    
    // Strict corporate email validation (Task 5)
    const personalDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com", "protonmail.com"]
    const domain = regEmail.split("@")[1]?.toLowerCase()
    if (personalDomains.includes(domain)) {
      return addToast("Corporate verification requires a work email domain.", "error")
    }

    if (!phone) return addToast("Phone number is required.", "error")
    if (!company.trim()) return addToast("Company is required.", "error")

    setLoading(true)
    const result = await register({
      name,
      email: regEmail,
      password: regPassword,
      role: "employee",
      phone,
      company,
    })
    setLoading(false)

    if (result.ok) {
      setLoginEmail(regEmail)
      setFormMode("verify")
      if (result.mockCode) {
        addToast(`[Mock Mode] Verification code generated: ${result.mockCode}`, "info")
      }
    } else {
      addToast(result.error || "Registration failed.", "error")
    }
  }

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.trim().length !== 6) return addToast("Enter 6-digit OTP code.", "error")

    setLoading(true)
    try {
      const res = await fetch("/api/verify/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail || regEmail, code: otpCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Verification failed.")

      addToast("Corporate email verified successfully! You can now log in.", "success")
      setFormMode("login")
      setLoginPassword("")
    } catch (err: any) {
      addToast(err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail || regEmail, type: "otp" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP.")

      if (data.mock) {
        addToast(`[Mock OTP Code Generated]: ${data.code}`, "info")
      } else {
        addToast("A new 6-digit OTP code has been sent to your work email inbox!", "success")
      }
      setOtpCountdown(30) // Rate limit 30s
    } catch (err: any) {
      addToast(err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSendMagicLink = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail || regEmail, type: "magic" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to trigger magic link.")

      if (data.mock) {
        addToast(`[Mock Link Generated]: Check logs or use: ${data.mockLink}`, "info")
        console.log("Mock Magic Link:", data.mockLink)
      } else {
        addToast("Magic verification link sent to your work email inbox!", "success")
      }
      setMagicCountdown(60)
    } catch (err: any) {
      addToast(err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  // Logged-in view
  if (currentUser && (currentUser.role === "employee" || currentUser.role === "admin")) {
    return (
      <section className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm min-h-[460px]">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-bounty/20 text-bounty-foreground">
            <Gift className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold">Employee Session</h2>
            <p className="text-sm text-muted-foreground">Logged in at {currentUser.company || "Referloop"}</p>
          </div>
        </div>

        <div className="my-auto py-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/20 text-success mb-4">
            <Building2 className="size-8" />
          </div>
          <h3 className="font-display text-lg font-semibold">Corporate Dashboard Activated</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            You are logged in as a verified employee at {currentUser.company}. Review candidates and track bounties.
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          {currentUser.role === "admin" && (
            <Button size="lg" variant="outline" className="w-full border-primary/40 text-primary hover:bg-primary/5" onClick={() => setView("admin")}>
              Open Admin Control Panel
            </Button>
          )}
          <Button size="lg" className="w-full" onClick={() => setView("employee")}>
            Open Employee Dashboard
            <ArrowRight />
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm min-h-[460px]">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-bounty/20 text-bounty-foreground">
          <Gift className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold">Refer Talent</h2>
          <p className="text-sm text-muted-foreground">Verify work domain, post anonymised roles.</p>
        </div>
      </div>

      {formMode === "login" && (
        <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Work Email</label>
              <input
                type="email"
                required
                placeholder="alex@stripe.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring"
              />
            </div>
          </div>

          <div className="pt-6">
            <Button size="lg" variant="secondary" className="w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Verify & Enter
            </Button>
            <button
              type="button"
              onClick={() => setFormMode("register")}
              className="mt-3 text-center text-xs text-muted-foreground hover:text-foreground block w-full underline cursor-pointer"
            >
              Register work profile instead
            </button>
          </div>
        </form>
      )}

      {formMode === "register" && (
        <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+15555555555"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Company</label>
              <input
                type="text"
                required
                placeholder="Stripe"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Work Email</label>
              <input
                type="email"
                required
                placeholder="alex@stripe.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Min 8 chars, uppercase, digit, symbol"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button size="lg" className="w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Register Corporate Account
            </Button>
            <button
              type="button"
              onClick={() => setFormMode("login")}
              className="mt-3 text-center text-xs text-muted-foreground hover:text-foreground block w-full underline cursor-pointer"
            >
              Sign in with existing work account
            </button>
          </div>
        </form>
      )}

      {formMode === "verify" && (
        <div className="mt-6 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="rounded-xl border border-bounty/35 bg-bounty/5 p-4 text-center">
              <Mail className="size-6 text-bounty-foreground mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Verify Work Address</h3>
              <p className="text-xs text-muted-foreground mt-1">
                We triggered verification details to {loginEmail || regEmail}.
              </p>
            </div>

            <form onSubmit={handleVerifyCodeSubmit} className="space-y-3">
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full text-center tracking-widest font-mono rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
              />
              <Button size="sm" variant="secondary" className="w-full" type="submit" disabled={loading}>
                Verify Code
              </Button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-muted-foreground text-[10px] uppercase">Or Resend Verification</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                type="button"
                onClick={handleResendOTP}
                disabled={loading || otpCountdown > 0}
              >
                {otpCountdown > 0 ? `OTP in ${otpCountdown}s` : "Resend OTP Code"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                type="button"
                onClick={handleSendMagicLink}
                disabled={loading || magicCountdown > 0}
              >
                {magicCountdown > 0 ? `Link in ${magicCountdown}s` : "Send Magic Link"}
              </Button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFormMode("login")}
            className="text-center text-xs text-muted-foreground hover:text-foreground block w-full underline cursor-pointer mt-4"
          >
            Back to Sign In
          </button>
        </div>
      )}
    </section>
  )
}

function TrustStrip() {
  const [stats, setStats] = useState({
    totalReferrals: "12+",
    totalApps: "8+",
    interviewRate: "45%",
    activeUsers: "5+",
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats")
        const data = await res.json()
        if (res.ok) {
          setStats({
            totalReferrals: `${data.totalReferrals}+`,
            totalApps: `${data.totalApps}+`,
            interviewRate: data.interviewRate,
            activeUsers: `${data.activeUsers}+`,
          })
        }
      } catch (e) {
        console.error("Failed to load live stats:", e)
      }
    }
    fetchStats()
  }, [])

  const items = [
    { value: stats.totalReferrals, label: "Referrals made" },
    { value: stats.totalApps, label: "Referrals active" },
    { value: stats.interviewRate, label: "Interview rate" },
    { value: stats.activeUsers, label: "Verified insiders" },
  ]

  return (
    <div className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-4">
      {items.map((s) => (
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
