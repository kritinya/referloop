"use client"

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

export type Category = (typeof CATEGORIES)[number]

export type Job = {
  id: number
  title: string
  category: Category
  industry: string
  companySize: string
  stack: string
  postedBy: string
  bounty: string | null
}

export type ApplicationStatus = "pending" | "shortlisted" | "referred"

export type Application = {
  id: number
  jobId: number
  jobTitle: string
  category: Category
  candidateName: string
  primarySkill: string
  pitch: string
  matchScore: number
  status: ApplicationStatus
  appliedAt: number // timestamp (ms)
}

export type Message = {
  id: number
  applicationId: number
  sender: "seeker" | "employee"
  text: string
  timestamp: number
}

export type Toast = {
  id: number
  message: string
  type: "success" | "info" | "error"
}

export type View = "home" | "seeker" | "employee"

type MarketplaceState = {
  view: View
  setView: (v: View) => void

  jobs: Job[]
  applications: Application[]

  // seeker
  tokensRemaining: number
  maxTokens: number
  resumeName: string | null
  selectedExpertise: Category[]
  seekerName: string

  setSelectedExpertise: (c: Category[]) => void
  uploadResume: (name: string) => void
  deleteResume: () => void
  enterSeeker: (expertise: Category[], resume: string) => void

  applyToJob: (jobId: number, pitch: string) => { ok: boolean; reason?: string }
  hasApplied: (jobId: number) => boolean

  // employee
  postJob: (input: {
    title: string
    category: Category
    companySize: string
    stack: string
    bounty: string | null
  }) => void
  updateApplicationStatus: (id: number, status: ApplicationStatus) => void

  // verified email
  verifiedEmail: string | null
  setVerifiedEmail: (email: string | null) => void

  // messages
  messages: Message[]
  sendMessage: (applicationId: number, sender: "seeker" | "employee", text: string) => void

  // toasts
  toasts: Toast[]
  addToast: (message: string, type?: "success" | "info" | "error") => void
  removeToast: (id: number) => void

  // confetti trigger
  confettiTrigger: number
  triggerConfetti: () => void
}

const MarketplaceContext = createContext<MarketplaceState | null>(null)

const INITIAL_JOBS: Job[] = [
  {
    id: 1,
    title: "Backend SDE II",
    category: "Software Engineering",
    industry: "E-Commerce",
    companySize: "1,000–5,000",
    stack: "Node.js, Postgres",
    postedBy: "Anon_01",
    bounty: "$50 Amazon Card",
  },
  {
    id: 2,
    title: "LLM Researcher",
    category: "Data & AI",
    industry: "AI Startup",
    companySize: "11–50",
    stack: "Python, PyTorch",
    postedBy: "Anon_02",
    bounty: null,
  },
  {
    id: 3,
    title: "Growth Product Manager",
    category: "Product",
    industry: "Fintech",
    companySize: "200–500",
    stack: "Mixpanel, Jira",
    postedBy: "Anon_03",
    bounty: "$100 Bonus",
  },
  {
    id: 4,
    title: "Senior UX Researcher",
    category: "Design",
    industry: "SaaS",
    companySize: "500–1,000",
    stack: "Figma, UserTesting",
    postedBy: "Anon_04",
    bounty: null,
  },
  {
    id: 5,
    title: "Performance Marketing Lead",
    category: "Marketing",
    industry: "D2C Retail",
    companySize: "50–200",
    stack: "Meta Ads, GA4",
    postedBy: "Anon_05",
    bounty: null,
  },
  {
    id: 6,
    title: "Enterprise Account Executive",
    category: "Sales",
    industry: "Cloud Infrastructure",
    companySize: "5,000+",
    stack: "Salesforce, Outreach",
    postedBy: "Anon_06",
    bounty: "$200 Gift Card",
  },
  {
    id: 7,
    title: "FP&A Analyst",
    category: "Finance",
    industry: "Banking",
    companySize: "5,000+",
    stack: "Excel, Tableau",
    postedBy: "Anon_07",
    bounty: null,
  },
  {
    id: 8,
    title: "Supply Chain Manager",
    category: "Operations",
    industry: "Logistics",
    companySize: "1,000–5,000",
    stack: "SAP, SQL",
    postedBy: "Anon_08",
    bounty: null,
  },
]

