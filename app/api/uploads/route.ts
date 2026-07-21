import { NextResponse } from "next/server"
import path from "path"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // File size check: Max 5MB
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File exceeds 5MB size limit." },
        { status: 400 }
      )
    }

    // Allowed file extension checks
    const ext = path.extname(file.name).toLowerCase()
    const allowedExtensions = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"]
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed extensions: ${allowedExtensions.join(", ")}` },
        { status: 400 }
      )
    }

    // Convert file to a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = buffer.toString("base64")
    const dataUrl = `data:${file.type || "application/octet-stream"};base64,${base64Data}`

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      fileBase64: dataUrl,
    })
  } catch (error: any) {
    console.error("Error in file uploads API:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process file upload." },
      { status: 500 }
    )
  }
}
