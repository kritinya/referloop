import { NextResponse } from "next/server"
import { verifyOTPRecord, updateUser, saveAuditLog } from "@/lib/database"
import { getAuditData } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required." },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()
    const verificationResult = verifyOTPRecord(cleanEmail, code, "otp")

    if (!verificationResult.ok) {
      return NextResponse.json(
        { error: verificationResult.reason || "Invalid code." },
        { status: 400 }
      )
    }

    // Update user isVerified status in database
    updateUser(cleanEmail, { isVerified: true })

    // Log verification action
    const { ip, device, browser } = getAuditData(request)
    saveAuditLog(cleanEmail, "Email Verification Successful (OTP)", ip, device, browser)

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    })
  } catch (error: any) {
    console.error("Error in verifying OTP API:", error)
    return NextResponse.json(
      { error: error.message || "Failed to verify code." },
      { status: 500 }
    )
  }
}
