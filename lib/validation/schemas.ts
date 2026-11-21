// ==============================================================================
// MEETWISE AI — RUNTIME ZOD SCHEMAS & VALIDATION
// Team Meteor — Product Space AI Agentic Hackathon
// ==============================================================================

import { z } from 'zod';

export const DecisionExtractionSchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters'),
  decision_type: z.enum(['confirmed', 'proposed', 'deprecated']).default('confirmed'),
  speaker: z.string().default('Unknown'),
  evidence_quote: z.string().min(2, 'Evidence quote must be present in transcript'),
  confidence: z.number().min(0).max(1).default(1.0),
});

export const TaskExtractionSchema = z.object({
  title: z.string().min(3, 'Task title is required'),
  description: z.string().default(''),
  owner_name: z.string().nullable().default(null),
  due_date: z.string().nullable().default(null),
  source_speaker: z.string().default('Unknown'),
  evidence_quote: z.string().min(2, 'Evidence quote must be present in transcript'),
  confidence: z.number().min(0).max(1).default(1.0),
});

export const MeetingExtractionSchema = z.object({
  meeting_summary: z.string().min(10, 'Meeting summary must be at least 10 characters'),
  key_topics: z.array(z.string()).default([]),
  decisions: z.array(DecisionExtractionSchema).default([]),
  proposed_changes: z
    .array(
      z.object({
        description: z.string(),
        speaker: z.string().default('Unknown'),
        evidence_quote: z.string(),
        confidence: z.number().min(0).max(1).default(0.9),
      })
    )
    .default([]),
  suggestions: z
    .array(
      z.object({
        topic: z.string(),
        speaker: z.string(),
        suggestion: z.string(),
      })
    )
    .default([]),
  open_questions: z
    .array(
      z.object({
        question: z.string(),
        raised_by: z.string().default('Unknown'),
        assigned_to: z.string().nullable().default(null),
      })
    )
    .default([]),
  tasks: z.array(TaskExtractionSchema).default([]),
  missing_information: z.array(z.string()).default([]),
});

export const ConflictDetectionItemSchema = z.object({
  historical_decision_id: z.string(),
  conflict_type: z.enum(['contradiction', 'revision', 'clarification', 'potential_change', 'unrelated']),
  explanation: z.string().min(5),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  current_quote: z.string(),
  historical_quote: z.string(),
  speaker: z.string().default('Unknown'),
  proposed_action: z.enum(['supersede_candidate', 'clarification_needed', 'direct_contradiction']),
});

export const ConflictDetectionResultSchema = z.object({
  has_conflicts: z.boolean(),
  conflicts: z.array(ConflictDetectionItemSchema).default([]),
});

export const MeetingIngestRequestSchema = z.object({
  title: z.string().min(2, 'Meeting title is required'),
  meeting_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  source_type: z.enum(['paste', 'txt', 'pdf', 'audio']),
  transcript: z.string().min(10, 'Transcript text must be at least 10 characters'),
  original_file_name: z.string().optional().nullable(),
  workspace_id: z.string().default('a0000000-0000-0000-0000-000000000001'),
});

export const TaskApprovalActionSchema = z.object({
  action: z.enum(['approved', 'rejected', 'modified']),
  reviewer: z.string().default('David (Product Manager)'),
  comments: z.string().optional().nullable(),
  modified_fields: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      assignee_id: z.string().optional().nullable(),
      assignee_name: z.string().optional().nullable(),
      due_date: z.string().optional().nullable(),
    })
    .optional(),
});

export const ConflictReviewActionSchema = z.object({
  action: z.enum(['confirm_change', 'dismiss', 'resolve']),
  reviewer_notes: z.string().optional().nullable(),
});

export const MemoryQueryRequestSchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters'),
  workspace_id: z.string().default('a0000000-0000-0000-0000-000000000001'),
});

export type ValidatedMeetingExtraction = z.infer<typeof MeetingExtractionSchema>;
export type ValidatedConflictDetection = z.infer<typeof ConflictDetectionResultSchema>;
export type ValidatedTaskApprovalAction = z.infer<typeof TaskApprovalActionSchema>;
export type ValidatedConflictReviewAction = z.infer<typeof ConflictReviewActionSchema>;
