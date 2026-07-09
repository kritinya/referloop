import fs from "fs"
import path from "path"

const DB_PATH = process.env.NODE_ENV === "production"
  ? "/tmp/referloop_db.json"
  : path.join(process.cwd(), "referloop_db.json")

export type UserRole = "seeker" | "employee" | "admin"

export type User = {
  id: string
  name: string
  email: string
  passwordHash: string
  salt: string
  role: UserRole
  phone?: string
  company?: string
  isVerified: boolean
  profileCompletion: number // e.g. 0 to 100
  createdAt: number
  tokensRemaining?: number
  resumePdf?: string | null
  resumeName?: string | null
  resumeSummary?: any | null
  aiSummary?: any | null
}

export type Job = {
  id: number
  title: string
  category: string
  industry: string
  companySize: string
  stack: string
  postedBy: string // Anon handle
  postedByEmail: string // Email of employee who posted
  bounty: string | null
  jdFileName?: string | null
  jdFileBase64?: string | null
  rules?: string | null
  expiresAt: number
  companyName: string
  companyUrl: string
  location: string
  workModel: "remote" | "hybrid" | "on-site"
  description: string
}

export type ApplicationStatus = "pending" | "shortlisted" | "referred" | "rejected"

export type Application = {
  id: number
  jobId: number
  jobTitle: string
  category: string
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
  resumeSummary?: any | null
  aiSummary?: any | null
}

export type ChatMessage = {
  id: number
  applicationId: number
  sender: "seeker" | "employee"
  senderRole: "seeker" | "employee"
  text: string
  timestamp: number
}

export type Notification = {
  id: number
  userId: string // email
  text: string
  read: boolean
  createdAt: number
}

export type AuditLog = {
  id: number
  timestamp: number
  userEmail: string
  action: string
  ip: string
  device: string
  browser: string
}

export type OTPRecord = {
  email: string
  code: string
  type: "otp" | "magic"
  expiresAt: number
}

export type DBStructure = {
  users: User[]
  jobs: Job[]
  applications: Application[]
  messages: ChatMessage[]
  notifications: Notification[]
  auditLogs: AuditLog[]
  otps: OTPRecord[]
}

const MOCK_JOBS: Job[] = [
  {
    id: 1001,
    title: "Senior Full Stack Engineer",
    category: "Software Engineering",
    industry: "Technology",
    companySize: "500–1,000",
    stack: "React, Node.js, TypeScript, PostgreSQL",
    postedBy: "Anon_StripeRef",
    postedByEmail: "alex@stripe.com",
    bounty: "$2,000 Referral Bonus",
    jdFileName: null,
    jdFileBase64: null,
    rules: null,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    companyName: "Stripe",
    companyUrl: "https://stripe.com",
    location: "San Francisco, CA",
    workModel: "hybrid",
    description: "Join our core payments team. You will be responsible for designing and scaling APIs that process billions of dollars in global commerce. Requirements: 5+ years of experience with typed languages (TS/Go/Java) and high-throughput systems."
  },
  {
    id: 1002,
    title: "Product Designer (UI/UX)",
    category: "Design",
    industry: "Technology",
    companySize: "1,000–5,000",
    stack: "Figma, Design Systems, Prototyping",
    postedBy: "Anon_FigmaDesigner",
    postedByEmail: "sarah@figma.com",
    bounty: "$1,500 Referral Bonus",
    jdFileName: null,
    jdFileBase64: null,
    rules: null,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    companyName: "Figma",
    companyUrl: "https://figma.com",
    location: "New York, NY",
    workModel: "remote",
    description: "Looking for a product designer to lead design on our enterprise collaboration tools. You will conduct user research and deliver high-fidelity mocks. Requirements: A strong portfolio showing complete design systems work and product flow solutions."
  },
  {
    id: 1003,
    title: "Senior Staff Security Engineer",
    category: "Software Engineering",
    industry: "Technology",
    companySize: "5,000+",
    stack: "IAM, AWS Security, Kubernetes, Go",
    postedBy: "Anon_GoogleSec",
    postedByEmail: "secops@google.com",
    bounty: "$3,000 Security Bounty",
    jdFileName: null,
    jdFileBase64: null,
    rules: null,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    companyName: "Google",
    companyUrl: "https://google.com",
    location: "Mountain View, CA",
    workModel: "on-site",
    description: "Help protect and secure cloud infrastructure that handles queries for billions of users. You will audit IAM controls, deploy container-hardening tools, and respond to threats. Requirements: Deep understanding of Linux internals, AWS/GCP architecture, and cryptography."
  },
  {
    id: 1004,
    title: "Growth Marketing Lead",
    category: "Marketing",
    industry: "Services",
    companySize: "200–500",
    stack: "SEO, Google Analytics, SQL, Paid Acquisition",
    postedBy: "Anon_VercelGrowth",
    postedByEmail: "growth@vercel.com",
    bounty: "$1,000 Lead Bounty",
    jdFileName: null,
    jdFileBase64: null,
    rules: null,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    companyName: "Vercel",
    companyUrl: "https://vercel.com",
    location: "Remote, US",
    workModel: "remote",
    description: "Drive adoption and paid conversions for the frontend developer platform of choice. You will manage ad budgets, run SEO audits, and measure funnels. Requirements: Track record scaling B2B SaaS ARR and basic SQL knowledge for data extraction."
  },
  {
    id: 1005,
    title: "Machine Learning Researcher",
    category: "Software Engineering",
    industry: "Technology",
    companySize: "500–1,000",
    stack: "Python, PyTorch, LLMs, CUDA, Transformers",
    postedBy: "Anon_OpenAIResearch",
    postedByEmail: "research@openai.com",
    bounty: "$4,000 Elite Bounty",
    jdFileName: null,
    jdFileBase64: null,
    rules: null,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    companyName: "OpenAI",
    companyUrl: "https://openai.com",
    location: "San Francisco, CA",
    workModel: "on-site",
    description: "Push the boundaries of artificial intelligence. Research and train next-generation generative models. Requirements: PhD or equivalent publication track record at top-tier venues (NeurIPS, ICML) and extreme proficiency with CUDA/PyTorch distributed training."
  },
  {
    id: 1006,
    title: "Technical Support Lead",
    category: "Other",
    industry: "Services",
    companySize: "1,000–5,000",
    stack: "Zendesk, API Troubleshooting, JavaScript, SQL",
    postedBy: "Anon_SlackSupport",
    postedByEmail: "support@slack.com",
    bounty: "$1,200 Support Bounty",
    jdFileName: null,
    jdFileBase64: null,
    rules: null,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    companyName: "Slack",
    companyUrl: "https://slack.com",
    location: "Denver, CO",
    workModel: "hybrid",
    description: "Support enterprise Slack workspaces with customized API implementations and integrations. You will debug client workflows and collaborate with engineering. Requirements: 3+ years in tech support, ability to write basic scripts, and strong communications."
  }
]