const DAY = 24 * 60 * 60 * 1000

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 1001,
    jobId: 1,
    jobTitle: "Backend SDE II",
    category: "Software Engineering",
    candidateName: "Priya Nair",
    primarySkill: "Distributed Systems",
    pitch:
      "Scaled a payments service to 40k RPS on Node.js + Postgres. I obsess over p99 latency and clean migrations.",
    matchScore: 92,
    status: "pending",
    appliedAt: Date.now() - 1 * DAY,
  },
  {
    id: 1002,
    jobId: 1,
    jobTitle: "Backend SDE II",
    category: "Software Engineering",
    candidateName: "Marcus Lee",
    primarySkill: "API Design",
    pitch:
      "Led the redesign of a monolith into 6 services. Strong on idempotency, queues, and observability.",
    matchScore: 78,
    status: "shortlisted",
    appliedAt: Date.now() - 3 * DAY,
  },
  {
    id: 1003,
    jobId: 3,
    jobTitle: "Growth Product Manager",
    category: "Product",
    candidateName: "Sofia Ramos",
    primarySkill: "Activation Funnels",
    pitch:
      "Grew onboarding activation 34% via experiment velocity. I live in Mixpanel and ship weekly.",
    matchScore: 88,
    status: "referred",
    appliedAt: Date.now() - 5 * DAY,
  },
]

const PITCH_SNIPPETS = [
  "I ship fast and measure everything — happy to walk through my last launch.",
  "Deep expertise in this exact stack with a track record of ownership.",
  "I thrive in ambiguous, high-growth environments and love hard problems.",
]

