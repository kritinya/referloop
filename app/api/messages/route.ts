import { NextResponse } from "next/server"
import { getAuthUser, getAuditData } from "@/lib/auth-utils"
import {
  getChatMessages,
  saveChatMessage,
  getApplications,
  saveNotification,
  saveAuditLog
} from "@/lib/database"

export async function GET(request: Request) {
  try {
    const session = getAuthUser(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get("applicationId")

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required." }, { status: 400 })
    }

    // Authorization check
    const apps = getApplications()
    const app = apps.find((a) => a.id === Number(applicationId))

    if (!app) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 })
    }

    const isSeekerOwner = app.candidateEmail.toLowerCase() === session.email.toLowerCase()
    // In our prototype architecture, employees review all, or we match by handle
    const isEmployee = session.role === "employee" || session.role === "admin"

    if (!isSeekerOwner && !isEmployee) {
      return NextResponse.json({ error: "Access denied to this chat." }, { status: 403 })
    }

    const msgs = getChatMessages(Number(applicationId)).map((m) => ({
      ...m,
      senderRole: m.senderRole || m.sender
    }))
    return NextResponse.json({ messages: msgs })

  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = getAuthUser(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { applicationId, text } = await request.json()

    if (!applicationId || !text || text.trim() === "") {
      return NextResponse.json({ error: "Application ID and message text are required." }, { status: 400 })
    }

    const apps = getApplications()
    const app = apps.find((a) => a.id === Number(applicationId))

    if (!app) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 })
    }

    const isSeeker = app.candidateEmail.toLowerCase() === session.email.toLowerCase()
    const senderRole = isSeeker ? "seeker" : "employee"

    // Save Chat Message
    const newMessage = {
      id: Date.now(),
      applicationId: Number(applicationId),
      sender: senderRole as any,
      senderRole: senderRole as any,
      text: text.trim(),
      timestamp: Date.now()
    }

    saveChatMessage(newMessage)

    // Trigger Notification for the other party
    if (isSeeker) {
      // Notify employee of the job
      saveNotification("employee", `New message from candidate for "${app.jobTitle}"`)
    } else {
      // Notify Seeker
      saveNotification(app.candidateEmail, `New message from referrer for "${app.jobTitle}"`)
    }

    return NextResponse.json({
      success: true,
      message: {
        ...newMessage,
        senderRole
      }
    })

  } catch (error: any) {
    console.error("Error in posting message:", error)
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 })
  }
}