const INITIAL_DB: DBStructure = {
  users: [
    // Default seeded Administrator (for admin panel)
    {
      id: "admin-id",
      name: "System Admin",
      email: "admin@referloop.com",
      passwordHash: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824", // sha256 of "AdminPassword123!"
      salt: "adminsalt",
      role: "admin",
      phone: "+15555555555",
      isVerified: true,
      profileCompletion: 100,
      createdAt: Date.now(),
    }
  ],
  jobs: MOCK_JOBS,
  applications: [],
  messages: [],
  notifications: [],
  auditLogs: [],
  otps: []
}

// Read database file synchronously
export function readDB(): DBStructure {
  try {
    let db: DBStructure
    if (!fs.existsSync(DB_PATH)) {
      db = INITIAL_DB
      writeDB(db)
    } else {
      const data = fs.readFileSync(DB_PATH, "utf8")
      const parsed = JSON.parse(data)
      db = {
        users: parsed.users || INITIAL_DB.users,
        jobs: parsed.jobs || INITIAL_DB.jobs,
        applications: parsed.applications || INITIAL_DB.applications,
        messages: parsed.messages || INITIAL_DB.messages,
        notifications: parsed.notifications || INITIAL_DB.notifications,
        auditLogs: parsed.auditLogs || INITIAL_DB.auditLogs,
        otps: parsed.otps || INITIAL_DB.otps
      }
    }

    // Seed mock jobs if empty (Requirement 4)
    if (!db.jobs || db.jobs.length === 0) {
      db.jobs = MOCK_JOBS
      try {
        const tempPath = `${DB_PATH}.tmp`
        fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), "utf8")
        fs.renameSync(tempPath, DB_PATH)
      } catch (err) {
        console.error("Failed to write mock jobs seed:", err)
      }
    }

    // Dynamic Seed for admin@portal.com (Requirement 2)
    const adminEmail = "admin@portal.com"
    const hasAdmin = db.users.find(u => u.email.toLowerCase() === adminEmail)
    if (!hasAdmin) {
      const crypto = require("crypto")
      const salt = "adminsalt"
      const passwordHash = crypto.createHmac("sha256", salt).update("Admin123!").digest("hex")
      db.users.push({
        id: "admin-super-id",
        name: "Portal Admin",
        email: adminEmail,
        passwordHash,
        salt,
        role: "admin",
        phone: "+15555555555",
        isVerified: true,
        profileCompletion: 100,
        createdAt: Date.now(),
      })
      // Write back to persist
      try {
        const tempPath = `${DB_PATH}.tmp`
        fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), "utf8")
        fs.renameSync(tempPath, DB_PATH)
      } catch (err) {
        console.error("Failed to write updated admin seed:", err)
      }
    }

    return db
  } catch (e) {
    console.error("Failed to read DB, returning initial seed:", e)
    return INITIAL_DB
  }
}

// Write database file synchronously with simple lock
export function writeDB(data: DBStructure): void {
  try {
    const tempPath = `${DB_PATH}.tmp`
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf8")
    fs.renameSync(tempPath, DB_PATH)
  } catch (e) {
    console.error("Failed to write database file:", e)
  }
}

/* ---------------- User Repository ---------------- */

