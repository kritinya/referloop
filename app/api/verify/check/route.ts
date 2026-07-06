import { NextResponse } from "next/server"
import { verifyOTP } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required." },
        { status: 400 }
      )
    }

    const verificationResult = verifyOTP(email, code)

    if (!verificationResult.ok) {
      return NextResponse.json(
        { error: verificationResult.reason || "Invalid code." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Email domain authenticated successfully!",
    })
  } catch (error: any) {
    console.error("Error in verifying OTP API:", error)
    return NextResponse.json(
      { error: error.message || "Failed to verify code." },
      { status: 500 }
    )
  }
}
