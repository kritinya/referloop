# Referloop 🌀

Referloop is a premium anonymous job referral marketplace designed to bypass the traditional resume black hole. Seekers get direct backchannel referrals inside top companies, and verified employees earn bounties for sourcing high-signal talent.

## Key Features

1. **State Persistence & Mock DB:** Seamlessly persists all application data (posted jobs, seeker resumes, applications, messages, and email credentials) in `localStorage` across page refreshes.
2. **Advanced Job Feed Search, Sorting & Filters:** 
   - **Search:** Instant keyword search across titles, required skills/stack, industry, and employer handles.
   - **Filter:** Toggle to display only roles with active referral bounties.
   - **Sorting:** Sort opportunities by "Newest Posted", "Highest Bounty", or "Title A-Z".
3. **Interactive 4-Digit Email Verification Flow:** A simulated corporate domain authentication wizard for employees (e.g. `alex@stripe.com`) that prompts with a 4-digit code using interactive toast alerts.
4. **AI Resume Insights Dashboard:** Upload a resume to instantly see a parsed skills breakdown (expert/advanced ratings), strengths analysis, and recommendations to maximize your referral rate.
5. **Anonymous Message Portal:** A secure messaging channel for seekers and employees that unlocks once a candidate is shortlisted:
   - **Seeker View:** Inline messaging panel under each active application on the "My Applications" tab.
   - **Employee View:** A premium split-screen candidate review panel showing the resume profile on the left and the anonymous chat panel on the right.
6. **Referloop AI Guide:** A floating AI-powered chat assistant available on all pages to answer questions about platform features, bounties, tokens, anonymity, and resume optimization tips.
7. **Premium Aesthetics & Polish:**
   - **Glassmorphic Toaster:** Custom success, info, and error alerts with slick animation presets.
   - **Confetti Explosion:** Animated celebration using `canvas-confetti` when a candidate is successfully referred.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router with Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 & custom animations
- **Icons:** Lucide React
- **Animations:** Canvas-Confetti, Tailwind transitions

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

### 3. Build for Production
```bash
npm run build
```

---

## How to Test

1. **Verify Email:** Go to **Refer Talent** -> click **Verify work email** -> enter any email (e.g. `test@google.com`) -> click **Send Code** -> note the code in the toast alert -> enter the code to unlock the Employee Dashboard.
2. **Post a Role:** Post a new opportunity (add a bounty for premium badges). This will seed a candidate on your Kanban board.
3. **Shortlist & Chat:** Click **View Resume** on the candidate card under "Candidate Review". Click **Shortlist**. A chat panel will slide open on the right. Type a message.
4. **Reply as Seeker:** Switch to the Seeker dashboard, go to the **My Applications** tab, and click **Chat with Referrer** to read and reply to the employee.
5. **Refer Seeker (Confetti):** Advance the candidate to **Refer** on the Kanban board to trigger the confetti celebration.
6. **Chat with Referloop AI:** Click the floating **Ask Referloop AI** button in the bottom-left corner to ask general questions or learn about platform guidelines.
