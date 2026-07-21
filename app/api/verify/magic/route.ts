import { NextResponse } from "next/server"
import { verifyOTPRecord, updateUser, saveAuditLog } from "@/lib/database"
import { getAuditData } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const token = searchParams.get("token")

    if (!email || !token) {
      return NextResponse.json({ error: "Missing email or token." }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const verificationResult = verifyOTPRecord(cleanEmail, token, "magic")

    if (!verificationResult.ok) {
      // Redirect to homepage with error flag
      return NextResponse.redirect(new URL(`/?verified=error&reason=${encodeURIComponent(verificationResult.reason || "Invalid link")}`, request.url))
    }

    // Mark email as verified
    updateUser(cleanEmail, { isVerified: true })

    // Log verification action
    const { ip, device, browser } = getAuditData(request)
    saveAuditLog(cleanEmail, "Email Verification Successful (Magic Link)", ip, device, browser)

    // Redirect to homepage with success flag
    return NextResponse.redirect(new URL("/?verified=true", request.url))

  } catch (error: any) {
    console.error("Error in magic link verification API:", error)
    return NextResponse.json({ error: "Internal server verification failure." }, { status: 500 })
  }
}
