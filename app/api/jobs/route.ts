import { NextResponse } from "next/server"
import { getAuthUser, getAuditData } from "@/lib/auth-utils"
import { getJobs, saveJob, Job, saveAuditLog, getUserByEmail, deleteJob } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")?.toLowerCase() || ""
    const category = searchParams.get("category") || ""
    const sortBy = searchParams.get("sortBy") || "newest"
    const bountiesOnly = searchParams.get("bountiesOnly") === "true"

    let allJobs = getJobs()

    // 1. Search Query Filter
    if (query) {
      allJobs = allJobs.filter(
        (j) =>
          j.title.toLowerCase().includes(query) ||
          j.stack.toLowerCase().includes(query) ||
          j.postedBy.toLowerCase().includes(query) ||
          j.companyName?.toLowerCase().includes(query) ||
          j.location?.toLowerCase().includes(query)
      )
    }

    // 2. Category Filter
    if (category && category !== "All") {
      allJobs = allJobs.filter((j) => j.category === category)
    }

    // 3. Bounties Only Filter
    if (bountiesOnly) {
      allJobs = allJobs.filter((j) => j.bounty !== null && j.bounty.trim() !== "")
    }

    // 4. Sorting
    if (sortBy === "newest") {
      allJobs.sort((a, b) => b.id - a.id)
    } else if (sortBy === "bounty") {
      allJobs.sort((a, b) => {
        const valA = parseFloat(a.bounty?.replace(/[^0-9.]/g, "") || "0")
        const valB = parseFloat(b.bounty?.replace(/[^0-9.]/g, "") || "0")
        return valB - valA
      })
    } else if (sortBy === "alphabetical") {
      allJobs.sort((a, b) => a.title.localeCompare(b.title))
    }

    return NextResponse.json({ jobs: allJobs })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch listings." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = getAuthUser(request)
    if (!session || (session.role !== "employee" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized. Employees only." }, { status: 401 })
    }

    const { 
      title, 
      category, 
      companySize, 
      stack, 
      bounty, 
      jdFileName, 
      jdFileBase64, 
      rules, 
      expiresDays = 30,
      companyName,
      companyUrl,
      location,
      workModel,
      description
    } = await request.json()

    // Enforce strict validations (Requirement 2 & 3)
    if (!companyName || companyName.trim() === "") {
      return NextResponse.json({ error: "Company name is required." }, { status: 400 })
    }
    if (!companyUrl || companyUrl.trim() === "") {
      return NextResponse.json({ error: "Company Website URL is required." }, { status: 400 })
    }
    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: "Job role / title must be at least 3 characters long." }, { status: 400 })
    }
    if (!location || location.trim() === "") {
      return NextResponse.json({ error: "Location is required." }, { status: 400 })
    }
    if (!workModel || !["remote", "hybrid", "on-site"].includes(workModel)) {
      return NextResponse.json({ error: "Work model is required (Remote, Hybrid, or On-site)." }, { status: 400 })
    }
    if (!description || description.trim() === "") {
      return NextResponse.json({ error: "Job description & requirements are required." }, { status: 400 })
    }
    if (!stack || stack.trim().length < 2) {
      return NextResponse.json({ error: "Required skills/tech stack are required." }, { status: 400 })
    }

    const user = getUserByEmail(session.email)
    const anonymousHandle = `Anon_${user?.name.split(" ")[0] || "Employee"}`

    const newJob: Job = {
      id: Date.now(),
      title: title.trim(),
      category,
      industry: category === "Software Engineering" ? "Technology" : "Services",
      companySize,
      stack: stack.trim(),
      postedBy: anonymousHandle,
      postedByEmail: session.email.toLowerCase().trim(),
      bounty: bounty?.trim() || null,
      jdFileName: jdFileName || null,
      jdFileBase64: jdFileBase64 || null,
      rules: rules || null,
      expiresAt: Date.now() + expiresDays * 24 * 60 * 60 * 1000,
      companyName: companyName.trim(),
      companyUrl: companyUrl.trim(),
      location: location.trim(),
      workModel: workModel as any,
      description: description.trim()
    }

    saveJob(newJob)

    // Log in audit trail
    const { ip, device, browser } = getAuditData(request)
    saveAuditLog(session.email, `Created Job Posting: ${title} (${anonymousHandle})`, ip, device, browser)

    return NextResponse.json({
      success: true,
      message: "Job opportunity posted successfully.",
      job: newJob
    })

  } catch (error: any) {
    console.error("Error in posting job API:", error)
    return NextResponse.json({ error: "Failed to post job." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = getAuthUser(request)
    if (!session || (session.role !== "employee" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized. Employees only." }, { status: 401 })
    }

    const { 
      id,
      title, 
      category, 
      companySize, 
      stack, 
      bounty, 
      jdFileName, 
      jdFileBase64, 
      rules, 
      companyName,
      companyUrl,
      location,
      workModel,
      description
    } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Job ID is required." }, { status: 400 })
    }

    const allJobs = getJobs()
    const existingJob = allJobs.find((j) => j.id === Number(id))
    if (!existingJob) {
      return NextResponse.json({ error: "Job posting not found." }, { status: 404 })
    }

    // Verify ownership
    if (session.role !== "admin" && existingJob.postedByEmail?.toLowerCase() !== session.email.toLowerCase()) {
      return NextResponse.json({ error: "Access denied. You can only edit your own listings." }, { status: 403 })
    }

    // Enforce strict validations (Requirement 2 & 3)
    if (!companyName || companyName.trim() === "") {
      return NextResponse.json({ error: "Company name is required." }, { status: 400 })
    }
    if (!companyUrl || companyUrl.trim() === "") {
      return NextResponse.json({ error: "Company Website URL is required." }, { status: 400 })
    }
    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: "Job role / title must be at least 3 characters long." }, { status: 400 })
    }
    if (!location || location.trim() === "") {
      return NextResponse.json({ error: "Location is required." }, { status: 400 })
    }
    if (!workModel || !["remote", "hybrid", "on-site"].includes(workModel)) {
      return NextResponse.json({ error: "Work model is required (Remote, Hybrid, or On-site)." }, { status: 400 })
    }
    if (!description || description.trim() === "") {
      return NextResponse.json({ error: "Job description & requirements are required." }, { status: 400 })
    }
    if (!stack || stack.trim().length < 2) {
      return NextResponse.json({ error: "Required skills/tech stack are required." }, { status: 400 })
    }

    const updatedJob: Job = {
      ...existingJob,
      title: title.trim(),
      category,
      companySize,
      stack: stack.trim(),
      bounty: bounty?.trim() || null,
      jdFileName: jdFileName !== undefined ? jdFileName : existingJob.jdFileName,
      jdFileBase64: jdFileBase64 !== undefined ? jdFileBase64 : existingJob.jdFileBase64,
      rules: rules !== undefined ? rules : existingJob.rules,
      companyName: companyName.trim(),
      companyUrl: companyUrl.trim(),
      location: location.trim(),
      workModel: workModel as any,
      description: description.trim()
    }

    saveJob(updatedJob)

    // Log in audit trail
    const { ip, device, browser } = getAuditData(request)
    saveAuditLog(session.email, `Updated Job Posting: ${title} (ID: ${id})`, ip, device, browser)

    return NextResponse.json({
      success: true,
      message: "Job opportunity updated successfully.",
      job: updatedJob
    })

  } catch (error: any) {
    console.error("Error in updating job API:", error)
    return NextResponse.json({ error: "Failed to update job." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = getAuthUser(request)
    if (!session || (session.role !== "employee" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const idStr = searchParams.get("id")
    if (!idStr) {
      return NextResponse.json({ error: "Job ID is required." }, { status: 400 })
    }

    const id = Number(idStr)
    const allJobs = getJobs()
    const existingJob = allJobs.find((j) => j.id === id)
    if (!existingJob) {
      return NextResponse.json({ error: "Job posting not found." }, { status: 404 })
    }

    // Verify ownership
    if (session.role !== "admin" && existingJob.postedByEmail?.toLowerCase() !== session.email.toLowerCase()) {
      return NextResponse.json({ error: "Access denied. You can only delete your own listings." }, { status: 403 })
    }

    // Delete job
    deleteJob(id)

    // Log in audit trail
    const { ip, device, browser } = getAuditData(request)
    saveAuditLog(session.email, `Deleted Job Posting: ${existingJob.title} (ID: ${id})`, ip, device, browser)

    return NextResponse.json({
      success: true,
      message: "Job opportunity deleted successfully."
    })

  } catch (error: any) {
    console.error("Error in deleting job API:", error)
    return NextResponse.json({ error: "Failed to delete job." }, { status: 500 })
  }
}
