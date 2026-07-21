import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react"

export const CATEGORIES = [
  "Software Engineering",
  "Data & AI",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
] as const

export type Category = (typeof CATEGORIES)[number] | string

export const STATUS_LABELS = {
  pending: { seeker: "Requested", employee: "Review" },
  shortlisted: { seeker: "Shortlisted", employee: "Accepted" },
  referred: { seeker: "Referred", employee: "Referred" },
  rejected: { seeker: "Rejected", employee: "Rejected" },
} as const

export type Job = {
  id: number
  title: string
  category: Category
  industry: string
  companySize: string
  stack: string
  postedBy: string
  postedByEmail?: string
  bounty: string | null
  jdFileName?: string | null
  jdFileBase64?: string | null
  rules?: string | null
  expiresAt: number
  companyName?: string
  companyUrl?: string
  location?: string
  workModel?: "remote" | "hybrid" | "on-site" | string
  description?: string
}

export type ApplicationStatus = "pending" | "shortlisted" | "referred" | "rejected"

export type Application = {
  id: number
  jobId: number
  jobTitle: string
  category: Category
  candidateName: string
  candidateEmail: string
  primarySkill: string
  pitch: string
  matchScore: number
  status: ApplicationStatus
  appliedAt: number
  resumePdf?: string | null
  resumeName?: string | null
  coverLetterPdf?: string | null
  coverLetterName?: string | null
  aiSummary?: any
  resumeSummary?: any
}

export type Message = {
  id: number
  applicationId: number
  sender: "seeker" | "employee"
  senderRole?: "seeker" | "employee"
  text: string
  timestamp: number
}

export type Toast = {
  id: number
  message: string
  type: "success" | "info" | "error"
}

export type View = "home" | "seeker" | "employee" | "admin"

type MarketplaceState = {
  view: View
  setView: (v: View) => void

  jobs: Job[]
  applications: Application[]

  // Auth State
  currentUser: any | null
  fetchCurrentUser: () => Promise<void>
  login: (credentials: any) => Promise<{ ok: boolean; error?: string; notVerified?: boolean }>
  register: (data: any) => Promise<{ ok: boolean; error?: string; mockCode?: string }>
  logout: () => Promise<void>

  // Seeker State
  tokensRemaining: number
  maxTokens: number
  resumeName: string | null
  resumePdf: string | null
  resumeSummary: any | null
  selectedExpertise: Category[]

  setSelectedExpertise: (c: Category[]) => void
  uploadResume: (name: string, pdfBase64: string, summary: any) => void
  deleteResume: () => void
  enterSeeker: (expertise: Category[], resume: string, resumePdfVal: string | null, resumeSummaryVal: any | null) => void

  applyToJob: (jobId: number, pitch: string) => Promise<{ ok: boolean; reason?: string }>
  hasApplied: (jobId: number) => boolean

  postJob: (input: {
    title: string
    category: Category
    companySize: string
    stack: string
    bounty: string | null
    jdFileName?: string | null
    jdFileBase64?: string | null
    rules?: string | null
    companyName: string
    companyUrl: string
    location: string
    workModel: "remote" | "hybrid" | "on-site"
    description: string
  }) => Promise<{ ok: boolean; error?: string }>
  updateJob: (id: number, input: {
    title: string
    category: Category
    companySize: string
    stack: string
    bounty: string | null
    jdFileName?: string | null
    jdFileBase64?: string | null
    rules?: string | null
    companyName: string
    companyUrl: string
    location: string
    workModel: "remote" | "hybrid" | "on-site"
    description: string
  }) => Promise<{ ok: boolean; error?: string }>
  deleteJob: (id: number) => Promise<{ ok: boolean; error?: string }>
  updateApplicationStatus: (id: number, status: ApplicationStatus) => Promise<void>

  // Verified Email (compatibility wrapper)
  verifiedEmail: string | null
  setVerifiedEmail: (email: string | null) => void

  // Messages
  messages: Message[]
  sendMessage: (applicationId: number, sender: "seeker" | "employee", text: string) => Promise<void>
  loadMessages: (applicationId: number) => Promise<void>

  // Toasts
  toasts: Toast[]
  addToast: (message: string, type?: "success" | "info" | "error") => void
  removeToast: (id: number) => void

  // Confetti
  confettiTrigger: number
  triggerConfetti: () => void

  // Admin Data
  adminData: any | null
  fetchAdminData: () => Promise<void>
  updateUserByAdmin: (email: string, verified: boolean, role: string) => Promise<void>

  // Operations
  loadJobs: (params?: { query?: string; category?: string; sortBy?: string; bountiesOnly?: boolean }) => Promise<void>
  loadApplications: () => Promise<void>
}

