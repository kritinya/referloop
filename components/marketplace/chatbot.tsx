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
    const q = query.toLowerCase()

    if (q.includes("how does") || q.includes("work") || q.includes("features") || q.includes("what is")) {
      return "Referloop is an anonymous backchannel referral marketplace. Verified employees post open roles inside their companies (often with gift card or cash bounties). Job seekers upload a resume, select their expertise, and apply with a short 200-character pitch. If an employee shortlists and refers you, you skip the application queue and they unlock the bounty!"
    }
    if (q.includes("anonymous") || q.includes("identity") || q.includes("private") || q.includes("safe")) {
      return "Anonymity is our core value. Employees post opportunities behind anonymized handles (e.g. Anon_01) and their real names/details are never displayed. Seekers submit pitches anonymously at first, and their uploaded resumes are only shared with the specific verified employee they apply to. Your current company will never know you are browsing!"
    }
    if (q.includes("bounty") || q.includes("bounties") || q.includes("reward") || q.includes("bonus")) {
      return "Bounties are referral incentives pledged by employees. If an employee refers you and you secure the role, the employee receives the bounty (e.g. $100 Gift Card or Bonus). Roles with bounties attract 3.2x more applicants, but posting roles without bounties is also completely free."
    }
    if (q.includes("pitch") || q.includes("resume") || q.includes("tips") || q.includes("advice")) {
      return "To maximize your referral rate: \n1. Focus on metrics in your 200-character pitch (e.g. 'Scaled payments system to 40k RPS' or 'Grew onboarding activation 34%').\n2. Keep your resume clean and scan it using our AI Resume Insights on the Profile tab to identify missing skills. \n3. Ensure your pitch speaks directly to the job stack listed."
    }
    if (q.includes("token") || q.includes("tokens") || q.includes("apply")) {
      return "Seekers receive 5 application tokens. Applying to a job spends 1 token. This token limit prevents spam and ensures employees review only high-intent, high-signal applicants."
    }
    if (q.includes("employee") || q.includes("verify") || q.includes("employer")) {
      return "Employees verify using their corporate email domain (e.g. alex@stripe.com). We authenticate the domain and immediately unlock the Employee Dashboard, where they can post opportunities, review applicants on a Kanban board, and chat anonymously with candidates."
    }
    if (q.includes("hello") || q.includes("hi ") || q.includes("hey")) {
      return "Hello! How can I help you today? Ask me about Referloop's features, how referrals work, or general job search advice!"
    }

    // Smart general fallback
    return `That's a great question! While I am trained primarily on Referloop's referral mechanics (anonymity, bounties, and tokenized applications), I can tell you that in any job search, backchanneling is the single most effective way to land interviews. \n\nCould you clarify if you're asking about the Seeker dashboard, Employee verification, or how to write a high-scoring pitch?`
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
