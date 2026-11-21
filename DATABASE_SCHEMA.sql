-- ==============================================================================
-- MEETWISE AI — DATABASE SCHEMA SPECIFICATION
-- Team Meteor — Product Space AI Agentic Hackathon
-- "From Conversations to Completed Actions."
-- Compatible with PostgreSQL 14+ / Supabase
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. WORKSPACES
-- Represents isolated team or organizational environments
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. MEMBERS
-- Team members belonging to workspaces
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'Member',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. MEETINGS
-- Uploaded or pasted meeting transcripts and processing logs
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    meeting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('paste', 'txt', 'pdf', 'audio')),
    transcript TEXT NOT NULL,
    original_file_name VARCHAR(255),
    processing_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_error TEXT,
    summary TEXT,
    key_topics JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. DECISIONS (Decision DNA)
-- Persistent organizational memory of agreements and revisions
CREATE TABLE IF NOT EXISTS decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    decision_type VARCHAR(50) NOT NULL DEFAULT 'confirmed' CHECK (decision_type IN ('confirmed', 'proposed', 'deprecated')),
    decision_status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (decision_status IN ('active', 'superseded', 'disputed')),
    evidence_quote TEXT NOT NULL,
    source_speaker VARCHAR(255) NOT NULL DEFAULT 'Unknown',
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 1.00 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    supersedes_decision_id UUID REFERENCES decisions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TASKS (Proof Before Action)
-- Evidence-backed action items requiring human verification
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    decision_id UUID REFERENCES decisions(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES members(id) ON DELETE SET NULL,
    assignee_name VARCHAR(255),
    due_date DATE,
    task_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (task_status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    approval_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'modified')),
    evidence_quote TEXT NOT NULL,
    source_speaker VARCHAR(255) NOT NULL DEFAULT 'Unknown',
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 1.00 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CONFLICTS (Conflict Radar)
-- Detected semantic contradictions, revisions, and potential changes between meetings
CREATE TABLE IF NOT EXISTS conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    old_decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    new_decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
    conflict_type VARCHAR(50) NOT NULL CHECK (conflict_type IN ('contradiction', 'revision', 'clarification', 'potential_change', 'unrelated')),
    explanation TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    review_status VARCHAR(50) NOT NULL DEFAULT 'unreviewed' CHECK (review_status IN ('unreviewed', 'confirmed_change', 'dismissed', 'resolved')),
    reviewer_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. APPROVALS
-- Audit trail for human-in-the-loop task verification
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN ('approved', 'rejected', 'modified')),
    reviewer VARCHAR(255) NOT NULL DEFAULT 'Human Reviewer',
    comments TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. REMINDERS
-- Automated notification records and digest schedules
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled', 'failed')),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE & QUERY OPTIMIZATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_members_workspace ON members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_meetings_workspace ON meetings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date DESC);
CREATE INDEX IF NOT EXISTS idx_decisions_workspace ON decisions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(decision_status);
CREATE INDEX IF NOT EXISTS idx_decisions_meeting ON decisions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_decisions_supersedes ON decisions(supersedes_decision_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_approval ON tasks(approval_status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(task_status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_conflicts_workspace ON conflicts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_review ON conflicts(review_status);
CREATE INDEX IF NOT EXISTS idx_approvals_task ON approvals(task_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON reminders(scheduled_at, status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for demo workspace / anon key (when using local/demo or authenticated API)
CREATE POLICY "Workspaces accessible to public anon key" ON workspaces FOR ALL USING (true);
CREATE POLICY "Members accessible to public anon key" ON members FOR ALL USING (true);
CREATE POLICY "Meetings accessible to public anon key" ON meetings FOR ALL USING (true);
CREATE POLICY "Decisions accessible to public anon key" ON decisions FOR ALL USING (true);
CREATE POLICY "Tasks accessible to public anon key" ON tasks FOR ALL USING (true);
CREATE POLICY "Conflicts accessible to public anon key" ON conflicts FOR ALL USING (true);
CREATE POLICY "Approvals accessible to public anon key" ON approvals FOR ALL USING (true);
CREATE POLICY "Reminders accessible to public anon key" ON reminders FOR ALL USING (true);
