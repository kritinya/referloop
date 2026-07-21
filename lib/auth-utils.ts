import crypto from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "referloop-default-super-secret-key-12345"

export function hashPassword(password: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(password).digest("hex")
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex")
}

function base64url(buf: Buffer): string {
  return buf.toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

export function signJWT(payload: any, expiresInSeconds = 24 * 60 * 60): string {
  const header = { alg: "HS256", typ: "JWT" }
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds
  const fullPayload = { ...payload, exp }

  const encodedHeader = base64url(Buffer.from(JSON.stringify(header)))
  const encodedPayload = base64url(Buffer.from(JSON.stringify(fullPayload)))

  const signatureInput = `${encodedHeader}.${encodedPayload}`
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(signatureInput).digest()
  const encodedSignature = base64url(signature)

  return `${signatureInput}.${encodedSignature}`
}

export function verifyJWT(token: string): any | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [header, payload, signature] = parts
    const signatureInput = `${header}.${payload}`
    const expectedSignature = base64url(
      crypto.createHmac("sha256", JWT_SECRET).update(signatureInput).digest()
    )

    if (signature !== expectedSignature) return null

    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64").toString("utf8")
    )

    if (decodedPayload.exp && Date.now() / 1000 > decodedPayload.exp) {
      return null // Expired
    }

    return decodedPayload
  } catch (e) {
    return null
  }
}

export function getAuthUser(request: Request): { email: string; role: string; name: string } | null {
  const cookieHeader = request.headers.get("cookie") || ""
  const match = cookieHeader.match(/referloop_session=([^;]+)/)
  if (!match) return null

  const token = match[1]
  return verifyJWT(token)
}

export function getAuditData(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "127.0.0.1"
  const userAgent = request.headers.get("user-agent") || ""
  
  let browser = "Chrome"
  if (userAgent.includes("Firefox")) browser = "Firefox"
  else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari"
  else if (userAgent.includes("Edge")) browser = "Edge"
  else if (userAgent.includes("Postman")) browser = "Postman Client"
  
  let device = "Desktop"
  if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
    device = "Mobile"
  }
  
  return { ip, device, browser }
}
