"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  candidateApplications as seedCandidates,
  jobListings as seedListings,
  seekerApplications as seedSeekerApps,
  type Category,
  type CandidateApplication,
  type JobListing,
  type KanbanStatus,
  type SeekerApplication,
} from "@/lib/mock-data"

export const MAX_TOKENS = 5

export type ResumeFile = {
  name: string
  size: string
} | null

export type Notification = {
  id: number
  candidateName: string
  status: KanbanStatus
  roleTitle: string
  message: string
  read: boolean
}

type NewRoleInput = {
  title: string
  category: Category
  industry: string
  size: string
  stack: string
  bounty: string | null
}

type AppState = {
  // Data
  listings: JobListing[]
  seekerApps: SeekerApplication[]
  candidates: CandidateApplication[]
  notifications: Notification[]

  // Seeker session
  tokens: number
  expertise: Category[]
  resume: ResumeFile
  appliedIds: number[]

  // Actions
  setExpertise: (next: Category[]) => void
  setResume: (file: ResumeFile) => void
  applyToJob: (jobId: number, whyMe: string) => void
  addListing: (input: NewRoleInput) => void
  updateCandidateStatus: (candidateId: number, status: KanbanStatus) => void
  markNotificationsRead: () => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<JobListing[]>(seedListings)
  const [seekerApps, setSeekerApps] = useState<SeekerApplication[]>(seedSeekerApps)
  const [candidates, setCandidates] = useState<CandidateApplication[]>(seedCandidates)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const [tokens, setTokens] = useState(4)
  const [expertise, setExpertise] = useState<Category[]>([])
  const [resume, setResume] = useState<ResumeFile>(null)
  const [appliedIds, setAppliedIds] = useState<number[]>([])

  const applyToJob = useCallback(
    (jobId: number, whyMe: string) => {
      setTokens((t) => (t > 0 ? t - 1 : t))
      setAppliedIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]))
      const job = listings.find((j) => j.id === jobId)
      if (!job) return
      setSeekerApps((prev) => [
        {
          id: Date.now(),
          roleId: job.id,
          roleTitle: job.title,
          company: job.industry,
          status: "Pending Review",
          daysRemaining: 7,
        },
        ...prev,
      ])
      // whyMe captured with the application (kept for the demo record)
      void whyMe
    },
    [listings],
  )

  const addListing = useCallback((input: NewRoleInput) => {
    setListings((prev) => [
      {
        id: Date.now(),
        title: input.title,
        category: input.category,
        industry: input.industry,
        size: input.size,
        stack: input.stack,
        postedBy: "Anon_01",
        bounty: input.bounty,
      },
      ...prev,
    ])
  }, [])

  const updateCandidateStatus = useCallback(
    (candidateId: number, status: KanbanStatus) => {
      const target = candidates.find((c) => c.id === candidateId)
      if (!target || target.status === status) return

      // Move the card across the Kanban columns in real time.
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId ? { ...c, status, daysRemaining: null } : c,
        ),
      )

      // Only shortlist / refer generate a candidate-facing notification.
      if (status === "New Applicant") return

      const roleTitle =
        listings.find((j) => j.id === target.roleId)?.title ?? "a role"
      const message =
        status === "Shortlisted"
          ? `You've been shortlisted for ${roleTitle}! A verified employee is reviewing your profile.`
          : `Great news — you've been referred to HR for ${roleTitle}!`

      setNotifications((prev) => [
        {
          id: Date.now(),
          candidateName: target.candidateName,
          status,
          roleTitle,
          message,
          read: false,
        },
        ...prev,
      ])

      // Keep the seeker's "My Applications" tab in sync.
      setSeekerApps((prev) =>
        prev.map((a) =>
          a.roleTitle === roleTitle
            ? { ...a, status, daysRemaining: null }
            : a,
        ),
      )
    },
    [candidates, listings],
  )

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const value = useMemo<AppState>(
    () => ({
      listings,
      seekerApps,
      candidates,
      notifications,
      tokens,
      expertise,
      resume,
      appliedIds,
      setExpertise,
      setResume,
      applyToJob,
      addListing,
      updateCandidateStatus,
      markNotificationsRead,
    }),
    [
      listings,
      seekerApps,
      candidates,
      notifications,
      tokens,
      expertise,
      resume,
      appliedIds,
      applyToJob,
      addListing,
      updateCandidateStatus,
      markNotificationsRead,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within an AppProvider")
  return ctx
}
