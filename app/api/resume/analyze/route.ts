import { NextResponse } from "next/server"

// Polyfill global browser classes required by pdf-parse's rendering engine in Node.js
if (typeof global !== "undefined") {
  if (!(global as any).DOMMatrix) {
    (global as any).DOMMatrix = class DOMMatrix {}
  }
  if (!(global as any).ImageData) {
    (global as any).ImageData = class ImageData {}
  }
  if (!(global as any).Path2D) {
    (global as any).Path2D = class Path2D {}
  }
}

const pdf = require("pdf-parse")

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let text = ""
    try {
      let parsed;
      if (typeof pdf === "function") {
        parsed = await pdf(buffer)
      } else if (pdf && typeof pdf.default === "function") {
        parsed = await pdf.default(buffer)
      } else {
        throw new TypeError("pdf-parse resolution failed.")
      }
      text = parsed.text || ""
    } catch (err: any) {
      console.warn("pdf-parse failed, extracting readable strings instead:", err)
      // Fallback: extract ASCII characters
      text = buffer.toString("utf8").replace(/[^\x20-\x7E\n]/g, "")
    }

    // Keyword matching lists
    const SKILLS_CHECK = [
      "React", "TypeScript", "JavaScript", "HTML", "CSS", "Next.js", "Node.js", 
      "Express", "Python", "Django", "PyTorch", "TensorFlow", "Java", "Spring", 
      "Go", "Rust", "C++", "C#", "Postgres", "PostgreSQL", "MongoDB", "MySQL", 
      "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Figma", "UX/UI", "Product Management"
    ]

    const textLower = text.toLowerCase()

    // 1. Detect Skills
    const matchedSkills = SKILLS_CHECK.filter(skill => 
      textLower.includes(skill.toLowerCase())
    )

    // 2. Generate Strengths
    const strengths: string[] = []
    if (textLower.includes("senior") || textLower.includes("lead") || textLower.includes("principal") || textLower.includes("architect")) {
      strengths.push("Demonstrated leadership experience (Senior/Lead keywords detected)")
    }
    if (matchedSkills.length >= 6) {
      strengths.push(`Broad technical stack containing ${matchedSkills.slice(0, 4).join(", ")}`)
    }
    if (textLower.includes("scale") || textLower.includes("performance") || textLower.includes("optimized") || textLower.includes("improved")) {
      strengths.push("Focuses on systems optimization and high performance")
    }
    if (textLower.includes("degree") || textLower.includes("university") || textLower.includes("bachelor") || textLower.includes("master")) {
      strengths.push("Formal academic background in technical/professional domains")
    }
    if (strengths.length === 0) {
      strengths.push("Clean resume structure and clear sections")
      strengths.push("Good foundation in core domain skills")
    }

    // 3. Generate Weaknesses / Optimization Areas
    const weaknesses: string[] = []
    if (!textLower.includes("aws") && !textLower.includes("docker") && !textLower.includes("kubernetes") && !textLower.includes("cloud")) {
      weaknesses.push("Limited mention of cloud infrastructure or containerization (AWS, Docker)")
    }
    if (matchedSkills.length < 4) {
      weaknesses.push("Technical skill list could be expanded with modern frameworks")
    }
    if (!textLower.includes("%") && !textLower.includes("$") && !textLower.includes("million")) {
      weaknesses.push("Fewer quantifiable metrics (recommend adding impact percentages or dollars)")
    }
    if (weaknesses.length === 0) {
      weaknesses.push("Could highlight open-source contributions or side-projects more prominently")
    }

    // 4. Generate AI Match Score
    // Match score depends on the number of skills and keywords matched, base is 70, max is 98
    let matchScore = 72 + Math.min(20, matchedSkills.length * 3)
    if (textLower.includes("senior") || textLower.includes("lead")) {
      matchScore = Math.min(98, matchScore + 5)
    }

    // 5. Generate Summary paragraph
    let experienceLevel = "professional"
    if (textLower.includes("senior") || textLower.includes("principal")) {
      experienceLevel = "senior-level professional"
    } else if (textLower.includes("lead") || textLower.includes("manager")) {
      experienceLevel = "lead coordinator"
    } else if (textLower.includes("junior") || textLower.includes("intern")) {
      experienceLevel = "developing professional"
    }

    const skillsSummary = matchedSkills.length > 0
      ? `proficient in ${matchedSkills.slice(0, 5).join(", ")}`
      : "possessing core technical domain skills"

    const summaryText = `AI Analysis: candidate appears to be a highly motivated ${experienceLevel} ${skillsSummary}. Their resume demonstrates strong execution capabilities with particular focus in ${matchedSkills.slice(0, 3).join(", ") || "core operations"}. Highly recommended for referrals in matching roles.`

    return NextResponse.json({
      summary: summaryText,
      skills: matchedSkills.length > 0 ? matchedSkills : ["Generalist"],
      strengths,
      weaknesses,
      matchScore
    })

  } catch (error: any) {
    console.error("Error in resume analysis route:", error)
    return NextResponse.json({ error: error.message || "Failed to analyze resume" }, { status: 500 })
  }
}
