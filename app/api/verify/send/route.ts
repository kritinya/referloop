import { NextResponse } from "next/server"
import { Resend } from "resend"
import nodemailer from "nodemailer"
import { saveOTP } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    saveOTP(email, code)

    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD
    const resendApiKey = process.env.RESEND_API_KEY

    const emailContentHtml = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 8px; color: #1e293b;">Referloop Verification</h2>
        <p style="font-size: 14px; color: #475569; margin-bottom: 24px;">Please enter the following 6-digit verification code to authenticate your work domain.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #5200FF; background-color: #f8fafc; padding: 12px; text-align: center; border-radius: 8px; border: 1px dashed #cbd5e1; margin-bottom: 24px;">
          ${code}
        </div>
        <p style="font-size: 12px; color: #94a3b8;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `

    // 1. Check if Nodemailer Gmail SMTP is configured (100% Free, sends to any domain)
    if (smtpUser && smtpPassword) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      })

      await transporter.sendMail({
        from: `"Referloop Verification" <${smtpUser}>`,
        to: email,
        subject: `${code} is your Referloop verification code`,
        html: emailContentHtml,
      })

      return NextResponse.json({
        success: true,
        message: "Verification code sent successfully via Gmail SMTP.",
      })
    }

    // 2. Fallback to Resend if configured
    if (resendApiKey) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
      const resend = new Resend(resendApiKey)
      
      const { data, error } = await resend.emails.send({
        from: `Referloop Verification <${fromEmail}>`,
        to: email,
        subject: `${code} is your Referloop verification code`,
        html: emailContentHtml,
      })

      if (error) {
        console.error("Resend API error:", error)
        return NextResponse.json(
          { error: error.message || "Failed to send email via Resend." },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "Verification code sent successfully via Resend.",
      })
    }

    // 3. Fallback to Console log / Mock mode in development
    console.log(`[MOCK MODE] OTP Sent to ${email}: ${code}`)
    return NextResponse.json({
      success: true,
      mock: true,
      code,
      message: `[Development Mock Mode] Verification code generated: ${code}`,
    })
  } catch (error: any) {
    console.error("Error in sending OTP API:", error)
    return NextResponse.json(
      { error: error.message || "Failed to send verification code." },
      { status: 500 }
    )
  }
}
