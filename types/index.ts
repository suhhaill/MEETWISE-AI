// ==============================================================================
// MEETWISE AI — TYPE DEFINITIONS & DOMAIN CONTRACTS
// Team Meteor — Product Space AI Agentic Hackathon
// ==============================================================================

export type SourceType = 'paste' | 'txt' | 'pdf' | 'audio';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type DecisionType = 'confirmed' | 'proposed' | 'deprecated';
export type DecisionStatus = 'active' | 'superseded' | 'disputed';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'modified';
export type ConflictType = 'contradiction' | 'revision' | 'clarification' | 'potential_change' | 'unrelated';
export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ConflictReviewStatus = 'unreviewed' | 'confirmed_change' | 'dismissed' | 'resolved';

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  workspace_id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

export interface Meeting {
  id: string;
  workspace_id: string;
  title: string;
  meeting_date: string;
  source_type: SourceType;
  transcript: string;
  original_file_name?: string | null;
  processing_status: ProcessingStatus;
  processing_error?: string | null;
  summary?: string | null;
  key_topics?: string[];
  created_at: string;
  updated_at: string;
}

export interface Decision {
  id: string;
  workspace_id: string;
  meeting_id: string;
  description: string;
  decision_type: DecisionType;
  decision_status: DecisionStatus;
  evidence_quote: string;
  source_speaker: string;
  confidence: number;
  supersedes_decision_id?: string | null;
  created_at: string;
  updated_at: string;
  // Hydrated relation fields
  meeting_title?: string;
  meeting_date?: string;
  superseded_by?: Decision;
  supersedes?: Decision;
}

export interface Task {
  id: string;
  workspace_id: string;
  meeting_id: string;
  decision_id?: string | null;
  title: string;
  description: string | null;
  assignee_id?: string | null;
  assignee_name?: string | null;
  due_date?: string | null;
  task_status: TaskStatus;
  approval_status: ApprovalStatus;
  evidence_quote: string;
  source_speaker: string;
  confidence: number;
  created_at: string;
  updated_at: string;
  // Hydrated relation fields
  meeting_title?: string;
  meeting_date?: string;
}

export interface Conflict {
  id: string;
  workspace_id: string;
  old_decision_id: string;
  new_decision_id?: string | null;
  conflict_type: ConflictType;
  explanation: string;
  severity: ConflictSeverity;
  review_status: ConflictReviewStatus;
  reviewer_notes?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  // Hydrated relation fields
  old_decision?: Decision;
  new_decision?: Decision;
  proposed_statement?: {
    description: string;
    speaker: string;
    evidence_quote: string;
    meeting_id?: string;
    meeting_title?: string;
    meeting_date?: string;
  };
}

export interface Approval {
  id: string;
  workspace_id: string;
  task_id: string;
  action: 'approved' | 'rejected' | 'modified';
  reviewer: string;
  comments?: string | null;
  reviewed_at: string;
}

export interface Reminder {
  id: string;
  workspace_id: string;
  task_id: string;
  scheduled_at: string;
  status: 'scheduled' | 'sent' | 'cancelled' | 'failed';
  sent_at?: string | null;
  created_at: string;
  task?: Task;
}

// AI Extraction Structured Schema
export interface ExtractedDecision {
  description: string;
  decision_type: DecisionType;
  speaker: string;
  evidence_quote: string;
  confidence: number;
}

export interface ExtractedTask {
  title: string;
  description: string;
  owner_name: string | null;
  due_date: string | null;
  source_speaker: string;
  evidence_quote: string;
  confidence: number;
}

export interface MeetingExtractionResult {
  meeting_summary: string;
  key_topics: string[];
  decisions: ExtractedDecision[];
  proposed_changes: Array<{
    description: string;
    speaker: string;
    evidence_quote: string;
    confidence: number;
  }>;
  suggestions: Array<{
    topic: string;
    speaker: string;
    suggestion: string;
  }>;
  open_questions: Array<{
    question: string;
    raised_by: string;
    assigned_to: string | null;
  }>;
  tasks: ExtractedTask[];
  missing_information: string[];
}

// Conflict Analysis Engine Structured Result
export interface DetectedConflictCandidate {
  historical_decision_id: string;
  conflict_type: ConflictType;
  explanation: string;
  severity: ConflictSeverity;
  current_quote: string;
  historical_quote: string;
  speaker: string;
  proposed_action: 'supersede_candidate' | 'clarification_needed' | 'direct_contradiction';
}

// Memory Query RAG Response
export interface MemoryAnswerCitation {
  source_type: 'decision' | 'task' | 'meeting' | 'conflict' | 'proposal';
  source_id: string;
  meeting_title: string;
  meeting_date: string;
  evidence_quote: string;
  speaker: string;
}

export interface MemoryQueryResult {
  answer: string;
  has_direct_evidence: boolean;
  citations: MemoryAnswerCitation[];
  related_decisions: Decision[];
  related_tasks: Task[];
}

// Workspace Metrics
export interface DashboardMetrics {
  totalMeetings: number;
  activeDecisions: number;
  supersededDecisions: number;
  pendingApprovals: number;
  approvedTasks: number;
  completedTasks: number;
  activeConflicts: number;
  resolvedConflicts: number;
  teamMembersCount: number;
}
