import { NextResponse } from "next/server"
import { getUserByEmail, saveUser, User, saveOTPRecord } from "@/lib/database"
import { hashPassword, generateSalt, getAuditData } from "@/lib/auth-utils"
import { Resend } from "resend"
import nodemailer from "nodemailer"

// Password strength checker helper
function isStrongPassword(password: string): boolean {
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return regex.test(password)
}

export async function POST(request: Request) {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      phone, 
      company, 
      selectedExpertise, 
      resumeName, 
      resumePdf, 
      resumeSummary 
    } = await request.json()

    // 1. Core Field Validations
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters long." }, { status: 400 })
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address format." }, { status: 400 })
    }
    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone.replace(/[\s-()]/g, ""))) {
      return NextResponse.json({ error: "Invalid phone number format." }, { status: 400 })
    }
    if (role === "employee" && (!company || company.trim().length < 2)) {
      return NextResponse.json({ error: "Company name is required for employees." }, { status: 400 })
    }
    if (!isStrongPassword(password)) {
      return NextResponse.json({
        error: "Password must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character."
      }, { status: 400 })
    }

    // 2. Duplicate Check
    const cleanEmail = email.toLowerCase().trim()
    const existing = getUserByEmail(cleanEmail)
    if (existing) {
      return NextResponse.json({ error: "A user with this email address already exists." }, { status: 400 })
    }

    // 3. Password Hashing
    const salt = generateSalt()
    const passwordHash = hashPassword(password, salt)

    // Calculate initial profile completion percentage
    let fieldsFilled = 5
    const totalFields = 8 // Name, email, phone, role, password, verified, resume, selectedExpertise
    if (role === "employee" && company) fieldsFilled += 2
    if (role === "seeker") {
      if (resumeName) fieldsFilled++
      if (selectedExpertise && selectedExpertise.length > 0) fieldsFilled++
    }
    const profileCompletion = Math.min(100, Math.floor((fieldsFilled / totalFields) * 100))

    const newUser: User = {
      id: "u_" + Date.now() + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      salt,
      role: role as any,
      phone: phone.trim(),
      company: role === "employee" ? company.trim() : undefined,
      selectedExpertise: role === "seeker" ? selectedExpertise || [] : undefined,
      resumeName: role === "seeker" ? resumeName || null : undefined,
      resumePdf: role === "seeker" ? resumePdf || null : undefined,
      resumeSummary: role === "seeker" ? resumeSummary || null : undefined,
      isVerified: false,
      profileCompletion,
      createdAt: Date.now(),
      tokensRemaining: role === "seeker" ? 5 : undefined
    }

    saveUser(newUser)

    // 4. Verification OTP/Magic Code Send
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    saveOTPRecord(cleanEmail, otpCode, "otp")

    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD
    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

    const emailContentHtml = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 8px; color: #1e293b;">Referloop Verification</h2>
        <p style="font-size: 14px; color: #475569; margin-bottom: 24px;">Please enter the following 6-digit verification code to complete your Referloop registration.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #5200FF; background-color: #f8fafc; padding: 12px; text-align: center; border-radius: 8px; border: 1px dashed #cbd5e1; margin-bottom: 24px;">
          ${otpCode}
        </div>
        <p style="font-size: 12px; color: #94a3b8;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `

    // SMTP Sender
    if (smtpUser && smtpPassword) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: smtpUser, pass: smtpPassword },
        })
        await transporter.sendMail({
          from: `"Referloop Verification" <${smtpUser}>`,
          to: cleanEmail,
          subject: `${otpCode} is your Referloop verification code`,
          html: emailContentHtml,
        })
      } catch (smtpError) {
        console.warn("SMTP send failed on registration, fallback mock output:", smtpError)
      }
    } else if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey)
        await resend.emails.send({
          from: `Referloop Verification <${fromEmail}>`,
          to: cleanEmail,
          subject: `${otpCode} is your Referloop verification code`,
          html: emailContentHtml,
        })
      } catch (resendError) {
        console.warn("Resend send failed on registration, fallback mock output:", resendError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "User registered successfully. Verification email code triggered.",
      mockCode: (smtpUser && smtpPassword) || resendApiKey ? undefined : otpCode
    })

  } catch (error: any) {
    console.error("Error in registration API:", error)
    return NextResponse.json({ error: error.message || "Registration failed." }, { status: 500 })
  }
}
