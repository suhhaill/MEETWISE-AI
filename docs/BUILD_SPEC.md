# MEETWISE AI — SYSTEM BUILD SPECIFICATION
**Team Meteor — Product Space AI Agentic Hackathon**  
*“From Conversations to Completed Actions.”*

---

## 1. System Architecture

MEETWISE AI is built using the **Next.js 14 App Router** architecture, combining high-performance server-side route handlers with interactive client components styled via Tailwind CSS.

```text
├── app/
│   ├── api/
│   │   ├── conflicts/               # Conflict Radar fetch & human review
│   │   │   └── [id]/review/route.ts
│   │   ├── decisions/               # Decision DNA retrieval & filtering
│   │   ├── digest/                  # Weekly team digest aggregator
│   │   ├── meetings/                # Meeting archive & ingestion
│   │   │   ├── [id]/
│   │   │   │   ├── process/route.ts # AI intelligence pipeline orchestrator
│   │   │   │   └── route.ts
│   │   │   ├── ingest/route.ts      # Multi-format (text, txt, pdf, audio) ingestion
│   │   │   └── route.ts
│   │   ├── memory/
│   │   │   └── query/route.ts       # Workspace RAG chat search endpoint
│   │   ├── system/
│   │   │   ├── reset/route.ts       # Reset workspace to clean demo state
│   │   │   └── status/route.ts      # Environment diagnostic health check
│   │   └── tasks/                   # Proof Before Action tasks & approvals
│   │       ├── [id]/
│   │       │   ├── approve/route.ts # Human task verification gate
│   │       │   └── status/route.ts  # Execution state transitions
│   │       └── route.ts
│   ├── conflicts/page.tsx           # Conflict Radar WOW feature UI
│   ├── decisions/page.tsx           # Decision DNA persistent memory UI
│   ├── meetings/page.tsx            # Meeting transcripts & session browser
│   ├── memory/page.tsx               # Ask Meeting Memory RAG interface
│   ├── settings/page.tsx            # Diagnostics & configuration
│   ├── tasks/page.tsx               # Proof Before Action verification board
│   ├── upload/page.tsx              # Meeting Ingestion & Processing Studio
│   ├── globals.css                  # Tailwind styles and radar animations
│   ├── layout.tsx                   # App shell layout
│   └── page.tsx                     # Executive Dashboard
├── components/
│   ├── layout/AppShell.tsx          # Sidebar, header, responsive mobile drawer
│   └── tasks/WeeklyDigestModal.tsx  # Member-grouped weekly accountability report
├── lib/
│   ├── ai/geminiClient.ts           # Google Generative AI client configuration
│   ├── database/
│   │   ├── demoData.ts              # Pre-seeded NovaTech Product Team dataset
│   │   ├── store.ts                 # Unified persistence (Supabase + In-memory)
│   │   └── supabaseClient.ts        # Supabase PostgreSQL client wrapper
│   ├── services/
│   │   ├── approvalService.ts       # Human verification and audit logging
│   │   ├── audioTranscriptionService.ts # Gemini multimodal audio transcription
│   │   ├── conflictDetectionService.ts  # Semantic cross-meeting diff engine
│   │   ├── decisionMemoryService.ts     # Decision DNA linking & superseding
│   │   ├── meetingExtractionService.ts  # Zod-validated structured intelligence
│   │   ├── meetingMemorySearchService.ts# Grounded workspace conversational RAG
│   │   ├── reminderService.ts       # Deadline tracking & weekly digest
│   │   └── transcriptService.ts     # Parsing & PDF/TXT text extraction
│   └── validation/schemas.ts        # Runtime Zod schemas for all models
├── supabase/
│   ├── migrations/                  # Versioned PostgreSQL migrations
│   └── seed.sql                     # Idempotent workspace seed script
├── DATABASE_SCHEMA.sql              # Standalone PostgreSQL 14+ database definition
└── types/index.ts                   # Complete TypeScript domain contracts
```

---

## 2. Database Schema Dictionary

The system schema comprises 8 core tables with full UUID primary keys, workspace-level foreign keys, performance indexes, and Row Level Security (RLS) policies:

1. **`workspaces`**: Isolates team data (`id`, `name`, `description`, `created_at`, `updated_at`).
2. **`members`**: Team members (`id`, `workspace_id`, `name`, `email`, `role`, `avatar_url`, `created_at`).
3. **`meetings`**: Raw and processed meeting records (`id`, `workspace_id`, `title`, `meeting_date`, `source_type`, `transcript`, `original_file_name`, `processing_status`, `processing_error`, `summary`, `key_topics`).
4. **`decisions`**: Decision DNA records (`id`, `workspace_id`, `meeting_id`, `description`, `decision_type`, `decision_status`, `evidence_quote`, `source_speaker`, `confidence`, `supersedes_decision_id`).
5. **`tasks`**: Proof Before Action tasks (`id`, `workspace_id`, `meeting_id`, `decision_id`, `title`, `description`, `assignee_id`, `assignee_name`, `due_date`, `task_status`, `approval_status`, `evidence_quote`, `source_speaker`, `confidence`).
6. **`conflicts`**: Conflict Radar items (`id`, `workspace_id`, `old_decision_id`, `new_decision_id`, `conflict_type`, `explanation`, `severity`, `review_status`, `reviewer_notes`, `reviewed_at`).
7. **`approvals`**: Audit trail for human verification (`id`, `workspace_id`, `task_id`, `action`, `reviewer`, `comments`, `reviewed_at`).
8. **`reminders`**: Deadline and digest notification queue (`id`, `workspace_id`, `task_id`, `scheduled_at`, `status`, `sent_at`).

---

## 3. Dual-Mode Persistence Strategy

To guarantee an exceptional user and judging experience:
- **Zero-Config Demo Mode**: Launches immediately with zero required environment variables. The server initializes the pre-seeded "NovaTech Product Team" workspace in-memory with full support for new uploads, conflict detection, task approval transitions, and conversational queries.
- **Production Mode**: When `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `GEMINI_API_KEY` are provided in `.env.local`, the app seamlessly activates cloud PostgreSQL persistence and live Google Gemini 1.5/2.0 API extraction.