export function saveUser(user: User): void {
  const db = readDB()
  const cleanEmail = user.email.toLowerCase().trim()
  db.users = db.users.filter((u) => u.email.toLowerCase() !== cleanEmail)
  db.users.push(user)
  writeDB(db)
}

export function getUserByEmail(email: string): User | undefined {
  const db = readDB()
  const cleanEmail = email.toLowerCase().trim()
  return db.users.find((u) => u.email.toLowerCase() === cleanEmail)
}

export function updateUser(email: string, updates: Partial<User>): User | undefined {
  const db = readDB()
  const cleanEmail = email.toLowerCase().trim()
  const idx = db.users.findIndex((u) => u.email.toLowerCase() === cleanEmail)
  if (idx === -1) return undefined
  db.users[idx] = { ...db.users[idx], ...updates }
  writeDB(db)
  return db.users[idx]
}

export function getUsers(): User[] {
  return readDB().users
}

/* ---------------- Job Repository ---------------- */

export function saveJob(job: Job): void {
  const db = readDB()
  db.jobs = db.jobs.filter((j) => j.id !== job.id)
  db.jobs.push(job)
  writeDB(db)
}

export function getJobs(): Job[] {
  return readDB().jobs
}

export function getJobById(id: number): Job | undefined {
  return readDB().jobs.find((j) => j.id === id)
}

export function deleteJob(id: number): void {
  const db = readDB()
  db.jobs = db.jobs.filter((j) => j.id !== id)
  writeDB(db)
}

/* ---------------- Application Repository ---------------- */

export function saveApplication(app: Application): void {
  const db = readDB()
  db.applications = db.applications.filter((a) => a.id !== app.id)
  db.applications.push(app)
  writeDB(db)
}

export function getApplications(): Application[] {
  return readDB().applications
}

export function updateApplicationStatus(id: number, status: ApplicationStatus): Application | undefined {
  const db = readDB()
  const idx = db.applications.findIndex((a) => a.id === id)
  if (idx === -1) return undefined
  db.applications[idx].status = status
  writeDB(db)
  return db.applications[idx]
}

/* ---------------- Message Repository ---------------- */

export function saveChatMessage(msg: ChatMessage): void {
  const db = readDB()
  db.messages.push(msg)
  writeDB(db)
}

export function getChatMessages(applicationId: number): ChatMessage[] {
  return readDB().messages.filter((m) => m.applicationId === applicationId)
}

/* ---------------- Notification Repository ---------------- */

export function saveNotification(userId: string, text: string): void {
  const db = readDB()
  const newNotif: Notification = {
    id: Date.now() + Math.random(),
    userId: userId.toLowerCase().trim(),
    text,
    read: false,
    createdAt: Date.now(),
  }
  db.notifications.push(newNotif)
  writeDB(db)
}

export function getNotificationsForUser(userId: string): Notification[] {
  return readDB().notifications.filter((n) => n.userId.toLowerCase() === userId.toLowerCase().trim())
}

export function markNotificationsRead(userId: string): void {
  const db = readDB()
  const cleanId = userId.toLowerCase().trim()
  db.notifications = db.notifications.map((n) => {
    if (n.userId.toLowerCase() === cleanId) {
      return { ...n, read: true }
    }
    return n
  })
  writeDB(db)
}

/* ---------------- Audit Log Repository ---------------- */

export function saveAuditLog(userEmail: string, action: string, ip: string, device: string, browser: string): void {
  const db = readDB()
  const newLog: AuditLog = {
    id: Date.now() + Math.random(),
    timestamp: Date.now(),
    userEmail: userEmail.toLowerCase().trim(),
    action,
    ip,
    device,
    browser,
  }
  db.auditLogs.push(newLog)
  writeDB(db)
}

export function getAuditLogs(): AuditLog[] {
  return readDB().auditLogs.sort((a, b) => b.timestamp - a.timestamp)
}

/* ---------------- OTP/Magic Link Repository ---------------- */

export function saveOTPRecord(email: string, code: string, type: "otp" | "magic"): void {
  const db = readDB()
  const cleanEmail = email.toLowerCase().trim()
  db.otps = db.otps.filter((o) => !(o.email.toLowerCase() === cleanEmail && o.type === type))
  
  db.otps.push({
    email: cleanEmail,
    code,
    type,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes limit
  })
  writeDB(db)
}

export function verifyOTPRecord(email: string, code: string, type: "otp" | "magic"): { ok: boolean; reason?: string } {
  const db = readDB()
  const cleanEmail = email.toLowerCase().trim()
  const record = db.otps.find((o) => o.email.toLowerCase() === cleanEmail && o.type === type)

  if (!record) {
    return { ok: false, reason: "No verification request found." }
  }

  if (Date.now() > record.expiresAt) {
    return { ok: false, reason: "Code or link has expired (10-minute limit)." }
  }

  if (record.code !== code.trim()) {
    return { ok: false, reason: "Incorrect verification credentials." }
  }

  // Clear verification record
  db.otps = db.otps.filter((o) => !(o.email.toLowerCase() === cleanEmail && o.type === type))
  writeDB(db)
  
  return { ok: true }
}