const MarketplaceContext = createContext<MarketplaceState | null>(null)

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("home")
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [currentUser, setCurrentUser] = useState<any | null>(null)

  // Seeker states
  const [tokensRemaining, setTokensRemaining] = useState(5)
  const maxTokens = 5
  const [resumeName, setResumeName] = useState<string | null>(null)
  const [resumePdf, setResumePdf] = useState<string | null>(null)
  const [resumeSummary, setResumeSummary] = useState<any | null>(null)
  const [selectedExpertise, setSelectedExpertise] = useState<Category[]>([])

  // Compatibility email verified state
  const [verifiedEmail, setVerifiedEmailState] = useState<string | null>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confettiTrigger, setConfettiTrigger] = useState(0)
  const [adminData, setAdminData] = useState<any | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // 1. Fetch authenticated user details
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      if (data.authenticated) {
        setCurrentUser(data.user)
        setVerifiedEmailState(data.user.role === "employee" ? data.user.email : null)
        if (data.user.role === "seeker") {
          setTokensRemaining(data.user.tokensRemaining !== undefined ? data.user.tokensRemaining : 5)
        }
      } else {
        setCurrentUser(null)
        setVerifiedEmailState(null)
      }
    } catch (e) {
      console.error("Failed to fetch session:", e)
    } finally {
      setHydrated(true)
    }
  }

  // 2. Fetch jobs postings from backend
  const loadJobs = async (params?: { query?: string; category?: string; sortBy?: string; bountiesOnly?: boolean }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.query) queryParams.set("query", params.query)
      if (params?.category) queryParams.set("category", params.category)
      if (params?.sortBy) queryParams.set("sortBy", params.sortBy)
      if (params?.bountiesOnly) queryParams.set("bountiesOnly", String(params.bountiesOnly))

      const res = await fetch(`/api/jobs?${queryParams.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setJobs(data.jobs || [])
      }
    } catch (e) {
      console.error("Failed to load listings:", e)
    }
  }

  // 3. Fetch applications queue
  const loadApplications = async () => {
    try {
      const res = await fetch("/api/applications")
      const data = await res.json()
      if (res.ok) {
        setApplications(data.applications || [])
      }
    } catch (e) {
      console.error("Failed to load applications:", e)
    }
  }

  // 4. Fetch admin statistics
  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin")
      const data = await res.json()
      if (res.ok) {
        setAdminData(data)
      }
    } catch (e) {
      console.error("Failed to load admin stats:", e)
    }
  }

  const updateUserByAdmin = async (email: string, verified: boolean, role: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verified, role }),
      })
      const data = await res.json()
      if (res.ok) {
        addToast("User configuration updated by admin.", "success")
        fetchAdminData()
      } else {
        addToast(data.error || "Failed to update user.", "error")
      }
    } catch (e: any) {
      addToast(e.message, "error")
    }
  }

  // 5. Fetch messages for an application
  const loadMessages = async (applicationId: number) => {
    try {
      const res = await fetch(`/api/messages?applicationId=${applicationId}`)
      const data = await res.json()
      if (res.ok) {
        setMessages(data.messages || [])
      }
    } catch (e) {
      console.error("Failed to load messages:", e)
    }
  }

  // Initialize
  useEffect(() => {
    fetchCurrentUser()
    loadJobs()
  }, [])

  // Dynamic Polling for real-time updates (Task 14)
  useEffect(() => {
    if (!currentUser) return
    loadApplications()

    const interval = setInterval(() => {
      loadApplications()
    }, 5000)

    return () => clearInterval(interval)
  }, [currentUser])

  const addToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const triggerConfetti = () => {
    setConfettiTrigger((prev) => prev + 1)
  }

  const protectedSetView = (v: View) => {
    if (currentUser?.role === "admin") {
      setView(v)
      return
    }

    if (v === "employee") {
      if (!currentUser) {
        addToast("Please sign in to access the Employee dashboard.", "info")
        setView("home")
        return
      }
      if (currentUser.role !== "employee") {
        addToast("Access Denied: Only verified Employees can access the Employee dashboard.", "error")
        setView("seeker")
        return
      }
    }

    if (v === "seeker") {
      if (!currentUser) {
        addToast("Please sign in to access the Seeker dashboard.", "info")
        setView("home")
        return
      }
      if (currentUser.role !== "seeker") {
        addToast("Access Denied: Only Seekers can access the Seeker dashboard.", "error")
        setView("employee")
        return
      }
    }

    if (v === "admin") {
      if (currentUser?.role !== "admin") {
        addToast("Access Denied: Admin privileges required.", "error")
        setView("home")
        return
      }
    }

    setView(v)
  }

  const value = useMemo<MarketplaceState>(() => {
    const hasApplied = (jobId: number) =>
      applications.some((a) => a.jobId === jobId)

    const setVerifiedEmail = (email: string | null) => {
      setVerifiedEmailState(email)
    }

    return {
      view,
      setView: protectedSetView,
      jobs,
      applications,
      currentUser,
      fetchCurrentUser,
      login: async (credentials) => {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        })
        const data = await res.json()
        if (res.ok) {
          addToast("Welcome back to Referloop!", "success")
          await fetchCurrentUser()
          return { ok: true }
        }
        return { ok: false, error: data.error, notVerified: data.notVerified }
      },
      register: async (regData) => {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(regData),
        })
        const data = await res.json()
        if (res.ok) {
          addToast("Account registered! Please check your email.", "success")
          return { ok: true, mockCode: data.mockCode }
        }
        return { ok: false, error: data.error }
      },
      logout: async () => {
        await fetch("/api/auth/logout", { method: "POST" })
        addToast("Logged out successfully.", "info")
        setCurrentUser(null)
        setVerifiedEmailState(null)
        setView("home")
      },
      tokensRemaining,
      maxTokens,
      resumeName,
      resumePdf,
      resumeSummary,
      selectedExpertise,
      setSelectedExpertise,
      uploadResume: async (name, pdfBase64, summary) => {
        setResumeName(name)
        setResumePdf(pdfBase64)
        setResumeSummary(summary)
        addToast(`Resume "${name}" analyzed successfully!`, "success")
        
        // Sync with backend profile
        try {
          await fetch("/api/auth/me", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resumeName: name,
              resumePdf: pdfBase64,
              resumeSummary: summary,
              aiSummary: summary
            })
          })
        } catch (e) {
          console.error("Failed to sync resume with profile:", e)
        }
      },
      deleteResume: async () => {
        setResumeName(null)
        setResumePdf(null)
        setResumeSummary(null)
        addToast("Resume removed.", "info")
        
        // Remove from profile
        try {
          await fetch("/api/auth/me", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resumeName: null,
              resumePdf: null,
              resumeSummary: null,
              aiSummary: null
            })
          })
        } catch (e) {
          console.error("Failed to clear resume from profile:", e)
        }
      },
      enterSeeker: (expertise, resume, resumePdfVal, resumeSummaryVal) => {
        setSelectedExpertise(expertise)
        setResumeName(resume)
        setResumePdf(resumePdfVal)
        setResumeSummary(resumeSummaryVal)
        setView("seeker")
      },
      hasApplied,
      applyToJob: async (jobId, pitch) => {
        try {
          const res = await fetch("/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobId,
              pitch,
              resumePdf,
              resumeName,
              resumeSummary,
              aiSummary: resumeSummary
            }),
          })
          const data = await res.json()
          if (!res.ok) {
            addToast(data.error || "Failed to submit application.", "error")
            return { ok: false, reason: data.error }
          }
          addToast("Referral application submitted successfully!", "success")
          await loadApplications()
          await fetchCurrentUser() // Refresh tokens remaining
          return { ok: true }
        } catch (e: any) {
          addToast(e.message, "error")
          return { ok: false, reason: e.message }
        }
      },
      postJob: async (jobInput) => {
        try {
          const res = await fetch("/api/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jobInput),
          })
          const data = await res.json()
          if (!res.ok) {
            addToast(data.error || "Failed to publish listing.", "error")
            return { ok: false, error: data.error }
          }
          addToast("Referral opportunity posted anonymously!", "success")
          await loadJobs()
          return { ok: true }
        } catch (e: any) {
          addToast(e.message, "error")
          return { ok: false, error: e.message }
        }
      },
      updateJob: async (id, jobInput) => {
        try {
          const res = await fetch("/api/jobs", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...jobInput }),
          })
          const data = await res.json()
          if (!res.ok) {
            addToast(data.error || "Failed to update listing.", "error")
            return { ok: false, error: data.error }
          }
          addToast("Listing updated successfully!", "success")
          await loadJobs()
          return { ok: true }
        } catch (e: any) {
          addToast(e.message, "error")
          return { ok: false, error: e.message }
        }
      },
      deleteJob: async (id) => {
        try {
          const res = await fetch(`/api/jobs?id=${id}`, {
            method: "DELETE",
          })
          const data = await res.json()
          if (!res.ok) {
            addToast(data.error || "Failed to delete listing.", "error")
            return { ok: false, error: data.error }
          }
          addToast("Listing deleted successfully.", "info")
          await loadJobs()
          return { ok: true }
        } catch (e: any) {
          addToast(e.message, "error")
          return { ok: false, error: e.message }
        }
      },
      updateApplicationStatus: async (id, status) => {
        try {
          const res = await fetch("/api/applications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
          })
          const data = await res.json()
          if (res.ok) {
            addToast(`Candidate moved to ${status}.`, "success")
            if (status === "referred") {
              triggerConfetti()
            }
            await loadApplications()
          } else {
            addToast(data.error || "Failed to update status.", "error")
          }
        } catch (e: any) {
          addToast(e.message, "error")
        }
      },
      verifiedEmail,
      setVerifiedEmail,
      messages,
      sendMessage: async (applicationId, sender, text) => {
        try {
          const res = await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ applicationId, text }),
          })
          const data = await res.json()
          if (res.ok) {
            await loadMessages(applicationId)
          } else {
            addToast(data.error || "Failed to send message.", "error")
          }
        } catch (e: any) {
          addToast(e.message, "error")
        }
      },
      loadMessages,
      toasts,
      addToast,
      removeToast,
      confettiTrigger,
      triggerConfetti,
      adminData,
      fetchAdminData,
      updateUserByAdmin,
      loadJobs,
      loadApplications,
    }
  }, [
    view,
    jobs,
    applications,
    currentUser,
    tokensRemaining,
    resumeName,
    resumePdf,
    resumeSummary,
    selectedExpertise,
    verifiedEmail,
    messages,
    toasts,
    confettiTrigger,
    adminData,
  ])

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  )
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext)
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider")
  }
  return context
}
