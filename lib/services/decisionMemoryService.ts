// ==============================================================================
// MEETWISE AI — DECISION DNA (PERSISTENT ORGANIZATIONAL MEMORY SERVICE)
// Maintains cross-meeting memory, active vs superseded state, and lineage trees
// ==============================================================================

import { Decision } from '@/types';
import { dbStore } from '@/lib/database/store';

export const decisionMemoryService = {
  // Retrieve all currently active decisions in the workspace
  async getActiveDecisions(workspaceId: string): Promise<Decision[]> {
    const allDecisions = await dbStore.getDecisions(workspaceId);
    return allDecisions.filter((d) => d.decision_status === 'active');
  },

  // Retrieve complete decision memory (active, superseded, disputed)
  async getAllDecisions(workspaceId: string): Promise<Decision[]> {
    return dbStore.getDecisions(workspaceId);
  },

  // Trace the evolutionary lineage of a decision (ancestors & descendants)
  async getDecisionLineage(decisionId: string, workspaceId: string): Promise<{
    current: Decision | null;
    supersededBy: Decision | null;
    supersedes: Decision | null;
    historyChain: Decision[];
  }> {
    const all = await dbStore.getDecisions(workspaceId);
    const current = all.find((d) => d.id === decisionId) || null;

    if (!current) {
      return { current: null, supersededBy: null, supersedes: null, historyChain: [] };
    }

    const supersededBy = all.find((d) => d.supersedes_decision_id === current.id) || null;
    const supersedes = current.supersedes_decision_id
      ? all.find((d) => d.id === current.supersedes_decision_id) || null
      : null;

    // Build ordered chain
    const chain: Decision[] = [current];
    let parent = supersedes;
    while (parent) {
      chain.unshift(parent);
      parent = parent.supersedes_decision_id
        ? all.find((d) => d.id === parent!.supersedes_decision_id) || null
        : null;
    }

    return {
      current,
      supersededBy,
      supersedes,
      historyChain: chain,
    };
  },

  // Register new decisions from a processed meeting
  async registerMeetingDecisions(
    meetingId: string,
    workspaceId: string,
    extractedDecisions: Array<{
      description: string;
      decision_type: 'confirmed' | 'proposed' | 'deprecated';
      speaker: string;
      evidence_quote: string;
      confidence: number;
    }>
  ): Promise<Decision[]> {
    if (!extractedDecisions || extractedDecisions.length === 0) return [];

    const newDecisions = extractedDecisions.map((d) => ({
      workspace_id: workspaceId,
      meeting_id: meetingId,
      description: d.description,
      decision_type: d.decision_type,
      decision_status: 'active' as const,
      evidence_quote: d.evidence_quote,
      source_speaker: d.speaker,
      confidence: d.confidence,
      supersedes_decision_id: null,
    }));

    return dbStore.createDecisions(newDecisions);
  },

  // Safely supersede an old decision with a confirmed new decision (NEVER deletes)
  async supersedeDecisionWithAudit(
    oldDecisionId: string,
    newDecisionId: string
  ): Promise<boolean> {
    return dbStore.supersedeDecision(oldDecisionId, newDecisionId);
  },
};
