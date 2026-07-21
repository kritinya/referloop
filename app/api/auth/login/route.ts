import { NextResponse } from "next/server"
import { getUserByEmail, saveAuditLog } from "@/lib/database"
import { hashPassword, signJWT, getAuditData } from "@/lib/auth-utils"

// Simple in-memory brute force tracker (map email -> fail count)
const bruteForceMap = new Map<string, { count: number; lockedUntil: number }>()

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const { ip, device, browser } = getAuditData(request)

    // 1. Brute Force Check
    const attempts = bruteForceMap.get(cleanEmail)
    if (attempts && attempts.lockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((attempts.lockedUntil - Date.now()) / (60 * 1000))
      return NextResponse.json({
        error: `This account has been locked due to too many failed login attempts. Try again in ${minutesLeft} minute(s).`
      }, { status: 429 })
    }

    // 2. Query User
    const user = getUserByEmail(cleanEmail)
    if (!user) {
      // Return generic credentials error to prevent email enumeration
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
    }

    // 3. Password Verification
    const inputHash = hashPassword(password, user.salt)
    if (inputHash !== user.passwordHash) {
      // Log failed attempt
      const failCount = (attempts?.count || 0) + 1
      const lockedUntil = failCount >= 5 ? Date.now() + 15 * 60 * 1000 : 0 // 15 mins lock after 5 fails
      bruteForceMap.set(cleanEmail, { count: failCount, lockedUntil })
      
      saveAuditLog(cleanEmail, "Failed Login Attempt (Incorrect Password)", ip, device, browser)

      return NextResponse.json({
        error: failCount >= 5 
          ? "Too many failed attempts. Your account has been temporarily locked for 15 minutes." 
          : "Invalid email or password."
      }, { status: 401 })
    }

    // Clear brute force counters on success
    bruteForceMap.delete(cleanEmail)

    // 4. Email Verification Check
    if (!user.isVerified) {
      saveAuditLog(cleanEmail, "Login Blocked (Email Unverified)", ip, device, browser)
      return NextResponse.json({
        error: "Your email address has not been verified yet.",
        notVerified: true
      }, { status: 403 })
    }

    // 5. Generate Session Token
    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }

    const tokenMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 2 * 60 * 60 // 30 days vs 2 hours
    const token = signJWT(sessionPayload, tokenMaxAge)

    // Log Successful Login
    saveAuditLog(cleanEmail, `Login Successful (${device} / ${browser})`, ip, device, browser)

    const response = NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        company: user.company,
        profileCompletion: user.profileCompletion,
        tokensRemaining: user.tokensRemaining !== undefined ? user.tokensRemaining : 5,
        resumePdf: user.resumePdf || null,
        resumeName: user.resumeName || null,
        resumeSummary: user.resumeSummary || null,
        aiSummary: user.aiSummary || null
      }
    })

    // Set secure HTTP-only cookie
    response.headers.set(
      "Set-Cookie",
      `referloop_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${tokenMaxAge}`
    )

    return response

  } catch (error: any) {
    console.error("Error in login API:", error)
    return NextResponse.json({ error: "Internal server login failure." }, { status: 500 })
  }
}
