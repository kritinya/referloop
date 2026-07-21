import { NextResponse } from "next/server"
import { Resend } from "resend"
import nodemailer from "nodemailer"
import crypto from "crypto"
import { saveOTPRecord } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const { email, type = "otp" } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()
    const verificationType = type === "magic" ? "magic" : "otp"

    // Get origin domain for Magic Link
    const host = request.headers.get("host") || "localhost:3000"
    const protocol = host.includes("localhost") ? "http" : "https"
    const origin = `${protocol}://${host}`

    let code = ""
    let emailSubject = ""
    let emailContentHtml = ""

    if (verificationType === "otp") {
      code = Math.floor(100000 + Math.random() * 900000).toString()
      saveOTPRecord(cleanEmail, code, "otp")

      emailSubject = `${code} is your Referloop verification code`
      emailContentHtml = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;">
          <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 8px; color: #1e293b;">Referloop Verification</h2>
          <p style="font-size: 14px; color: #475569; margin-bottom: 24px;">Please enter the following 6-digit verification code to complete your verification.</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #5200FF; background-color: #f8fafc; padding: 12px; text-align: center; border-radius: 8px; border: 1px dashed #cbd5e1; margin-bottom: 24px;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #94a3b8;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `
    } else {
      code = crypto.randomBytes(32).toString("hex")
      saveOTPRecord(cleanEmail, code, "magic")

      const magicUrl = `${origin}/api/verify/magic?email=${encodeURIComponent(cleanEmail)}&token=${code}`
      emailSubject = `Verify your email for Referloop`
      emailContentHtml = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;">
          <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 8px; color: #1e293b;">Referloop Verification</h2>
          <p style="font-size: 14px; color: #475569; margin-bottom: 24px;">Click the button below to verify your email address and authenticate your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicUrl}" style="background-color: #5200FF; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">If the button above does not work, copy and paste this link in your browser:</p>
          <p style="font-size: 11px; word-break: break-all; color: #5200FF;">${magicUrl}</p>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 12px;">This link will expire in 10 minutes.</p>
        </div>
      `
    }

    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD
    const resendApiKey = process.env.RESEND_API_KEY

    // 1. Gmail SMTP with fail-safe mock fallback
    if (smtpUser && smtpPassword) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: smtpUser, pass: smtpPassword },
        })

        await transporter.sendMail({
          from: `"Referloop Verification" <${smtpUser}>`,
          to: cleanEmail,
          subject: emailSubject,
          html: emailContentHtml,
        })

        return NextResponse.json({
          success: true,
          message: `Verification ${verificationType === "otp" ? "code" : "link"} sent successfully via Gmail SMTP.`,
        })
      } catch (smtpError: any) {
        console.warn("Gmail SMTP authentication failed, falling back to mock mode:", smtpError)
        return NextResponse.json({
          success: true,
          mock: true,
          code,
          message: `[Gmail SMTP Failed] Falling back to Mock Mode.`,
          mockLink: verificationType === "magic" ? `${origin}/api/verify/magic?email=${encodeURIComponent(cleanEmail)}&token=${code}` : undefined
        })
      }
    }

    // 2. Resend with fail-safe mock fallback
    if (resendApiKey) {
      try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
        const resend = new Resend(resendApiKey)
        
        const { data, error } = await resend.emails.send({
          from: `Referloop Verification <${fromEmail}>`,
          to: cleanEmail,
          subject: emailSubject,
          html: emailContentHtml,
        })

        if (error) {
          console.warn("Resend delivery failed, falling back to mock mode:", error)
          return NextResponse.json({
            success: true,
            mock: true,
            code,
            message: `[Resend Failed] Falling back to Mock Mode.`,
            mockLink: verificationType === "magic" ? `${origin}/api/verify/magic?email=${encodeURIComponent(cleanEmail)}&token=${code}` : undefined
          })
        }

        return NextResponse.json({
          success: true,
          message: `Verification ${verificationType === "otp" ? "code" : "link"} sent successfully via Resend.`,
        })
      } catch (resendError: any) {
        console.warn("Resend connection failed, falling back to mock mode:", resendError)
        return NextResponse.json({
          success: true,
          mock: true,
          code,
          message: `[Resend Error] Falling back to Mock Mode.`,
          mockLink: verificationType === "magic" ? `${origin}/api/verify/magic?email=${encodeURIComponent(cleanEmail)}&token=${code}` : undefined
        })
      }
    }

    // 3. Direct Mock Mode
    console.log(`[MOCK MODE] OTP Sent to ${cleanEmail}: ${code}`)
    return NextResponse.json({
      success: true,
      mock: true,
      code,
      message: `[Development Mock Mode] Verification generated.`,
      mockLink: verificationType === "magic" ? `${origin}/api/verify/magic?email=${encodeURIComponent(cleanEmail)}&token=${code}` : undefined
    })

  } catch (error: any) {
    console.error("Error in sending OTP API:", error)
    return NextResponse.json(
      { error: error.message || "Failed to send verification code." },
      { status: 500 }
    )
  }
}
