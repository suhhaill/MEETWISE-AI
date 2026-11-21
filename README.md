# MEETWISE AI — "From Conversations to Completed Actions"

> **Product Space AI Agentic Hackathon**  
> **Team**: Team Meteor  
> **Product**: MEETWISE AI  
> **Tagline**: *From Conversations to Completed Actions.*

---

## 🌟 Product Vision & Problem Solved

Teams conduct dozens of meetings, but:
- Important decisions are forgotten within days.
- Responsibilities become unclear and commitments are missed.
- New proposals contradict earlier agreements without anyone noticing.
- Teams lack an organizational brain to retrieve what was previously agreed upon.

**MEETWISE AI** is a commercial-grade team execution platform that understands meeting conversations, remembers agreements across meetings, detects contradictions in real time, and helps teams convert commitments into approved, accountable actions.

---

## ⚡ Three Signature Innovations

### 1. 🧬 Decision DNA (Persistent Organizational Memory)
- Maintains continuous decision memory across meeting sessions.
- Traces the evolutionary history of agreements.
- Distinguishes **Active**, **Superseded**, and **Disputed** decisions.
- **Never silently overwrites old decisions**: historical records are preserved forever.

### 2. 📡 Conflict Radar (The Core WOW Feature)
- Contextual AI comparison between incoming meeting statements and historical workspace decisions.
- Detects **Contradictions**, **Revisions**, and **Potential Changes**.
- **The Dec 10 vs. Dec 15 Demo Scenario**: When a Wednesday meeting proposes sliding the launch date from Dec 10 to Dec 15, Conflict Radar highlights both quotes side-by-side, explains the tension, and keeps Dec 10 active until a human confirms the revision.

### 3. 🛡️ Proof Before Action (Human-in-the-Loop Task Gate)
- Tasks are extracted with verbatim transcript quotes, calibrated confidence scores, and strict owner attribution.
- Prevents AI hallucinations: unassigned tasks remain `null` rather than inventing false owners.
- Requires explicit human approval before tasks enter active execution.

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js**: v18.0.0+ (Tested on v26.13.1 LTS)
- **npm**: v9.0.0+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/team-meteor/meetwise-ai.git
cd meetwise-ai
npm install
```

### 2. Run the Development Server (Zero-Config Demo Mode)
MEETWISE AI includes an intelligent **Zero-Config Demo Mode**! You can launch immediately without setting up API keys or databases:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The application will automatically boot with the **NovaTech Product Team** workspace pre-seeded with historical meetings, decisions, conflicts, and tasks.

---

## ⚙️ Enabling Live Gemini API & Supabase Database

To connect live Google Gemini 1.5/2.0 AI processing and cloud PostgreSQL persistence:

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```
2. Populate `.env.local`:
   ```env
   # Google Gemini API Key (https://aistudio.google.com/app/apikey)
   GEMINI_API_KEY=your-actual-gemini-api-key

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Set up the Supabase database:
   - Run the SQL statements inside `DATABASE_SCHEMA.sql` in the Supabase SQL Editor.
   - Run `supabase/seed.sql` to populate initial historical data.
4. Restart the server (`npm run dev`). The status badge in the header will switch to **⚡ Live Gemini API Connected**.

---

## 🎬 Hackathon Judging Demo Script (2 Minutes)

Follow these steps to demonstrate the full end-to-end journey:

1. **Dashboard Overview (`/`)**:
   - Notice the KPI counters: 6 Active Decisions, 2 Conflict Radar Alerts, 3 Pending Approvals.
   - Review the *Conflict Radar Alerts* spotlight on the dashboard.
2. **Ingest the WOW Demo Meeting (`/upload`)**:
   - Click the amber button: **"Load WOW Demo (Dec 10 vs 15)"**.
   - Review the pre-filled Wednesday launch sync transcript.
   - Click **"Run MEETWISE AI Pipeline"**.
   - Watch the 4-stage pipeline execute (Ingestion → Gemini Extraction → Conflict Radar → Task Proposals).
3. **Inspect the Conflict Radar (`/conflicts`)**:
   - Observe the detected **Revision** conflict card.
   - See the side-by-side evidence: Monday’s Dec 10 quote vs. Wednesday’s Dec 15 quote.
   - Notice that December 10 is still the active decision.
   - Click **"Confirm & Supersede Decision"**.
   - Confetti fires! Dec 10 is marked as `superseded` and Dec 15 becomes the active agreement in Decision DNA.
4. **Human Task Verification (`/tasks`)**:
   - Switch to the **Verification Queue** tab under *Proof Before Action*.
   - Review Alex’s task proposal with its verbatim evidence quote and confidence meter.
   - Click **Approve**. The task immediately transitions into **Approved Commitments**.
5. **Ask Meeting Memory (`/memory`)**:
   - Click the prompt chip: *"What launch date did we decide?"*
   - The assistant answers that the current confirmed date is December 15, citing the superseded December 10 decision and meeting transcript quote.

---

## 🏗️ Project Architecture & Tech Stack

- **Framework**: Next.js 14 App Router (React 18, TypeScript)
- **Styling**: Tailwind CSS, Tailwind Typography, Custom SaaS Design System
- **AI Integration**: Google Generative AI SDK (`@google/generative-ai`)
- **Validation**: Zod runtime schema enforcement
- **Database**: PostgreSQL / Supabase with Row Level Security (RLS)
- **Icons & Visuals**: Lucide React, Canvas Confetti

---

## 📜 Available NPM Scripts

```bash
npm run dev         # Starts local development server on port 3000
npm run build       # Compiles Next.js production build
npm run start       # Starts production server
npm run type-check  # Validates TypeScript types (0 errors)
npm run lint        # Runs ESLint checks
```

---

## 👥 Team Meteor
Built with dedication for the **Product Space AI Agentic Hackathon**.
*“From Conversations to Completed Actions.”*