function randomMatchScore() {
  return Math.floor(70 + Math.random() * 29) // 70–98
}

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("home")
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS)
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS)

  const [tokensRemaining, setTokensRemaining] = useState(4)
  const maxTokens = 5
  const [resumeName, setResumeName] = useState<string | null>(null)
  const [selectedExpertise, setSelectedExpertise] = useState<Category[]>([])
  const seekerName = "You (Alex Morgan)"

  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confettiTrigger, setConfettiTrigger] = useState(0)

  const [hydrated, setHydrated] = useState(false)

  // Load state from localStorage on client-side mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedView = localStorage.getItem("backchannel_view")
        const savedJobs = localStorage.getItem("backchannel_jobs")
        const savedApps = localStorage.getItem("backchannel_applications")
        const savedTokens = localStorage.getItem("backchannel_tokens")
        const savedResume = localStorage.getItem("backchannel_resume")
        const savedExpertise = localStorage.getItem("backchannel_expertise")
        const savedEmail = localStorage.getItem("backchannel_email")
        const savedMsgs = localStorage.getItem("backchannel_messages")

        if (savedView) setView(savedView as View)
        if (savedJobs) setJobs(JSON.parse(savedJobs))
        if (savedApps) setApplications(JSON.parse(savedApps))
        if (savedTokens) setTokensRemaining(Number(savedTokens))
        if (savedResume) setResumeName(savedResume === "" ? null : savedResume)
        if (savedExpertise) setSelectedExpertise(JSON.parse(savedExpertise))
        if (savedEmail) setVerifiedEmail(savedEmail === "" ? null : savedEmail)
        if (savedMsgs) setMessages(JSON.parse(savedMsgs))
      } catch (e) {
        console.error("Failed to restore state from localStorage:", e)
      } finally {
        setHydrated(true)
      }
    }
  }, [])

  // Sync state to localStorage when changes occur
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem("backchannel_view", view)
      localStorage.setItem("backchannel_jobs", JSON.stringify(jobs))
      localStorage.setItem("backchannel_applications", JSON.stringify(applications))
      localStorage.setItem("backchannel_tokens", String(tokensRemaining))
      localStorage.setItem("backchannel_resume", resumeName || "")
      localStorage.setItem("backchannel_expertise", JSON.stringify(selectedExpertise))
      localStorage.setItem("backchannel_email", verifiedEmail || "")
      localStorage.setItem("backchannel_messages", JSON.stringify(messages))
    } catch (e) {
      console.error("Failed to save state to localStorage:", e)
    }
  }, [hydrated, view, jobs, applications, tokensRemaining, resumeName, selectedExpertise, verifiedEmail, messages])

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

  const value = useMemo<MarketplaceState>(() => {
    const hasApplied = (jobId: number) =>
      applications.some(
        (a) => a.jobId === jobId && a.candidateName === seekerName,
      )

    return {
      view,
      setView,
      jobs,
      applications,
      tokensRemaining,
      maxTokens,
      resumeName,
      selectedExpertise,
      seekerName,
      setSelectedExpertise,
      uploadResume: (name) => {
        setResumeName(name)
        addToast(`Resume "${name}" uploaded successfully!`, "success")
      },
      deleteResume: () => {
        setResumeName(null)
        addToast("Resume removed from profile.", "info")
      },
      enterSeeker: (expertise, resume) => {
        setSelectedExpertise(expertise)
        setResumeName(resume)
        setView("seeker")
        addToast("Entered Seeker Dashboard.", "info")
      },
      hasApplied,
      applyToJob: (jobId, pitch) => {
        if (hasApplied(jobId)) {
          addToast("You already applied to this role.", "error")
          return { ok: false, reason: "You already applied to this role." }
        }
        if (tokensRemaining <= 0) {
          addToast("You are out of application tokens.", "error")
          return { ok: false, reason: "You are out of application tokens." }
        }
        const job = jobs.find((j) => j.id === jobId)
        if (!job) {
          addToast("Role not found.", "error")
          return { ok: false, reason: "Role not found." }
        }

        setTokensRemaining((t) => t - 1)
        setApplications((prev) => [
          {
            id: Date.now(),
            jobId,
            jobTitle: job.title,
            category: job.category,
            candidateName: seekerName,
            primarySkill: job.stack.split(",")[0]?.trim() ?? "Generalist",
            pitch,
            matchScore: randomMatchScore(),
            status: "pending",
            appliedAt: Date.now(),
          },
          ...prev,
        ])
        addToast("Application submitted successfully! Sped 1 Token.", "success")
        return { ok: true }
      },
      postJob: (input) => {
        const industryByCategory: Record<Category, string> = {
          "Software Engineering": "Technology",
          "Data & AI": "AI Startup",
          Product: "SaaS",
          Design: "SaaS",
          Marketing: "Consumer",
          Sales: "Enterprise Software",
          Finance: "Financial Services",
          Operations: "Logistics",
        }
        const newId = Math.max(0, ...jobs.map((j) => j.id)) + 1
        const newJob: Job = {
          id: newId,
          title: input.title,
          category: input.category,
          industry: industryByCategory[input.category],
          companySize: input.companySize,
          stack: input.stack,
          postedBy: "Anon_You",
          bounty: input.bounty,
        }
        setJobs((prev) => [newJob, ...prev])

        // Seed a fresh applicant so the Kanban shows activity immediately.
        setApplications((prev) => [
          {
            id: newId * 1000 + 1,
            jobId: newId,
            jobTitle: input.title,
            category: input.category,
            candidateName: "Jordan Blake",
            primarySkill: input.stack.split(",")[0]?.trim() || "Generalist",
            pitch:
              PITCH_SNIPPETS[Math.floor(Math.random() * PITCH_SNIPPETS.length)],
            matchScore: randomMatchScore(),
            status: "pending",
            appliedAt: Date.now(),
          },
          ...prev,
        ])
        addToast(`Successfully posted "${input.title}"! Candidate matched.`, "success")
      },
      updateApplicationStatus: (id, status) => {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a)),
        )
        if (status === "referred") {
          addToast("Candidate referred! Bonus unlocked! 🎉", "success")
          setConfettiTrigger((prev) => prev + 1)
        } else if (status === "shortlisted") {
          addToast("Candidate shortlisted. Opening chat option.", "info")
        } else {
          addToast(`Application status updated to "${status}".`, "info")
        }
      },
      verifiedEmail,
      setVerifiedEmail: (email) => {
        setVerifiedEmail(email)
        if (email) {
          addToast(`Domain authenticated for ${email}.`, "success")
        } else {
          addToast("Employee log out complete.", "info")
        }
      },
      messages,
      sendMessage: (applicationId, sender, text) => {
        const newMessage: Message = {
          id: Date.now() + Math.random(),
          applicationId,
          sender,
          text,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, newMessage])
        addToast("Message sent anonymously.", "success")
      },
      toasts,
      addToast,
      removeToast,
      confettiTrigger,
      triggerConfetti,
    }
  }, [view, jobs, applications, tokensRemaining, resumeName, selectedExpertise, verifiedEmail, messages, toasts, confettiTrigger])

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  )
}

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext)
  if (!ctx) {
    throw new Error("useMarketplace must be used within MarketplaceProvider")
  }
  return ctx
}

export const STATUS_LABELS: Record<
  ApplicationStatus,
  { seeker: string; employee: string }
> = {
  pending: { seeker: "Pending Review", employee: "New Applicants" },
  shortlisted: { seeker: "Shortlisted", employee: "Shortlisted" },
  referred: { seeker: "Referred", employee: "Referred" },
}
