import { NextResponse } from "next/server"
import { getAuthUser, getAuditData } from "@/lib/auth-utils"
import {
  getApplications,
  saveApplication,
  updateApplicationStatus,
  saveAuditLog,
  getJobById,
  updateUser,
  getUserByEmail,
  saveNotification
} from "@/lib/database"

export async function GET(request: Request) {
  try {
    const session = getAuthUser(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let apps = getApplications()

    // 1. Role-based filter
    if (session.role === "seeker") {
      apps = apps.filter((a) => a.candidateEmail.toLowerCase() === session.email.toLowerCase())
    } else if (session.role === "employee") {
      // Employees review incoming applications. In this version, employees can review all applications
      // to facilitate peer referrers matching.
    }

    // 2. Status filter
    if (status) {
      apps = apps.filter((a) => a.status === status)
    }

    // Sort by newest first
    apps.sort((a, b) => b.appliedAt - a.appliedAt)

    return NextResponse.json({ applications: apps })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch applications." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = getAuthUser(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 })
    }

    const { jobId, pitch, resumePdf, resumeName, coverLetterPdf, coverLetterName, resumeSummary, aiSummary } = await request.json()

    // 1. Input Validation
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required." }, { status: 400 })
    }
    if (!pitch || pitch.trim().length < 10 || pitch.trim().length > 200) {
      return NextResponse.json({ error: "Pitch must be between 10 and 200 characters." }, { status: 400 })
    }

    const job = getJobById(Number(jobId))
    if (!job) {
      return NextResponse.json({ error: "Target job posting not found." }, { status: 404 })
    }

    // 2. Duplicate application check
    const allApps = getApplications()
    const alreadyApplied = allApps.some(
      (a) => a.jobId === Number(jobId) && a.candidateEmail.toLowerCase() === session.email.toLowerCase()
    )
    if (alreadyApplied) {
      return NextResponse.json({ error: "You have already applied for this referral opportunity." }, { status: 400 })
    }

    // 3. User Token Check
    const user = getUserByEmail(session.email)
    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 })
    }

    // Seekers start with 5 tokens. Check token balance.
    // We'll read/write seeker's tokens dynamically (we can store tokens in user table)
    // Let's check: in `lib/database/index.ts` does user have `tokensRemaining`? No, let's keep tokens locally or in database user object!
    // Since store profile completion and details are verified, let's store seeker's tokens remaining in the user's profile metadata!
    // We can add token management dynamically.
    const tokens = user.tokensRemaining !== undefined ? user.tokensRemaining : 5
    if (tokens <= 0) {
      return NextResponse.json({ error: "You have run out of application tokens." }, { status: 400 })
    }

    // Deduct token
    updateUser(session.email, { tokensRemaining: tokens - 1 })

    const finalResumeSummary = resumeSummary || aiSummary || user.resumeSummary || user.aiSummary || null
    const matchScore = finalResumeSummary?.matchScore || Math.floor(70 + Math.random() * 28)

    const newApplication = {
      id: Date.now(),
      jobId: Number(jobId),
      jobTitle: job.title,
      category: job.category,
      candidateName: session.name,
      candidateEmail: session.email,
      primarySkill: finalResumeSummary?.skills?.[0] || job.stack.split(",")[0]?.trim() || "Generalist",
      pitch: pitch.trim(),
      matchScore,
      status: "pending" as const,
      appliedAt: Date.now(),
      resumePdf: resumePdf || user.resumePdf || null,
      resumeName: resumeName || user.resumeName || null,
      coverLetterPdf: coverLetterPdf || null,
      coverLetterName: coverLetterName || null,
      resumeSummary: finalResumeSummary,
      aiSummary: finalResumeSummary
    }

    saveApplication(newApplication)

    // Notify employee (simulated notification in DB)
    saveNotification(job.postedBy, `New applicant for your role: "${job.title}"`)

    // Log action
    const { ip, device, browser } = getAuditData(request)
    saveAuditLog(session.email, `Submitted Application for Job ID: ${jobId}`, ip, device, browser)

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully! Sped 1 token.",
      application: newApplication
    })

  } catch (error: any) {
    console.error("Error in application post:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}

// Handle updating application status (shortlisted, referred, rejected)
export async function PUT(request: Request) {
  try {
    const session = getAuthUser(request)
    if (!session || (session.role !== "employee" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized. Employees only." }, { status: 401 })
    }

    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: "Application ID and target status are required." }, { status: 400 })
    }

    const validStatuses = ["pending", "shortlisted", "referred", "rejected"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid target status." }, { status: 400 })
    }

    const updatedApp = updateApplicationStatus(Number(id), status as any)
    if (!updatedApp) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 })
    }

    // Trigger notification to the applicant
    saveNotification(
      updatedApp.candidateEmail,
      `Your application status for "${updatedApp.jobTitle}" has changed to: ${status}.`
    )

    // Log action
    const { ip, device, browser } = getAuditData(request)
    saveAuditLog(session.email, `Updated Candidate ID ${id} Status to: ${status}`, ip, device, browser)

    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}.`,
      application: updatedApp
    })

  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update status." }, { status: 500 })
  }
}
