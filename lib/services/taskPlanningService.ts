// ==============================================================================
// MEETWISE AI — TASK PLANNING SERVICE (PROOF BEFORE ACTION)
// Generates accountable task proposals with verbatim evidence and confidence ratings
// ==============================================================================

import { ExtractedTask, Task } from '@/types';
import { dbStore } from '@/lib/database/store';

export const taskPlanningService = {
  // Map extracted task proposals to database records with pending approval status
  async createProposalsFromExtraction(
    workspaceId: string,
    meetingId: string,
    extractedTasks: ExtractedTask[]
  ): Promise<Task[]> {
    if (!extractedTasks || extractedTasks.length === 0) return [];

    const members = await dbStore.getMembers(workspaceId);

    const taskPayloads = extractedTasks.map((ext) => {
      // Find matching member by name if specified
      let matchedAssigneeId: string | null = null;
      let matchedAssigneeName = ext.owner_name;

      if (ext.owner_name) {
        const found = members.find(
          (m) => m.name.toLowerCase() === ext.owner_name!.toLowerCase()
        );
        if (found) {
          matchedAssigneeId = found.id;
          matchedAssigneeName = found.name;
        }
      }

      return {
        workspace_id: workspaceId,
        meeting_id: meetingId,
        decision_id: null,
        title: ext.title,
        description: ext.description || null,
        assignee_id: matchedAssigneeId,
        assignee_name: matchedAssigneeName,
        due_date: ext.due_date || null,
        task_status: 'pending' as const,
        approval_status: 'pending' as const, // MANDATORY: requires human approval before active
        evidence_quote: ext.evidence_quote,
        source_speaker: ext.source_speaker || 'Unknown',
        confidence: ext.confidence || 0.95,
      };
    });

    return dbStore.createTasks(taskPayloads);
  },
};
