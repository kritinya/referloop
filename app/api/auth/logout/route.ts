import { NextResponse } from "next/server"
import { getAuthUser, getAuditData } from "@/lib/auth-utils"
import { saveAuditLog } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const user = getAuthUser(request)
    const { ip, device, browser } = getAuditData(request)

    if (user) {
      saveAuditLog(user.email, "Logout Successful", ip, device, browser)
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully." })

    // Clear session cookie
    response.headers.set(
      "Set-Cookie",
      "referloop_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    )

    return response
  } catch (error: any) {
    console.error("Error in logout API:", error)
    return NextResponse.json({ error: "Logout request failed." }, { status: 500 })
  }
}
