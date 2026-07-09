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

export type ApplicationStatus =
  | "Pending Review"
  | "Shortlisted"
  | "Referred"
  | "Declined"

export type KanbanStatus = "New Applicant" | "Shortlisted" | "Referred"

export type JobListing = {
  id: number
  title: string
  category: Category
  industry: string
  size: string
  stack: string
  postedBy: string
  bounty: string | null
}

export type SeekerApplication = {
  id: number
  roleId: number
  roleTitle: string
  company: string
  status: ApplicationStatus
  daysRemaining: number | null
}

export type CandidateApplication = {
  id: number
  candidateName: string
  roleId: number
  topSkills: string[]
  status: KanbanStatus
  daysRemaining: number | null
  matchScore: number
  whyMe: string
  resume: {
    headline: string
    experience: { role: string; company: string; period: string }[]
    skills: string[]
    education: string
  }
}

export const jobListings: JobListing[] = [
  {
    id: 1,
    title: "Backend SDE II",
    category: "Software Engineering",
    industry: "E-Commerce",
    size: "1000-5000 employees",
    stack: "Node.js, Postgres",
    postedBy: "Anon_01",
    bounty: "$50 Amazon Card",
  },
  {
    id: 2,
    title: "LLM Researcher",
    category: "Data & AI",
    industry: "AI Startup",
    size: "50-200 employees",
    stack: "Python, PyTorch",
    postedBy: "Anon_02",
    bounty: null,
  },
  {
    id: 3,
    title: "Growth Product Manager",
    category: "Product",
    industry: "Fintech",
    size: "200-1000 employees",
    stack: "Mixpanel, Jira",
    postedBy: "Anon_03",
    bounty: "$100 Bonus",
  },
  {
    id: 4,
    title: "Senior UX Researcher",
    category: "Design",
    industry: "SaaS",
    size: "200-1000 employees",
    stack: "Figma, UserTesting",
    postedBy: "Anon_04",
    bounty: null,
  },
  {
    id: 5,
    title: "Performance Marketing Lead",
    category: "Marketing",
    industry: "D2C Retail",
    size: "50-200 employees",
    stack: "Meta Ads, GA4",
    postedBy: "Anon_05",
    bounty: null,
  },
  {
    id: 6,
    title: "Enterprise Account Executive",
    category: "Sales",
    industry: "Cloud Infrastructure",
    size: "1000-5000 employees",
    stack: "Salesforce, Outreach",
    postedBy: "Anon_06",
    bounty: "$200 Gift Card",
  },
  {
    id: 7,
    title: "FP&A Analyst",
    category: "Finance",
    industry: "Banking",
    size: "10,000+ employees",
    stack: "Excel, Tableau",
    postedBy: "Anon_07",
    bounty: null,
  },
  {
    id: 8,
    title: "Supply Chain Manager",
    category: "Operations",
    industry: "Logistics",
    size: "5000-10,000 employees",
    stack: "SAP, SQL",
    postedBy: "Anon_08",
    bounty: null,
  },
]

// Seeker "My Applications" tab seed data.
export const seekerApplications: SeekerApplication[] = [
  {
    id: 201,
    roleId: 2,
    roleTitle: "LLM Researcher",
    company: "AI Startup",
    status: "Pending Review",
    daysRemaining: 5,
  },
  {
    id: 202,
    roleId: 3,
    roleTitle: "Growth Product Manager",
    company: "Fintech",
    status: "Shortlisted",
    daysRemaining: null,
  },
  {
    id: 203,
    roleId: 4,
    roleTitle: "Senior UX Researcher",
    company: "SaaS",
    status: "Referred",
    daysRemaining: null,
  },
  {
    id: 204,
    roleId: 1,
    roleTitle: "Backend SDE II",
    company: "E-Commerce",
    status: "Declined",
    daysRemaining: null,
  },
]

// Employee Kanban "Candidate Review" seed data.
export const candidateApplications: CandidateApplication[] = [
  {
    id: 101,
    candidateName: "Aarav K.",
    roleId: 1,
    topSkills: ["Node.js", "System Design"],
    status: "New Applicant",
    daysRemaining: 4,
    matchScore: 92,
    whyMe:
      "I scaled a payments API to 5M requests/day at my last role and love owning backend reliability end to end.",
    resume: {
      headline: "Backend Engineer · 5 yrs · Distributed Systems",
      experience: [
        { role: "Senior Backend Engineer", company: "PayStack-like Co.", period: "2021 - Present" },
        { role: "Backend Engineer", company: "RetailTech Inc.", period: "2019 - 2021" },
      ],
      skills: ["Node.js", "Postgres", "Kafka", "AWS", "System Design"],
      education: "B.Tech Computer Science, NIT",
    },
  },
  {
    id: 102,
    candidateName: "Priya S.",
    roleId: 2,
    topSkills: ["PyTorch", "Python"],
    status: "Shortlisted",
    daysRemaining: null,
    matchScore: 88,
    whyMe:
      "Published two papers on efficient fine-tuning and shipped an internal RAG assistant used by 400+ people.",
    resume: {
      headline: "ML Researcher · 4 yrs · NLP & LLMs",
      experience: [
        { role: "ML Researcher", company: "Applied AI Lab", period: "2022 - Present" },
        { role: "Data Scientist", company: "Analytics Co.", period: "2020 - 2022" },
      ],
      skills: ["PyTorch", "Transformers", "Python", "CUDA", "RAG"],
      education: "M.S. Machine Learning, IISc",
    },
  },
  {
    id: 103,
    candidateName: "Rahul M.",
    roleId: 4,
    topSkills: ["Figma", "UX Research"],
    status: "Referred",
    daysRemaining: null,
    matchScore: 95,
    whyMe:
      "I run mixed-methods research programs and turned usability findings into a 20% activation lift last year.",
    resume: {
      headline: "UX Researcher · 6 yrs · B2B SaaS",
      experience: [
        { role: "Senior UX Researcher", company: "CloudSuite", period: "2020 - Present" },
        { role: "UX Researcher", company: "AppWorks", period: "2018 - 2020" },
      ],
      skills: ["User Interviews", "Figma", "Survey Design", "Usability Testing"],
      education: "M.A. Human-Computer Interaction",
    },
  },
  {
    id: 104,
    candidateName: "Sneha R.",
    roleId: 1,
    topSkills: ["Java", "SQL"],
    status: "New Applicant",
    daysRemaining: 1,
    matchScore: 81,
    whyMe:
      "Strong fundamentals in backend services and databases; I ship clean, well-tested code and mentor juniors.",
    resume: {
      headline: "Software Engineer · 3 yrs · Backend",
      experience: [
        { role: "Software Engineer", company: "FinServe Ltd.", period: "2021 - Present" },
        { role: "Junior Developer", company: "CodeBase", period: "2020 - 2021" },
      ],
      skills: ["Java", "Spring Boot", "SQL", "REST APIs"],
      education: "B.E. Information Technology",
    },
  },
]
