"use client"

import { useState, useEffect, useRef } from "react"
import { Bot, X, Send, MessageSquare, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Message = {
  id: number
  sender: "user" | "bot"
  text: string
}

const PRESETS = [
  "How does Referloop work?",
  "Is my identity anonymous?",
  "How do bounties work?",
  "Tips for a great pitch",
]

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "Hi! I'm Referloop AI, your guide. Ask me how Referloop works, how to get referred, how employees earn bounties, or ask for general resume tips!",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Simulate typing
    setTimeout(() => {
      setIsTyping(false)
      const botResponse = generateAIResponse(text)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: botResponse,
        },
      ])
    }, 800)
  }

  const generateAIResponse = (query: string): string => {
    const q = query.toLowerCase().trim()

    // 1. Greetings
    if (q.match(/^(hi|hello|hey|greetings|good morning|good afternoon|yo|hello there)/)) {
      return "Hello! I am Referloop AI, your job search and referral guide. You can ask me about how Referloop works, how to get referred, anonymous employee verification, bounties, or get general resume and interview preparation tips. What can I help you with today?"
    }

    // 2. Help request
    if (q === "help" || q === "info" || q === "guide" || q === "what can you do") {
      return "I can help you with several things:\n\n1. **How Referloop Works:** Ask about tokens, anonymity, or the application process.\n2. **Employee Domain Verification:** Learn how employees verify their corporate domains securely.\n3. **Referral Bounties:** Find out how bounties work and how employees earn them.\n4. **Resume & Pitch Tips:** Get advice on how to raise your AI match score and write high-impact pitches."
    }

    // 3. Specific Referloop Features (Check specific entities before general terms like "work")
    if (q.includes("bounty") || q.includes("bounties") || q.includes("reward") || q.includes("bonus") || q.includes("gift card") || q.includes("earn")) {
      return "Referral bounties are incentives (such as gift cards or cash bonuses) pledged by employees to attract high-quality candidates.\n\n- If you are referred and hired, the employee receives the bounty.\n- Roles with bounties receive 3.2x more applicants on average.\n- You can filter the job feed to view only roles with bounties."
    }

    if (q.includes("token") || q.includes("tokens") || q.includes("limit")) {
      return "Seekers get 5 application tokens. Applying to a role spends 1 token.\n\nThis token cap prevents candidate spamming, ensuring that employees receive only high-signal, high-intent applications. If an application is not reviewed or remains pending, the token is returned."
    }

    if (q.includes("anonymous") || q.includes("anonymity") || q.includes("privacy") || q.includes("private") || q.includes("identity") || q.includes("safe") || q.includes("security")) {
      return "Security and privacy are our top priorities:\n\n- **Employees** post under anonymous handles (e.g., Anon_01) so their identity is never visible to the public or candidates.\n- **Seekers** apply anonymously; their resumes are only shared with the specific employee who receives their application.\n- Your current company will never know you are browsing or applying."
    }

    if (q.includes("verify") || q.includes("verification") || q.includes("email") || q.includes("work email") || q.includes("authenticate")) {
      return "Employees verify using their corporate email domain (e.g. name@stripe.com). We authenticate the domain and immediately unlock the Employee Dashboard, where they can post opportunities, review applicants on a Kanban board, and chat anonymously."
    }

    if (q.includes("chat") || q.includes("message") || q.includes("messaging") || q.includes("communication") || q.includes("talk to")) {
      return "Once an employee shortlists a candidate, a secure Anonymous Chat window opens. This lets the seeker and employee coordinate on resume details, discuss team dynamics, and prepare for the interview anonymously."
    }

    // 4. Career & Resume Guidance
    if (q.includes("pitch") || q.includes("write pitch") || q.includes("why me") || q.includes("pitch tips")) {
      return "Tips for writing a high-impact pitch (max 200 characters):\n\n1. **Lead with experience:** State your title and primary stack immediately.\n2. **Quantify achievements:** Use hard metrics (e.g. 'Scaled payments API to 40k RPS' or 'Decreased page load by 35%').\n3. **Be specific:** Target the primary skill required for the role."
    }

    if (q.includes("resume") || q.includes("tips") || q.includes("advice") || q.includes("improve") || q.includes("feedback") || q.includes("insights")) {
      return "To improve your resume:\n\n- Focus on results and metrics rather than listing daily duties.\n- Tailor your skills section to match the job descriptions of the roles you are targeting.\n- Use the **AI Resume Insights** panel in your Seeker Profile to scan your uploaded resume for strengths and recommended areas of improvement."
    }

    if (q.includes("interview") || q.includes("prep") || q.includes("prepare")) {
      return "To prepare for your referred interview:\n\n- Ask your referrer about the interview format (e.g., LeetCode, system design, or domain-specific testing).\n- Inquire about the team's primary engineering challenges.\n- Focus on stories that demonstrate end-to-end ownership and high technical output."
    }

    if (q.includes("negotiate") || q.includes("negotiation") || q.includes("salary") || q.includes("pay")) {
      return "Salary negotiation tips:\n\n- Research market rates using reliable databases like levels.fyi.\n- Avoid naming a number first; ask for the budget range for the position.\n- Leverage multiple interviews or offers to increase your negotiation leverage."
    }

    // 5. Flows
    if (q.includes("seeker") || q.includes("apply") || q.includes("application") || q.includes("candidate")) {
      return "To apply as a Seeker:\n1. Upload your resume and select your expertise on the landing page.\n2. Browse the Job Feed and select a role.\n3. Click '1-Click Apply' and write a brief (up to 200 characters) pitch highlighting your achievements.\n4. Once submitted, your application status (Pending, Shortlisted, Referred) will be tracked under the 'My Applications' tab."
    }

    if (q.includes("post") || q.includes("employee") || q.includes("referrer") || q.includes("kanban") || q.includes("review")) {
      return "As an Employee, you can:\n- Post anonymous opportunities with custom bounties.\n- Review candidates in a visual Kanban board divided into 'New Applicants', 'Shortlisted', and 'Referred'.\n- Shortlist candidates to open the Anonymous Chat.\n- Mark candidates as 'Referred' to trigger a successful referral."
    }

    // 6. General Platform
    if (q.includes("how does") || q.includes("how it works") || q.includes("what is referloop") || q.includes("features") || q.includes("explain referloop") || q.includes("work")) {
      return "Referloop is a platform that connects job seekers directly with verified, anonymous employees inside top companies for direct referrals.\n\n- **Seekers** upload their resumes, select their expertise, and apply for roles with one click using a brief pitch.\n- **Employees** verify their work domains anonymously, post open roles, review candidates, and refer them to unlock bounties.\n- Once shortlisted, both parties can coordinate anonymously via our built-in chat."
    }

    // 7. General Q&A
    if (q.includes("why") || q.includes("reason")) {
      return "Referrals bypass applicant tracking systems (ATS), which filter out 75%+ of cold resumes. An employee referral ensures your application lands directly in front of the hiring manager, raising your interview rates by over 3x."
    }

    if (q.includes("jobs") || q.includes("roles") || q.includes("feed") || q.includes("positions")) {
      return "We have opportunities in Software Engineering, Data & AI, Product, Design, Sales, Marketing, and Operations. Go to the Job Feed tab on the Seeker Dashboard to see the current active listings."
    }

    if (q.includes("who are you") || q.includes("your name") || q.includes("bot")) {
      return "I am the Referloop AI assistant! I am here to guide you through using the platform, optimizing your referral search, and answering general career questions."
    }

    if (q.includes("thank") || q.includes("thanks") || q.includes("cool") || q.includes("awesome") || q.includes("great")) {
      return "You're very welcome! Let me know if you need any other assistance with Referloop or your job search. I'm always here to help."
    }

    // 8. General Fallback
    return "That's an interesting question. While I'm specialized in Referloop's referral platform (anonymity, bounties, tokens, and verification), I can also answer general career questions. \n\nCould you specify if you need help with resume tips, interview preparation, getting referred, or verification?"
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 pointer-events-auto">
      {isOpen ? (
        <div className="flex flex-col w-80 sm:w-96 h-[450px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-slide-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="size-5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold leading-none">Referloop AI Guide</h3>
                <span className="text-[10px] opacity-80">Always active</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/80 hover:text-primary-foreground cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages list */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col max-w-[85%] rounded-2xl px-3.5 py-2 text-xs",
                  m.sender === "user"
                    ? "bg-primary text-primary-foreground self-end rounded-tr-none"
                    : "bg-card text-foreground self-start rounded-tl-none border border-border"
                )}
              >
                {m.text.split("\n").map((line, idx) => (
                  <p key={idx} className={cn("leading-relaxed", idx > 0 && "mt-1")}>
                    {line}
                  </p>
                ))}
              </div>
            ))}
            {isTyping && (
              <div className="bg-card text-foreground border border-border self-start rounded-2xl rounded-tl-none px-3.5 py-2 text-xs flex gap-1 items-center max-w-[50px]">
                <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" />
                <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Presets */}
          {messages.length < 3 && !isTyping && (
            <div className="px-4 py-2 border-t border-border/50 bg-card flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="text-[10px] font-medium border border-border bg-background hover:bg-muted px-2.5 py-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input field */}
          <div className="border-t border-border p-3 bg-card flex gap-2">
            <input
              type="text"
              placeholder="Ask about Referloop..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend(input)
              }}
              className="flex-1 rounded-xl border border-input bg-background px-3 py-1.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
            <Button
              size="icon-sm"
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              className="size-8 shrink-0"
            >
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
        >
          <Bot className="size-5 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-xs font-semibold">Ask Referloop AI</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      )}
    </div>
  )
}
