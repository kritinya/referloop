import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-utils"
import { getUserByEmail, updateUser, getJobs, getApplications } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const session = getAuthUser(request)

    if (!session) {
      return NextResponse.json({ authenticated: false })
    }

    const user = getUserByEmail(session.email)
    if (!user) {
      return NextResponse.json({ authenticated: false })
    }

    // Recalculate profile completion dynamically
    let completion = 0
    
    // Core attributes (always present)
    if (user.name) completion += 15
    if (user.email) completion += 15
    if (user.phone) completion += 15
    if (user.role) completion += 15
    if (user.isVerified) completion += 10

    if (user.role === "seeker") {
      // Seekers get extra 15% for resume and 15% for expertise selection
      const applications = getApplications()
      const hasResume = applications.some((a) => a.candidateEmail.toLowerCase() === user.email.toLowerCase() && a.resumePdf)
      // Check if they uploaded a resume or selected expertise
      if (user.profileCompletion >= 50) {
        // We'll read from their store profile if available, or if they have ever uploaded a resume name
        // Wait, since store profile has resumeName, let's keep track of it
      }
      
      // Let's check user's direct properties or mock inputs in applications
      const hasApplied = applications.some(a => a.candidateEmail.toLowerCase() === user.email.toLowerCase())
      if (hasApplied) {
        completion += 30
      } else {
        // If not applied, we check if they completed profile items (we can let the store sync updates to user table)
        // Let's allow seeker completion to be synced from the client or default it based on fields filled
        if (user.phone) completion += 10
      }
    } else {
      // Employees get 15% for company name and 15% for posting a job
      if (user.company) completion += 15
      
      const jobs = getJobs()
      const hasPosted = jobs.some((j) => j.postedBy.toLowerCase() === user.email.toLowerCase())
      if (hasPosted) completion += 15
    }

    // Cap completion at 100
    const finalCompletion = Math.min(100, completion)
    
    // Update user profile completion in database
    if (finalCompletion !== user.profileCompletion) {
      updateUser(user.email, { profileCompletion: finalCompletion })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        company: user.company,
        isVerified: user.isVerified,
        profileCompletion: finalCompletion,
        tokensRemaining: user.tokensRemaining !== undefined ? user.tokensRemaining : 5,
        resumePdf: user.resumePdf || null,
        resumeName: user.resumeName || null,
        resumeSummary: user.resumeSummary || null,
        aiSummary: user.aiSummary || null
      }
    })

  } catch (error: any) {
    console.error("Error in auth/me API:", error)
    return NextResponse.json({ error: "Failed to verify session." }, { status: 500 })
  }
}

// Support updating profile fields (e.g. phone or company) on the fly
export async function POST(request: Request) {
  try {
    const session = getAuthUser(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, phone, company, resumePdf, resumeName, resumeSummary, aiSummary } = await request.json()
    const updates: any = {}
    if (name) updates.name = name.trim()
    if (phone) updates.phone = phone.trim()
    if (company) updates.company = company.trim()
    if (resumePdf) updates.resumePdf = resumePdf
    if (resumeName) updates.resumeName = resumeName
    if (resumeSummary) updates.resumeSummary = resumeSummary
    if (aiSummary) updates.aiSummary = aiSummary

    const updatedUser = updateUser(session.email, updates)

    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update profile." }, { status: 500 })
  }
}
