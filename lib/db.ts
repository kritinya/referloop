import { saveOTPRecord, verifyOTPRecord } from "./database"

export function saveOTP(email: string, code: string): void {
  saveOTPRecord(email, code, "otp")
}

export function verifyOTP(email: string, code: string): { ok: boolean; reason?: string } {
  return verifyOTPRecord(email, code, "otp")
}
