import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-utils"
import {
  getUsers,
  getJobs,
  getApplications,
  getAuditLogs,
  updateUser
} from "@/lib/database"

export async function GET(request: Request) {
  try {
    const session = getAuthUser(request)

    // Admin role check
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Access denied. Administrators only." }, { status: 403 })
    }

    const users = getUsers()
    const jobs = getJobs()
    const applications = getApplications()
    const logs = getAuditLogs()

    const stats = {
      totalUsers: users.length,
      verifiedUsers: users.filter((u) => u.isVerified).length,
      totalJobs: jobs.length,
      totalApplications: applications.length,
    }

    // Clean sensitive hashing details from user response
    const cleanUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      company: u.company,
      isVerified: u.isVerified,
      profileCompletion: u.profileCompletion,
      createdAt: u.createdAt
    }))

    return NextResponse.json({
      success: true,
      stats,
      users: cleanUsers,
      jobs,
      applications,
      auditLogs: logs
    })

  } catch (error: any) {
    console.error("Error in admin API:", error)
    return NextResponse.json({ error: "Failed to load administration data." }, { status: 500 })
  }
}

// Support admin-driven user overrides (such as manual domain verification or role changes)
export async function POST(request: Request) {
  try {
    const session = getAuthUser(request)
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Access denied." }, { status: 403 })
    }

    const { email, verified, role } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Target user email is required." }, { status: 400 })
    }

    const updates: any = {}
    if (verified !== undefined) updates.isVerified = !!verified
    if (role) updates.role = role

    const updated = updateUser(email, updates)
    if (!updated) {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "User account modified successfully.",
      user: {
        email: updated.email,
        role: updated.role,
        isVerified: updated.isVerified
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user." }, { status: 500 })
  }
}
