# MEETWISE AI — LINKEDIN HACKATHON SHOWCASE
**Product Space AI Agentic Hackathon**  
**Team Meteor**: Alex, Sarah, David, Emma  
**Tagline**: *“From Conversations to Completed Actions.”*

---

## 🚀 The Headline
**Why do 80% of meeting decisions die in Slack and Jira limbo?**  
Meet **MEETWISE AI** — the first agentic team execution platform that doesn't just summarize your meetings; it **remembers organizational decisions**, **spots contradictions**, and **enforces human proof before action**.

---

## 💡 The Problem Every Modern Team Faces
Every week, product and engineering teams spend 15+ hours in syncs, standups, and roadmap reviews. But:
- ❌ **Decisions are forgotten** 48 hours later.
- ❌ **New agreements contradict past agreements** without anyone noticing.
- ❌ **Action items lack accountability** because AI summarizers hallucinate owners or generate vague task lists.
- ❌ **Teams have zero persistent memory** to ask: *"What launch date did we actually agree on two weeks ago?"*

---

## ✨ Meet Team Meteor’s 3 Signature Innovations

### 1. 🧬 Decision DNA (Persistent Organizational Memory)
Unlike basic meeting summarizers that throw transcripts into isolated files, MEETWISE AI extracts confirmed decisions and links them into an evolutionary tree. It tracks whether decisions are **Active**, **Superseded**, or **Disputed**, with exact verbatim quotes and speaker attributions. Old decisions are never silently erased.

### 2. 📡 Conflict Radar (Our Signature WOW Feature!)
What happens when your PM agrees to launch on **December 10** on Monday, but on Wednesday suggests:  
*“Due to payment partner sandbox delays, we are considering moving the launch to December 15”*?

Traditional AI misses this. **Conflict Radar catches it immediately.**  
It compares new dialogue against active historical decisions, flags the timeline discrepancy, cites both exact quotes side-by-side, and **preserves December 10 as active until a human confirms the change**.

### 3. 🛡️ Proof Before Action (Evidence-Backed Task Verification)
No more phantom tasks. Every extracted action item must provide:
- Verbatim supporting quote from the transcript
- Verified assignee (null if unassigned — no guessing!)
- Calibrated confidence rating
- **Mandatory human approval gate** before tasks enter active execution

---

## 🛠️ The Technology Stack
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti
- **Backend & Persistence**: Next.js Server Route Handlers, Supabase PostgreSQL with RLS + Zero-Config In-Memory Fallback
- **AI Engine**: Google Gemini 1.5 Flash / 2.0 API with structured JSON schemas and Zod runtime validation
- **RAG Engine**: Workspace memory retrieval over transcripts, decisions, and tasks

---

## 🎥 2-Minute Judging Walkthrough Script

1. **Open Dashboard**: View active decisions, unreviewed conflict alerts, and pending task approvals for the *NovaTech Product Team*.
2. **Ingest Wednesday Meeting**: Click *"Load WOW Demo (Dec 10 vs 15)"* in the Upload Studio and click **Run Pipeline**.
3. **Witness Conflict Radar**: Navigate to Conflict Radar. Observe the high-severity alert comparing Monday’s Dec 10 decision against Wednesday’s Dec 15 statement.
4. **Confirm Change**: Click **"Confirm & Supersede Decision"**. Dec 10 is marked superseded, Dec 15 becomes active, and celebratory confetti fires!
5. **Human Task Verification**: Go to **Tasks & Commitments**. Review Alex’s frontend task with verbatim evidence and click **Approve**.
6. **Query Memory**: Open **Ask Meeting Memory** and ask: *"What launch date did we decide?"* Watch the AI cite the newly confirmed December 15 agreement with meeting timestamps!

---

#ProductSpace #AIAgenticHackathon #TeamMeteor #NextJS #GeminiAPI #Supabase #DecisionIntelligence #AIAgents #ProductManagement
