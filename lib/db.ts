import fs from "fs"
import path from "path"

const DB_PATH = process.env.NODE_ENV === "production"
  ? "/tmp/referloop_db.json"
  : path.join(process.cwd(), "referloop_db.json")

export type OTPRecord = {
  email: string
  code: string
  expiresAt: number
}

function readDB(): { otps: OTPRecord[] } {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { otps: [] }
    }
    const data = fs.readFileSync(DB_PATH, "utf8")
    return JSON.parse(data)
  } catch (e) {
    return { otps: [] }
  }
}

function writeDB(data: { otps: OTPRecord[] }) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8")
  } catch (e) {
    console.error("Failed to write to Referloop JSON database:", e)
  }
}

export function saveOTP(email: string, code: string): void {
  const db = readDB()
  const cleanEmail = email.toLowerCase().trim()
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes from now

  // Remove existing OTPs for this email
  const updatedOTPs = db.otps.filter((o) => o.email !== cleanEmail)

  updatedOTPs.push({
    email: cleanEmail,
    code,
    expiresAt,
  })

  writeDB({ otps: updatedOTPs })
}

export function verifyOTP(email: string, code: string): { ok: boolean; reason?: string } {
  const db = readDB()
  const cleanEmail = email.toLowerCase().trim()
  const record = db.otps.find((o) => o.email === cleanEmail)

  if (!record) {
    return { ok: false, reason: "No verification request found for this email." }
  }

  if (Date.now() > record.expiresAt) {
    return { ok: false, reason: "Verification code has expired (10-minute limit)." }
  }

  if (record.code !== code.trim()) {
    return { ok: false, reason: "Incorrect verification code." }
  }

  // OTP verified successfully, clean up from db
  const updatedOTPs = db.otps.filter((o) => o.email !== cleanEmail)
  writeDB({ otps: updatedOTPs })

  return { ok: true }
}
