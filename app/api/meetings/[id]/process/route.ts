// ==============================================================================
// POST /api/meetings/[id]/process — End-to-End Orchestrated AI Pipeline
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/database/store';
import { meetingExtractionService } from '@/lib/services/meetingExtractionService';
import { decisionMemoryService } from '@/lib/services/decisionMemoryService';
import { conflictDetectionService } from '@/lib/services/conflictDetectionService';
import { taskPlanningService } from '@/lib/services/taskPlanningService';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id;
    const meeting = await dbStore.getMeetingById(meetingId);

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: 'Meeting record not found.' },
        { status: 404 }
      );
    }

    // Update status to processing
    await dbStore.updateMeeting(meetingId, {
      processing_status: 'processing',
      processing_error: null,
    });

    // Step 1: Extract meeting intelligence
    const extractionResult = await meetingExtractionService.extractIntelligence(
      meeting.transcript,
      meeting.title,
      meeting.meeting_date
    );

    const extractionData = extractionResult.data;

    // Step 2: Register newly confirmed decisions into Decision DNA
    const registeredDecisions = await decisionMemoryService.registerMeetingDecisions(
      meetingId,
      meeting.workspace_id,
      extractionData.decisions
    );

    // Step 3: Run Conflict Radar against historical workspace decisions
    const detectedConflicts = await conflictDetectionService.detectConflicts(
      meeting.workspace_id,
      meetingId,
      meeting.title,
      meeting.meeting_date,
      meeting.transcript,
      extractionData.decisions,
      extractionData.proposed_changes
    );

    // Step 4: Formulate unapproved task proposals for human verification (Proof Before Action)
    const proposedTasks = await taskPlanningService.createProposalsFromExtraction(
      meeting.workspace_id,
      meetingId,
      extractionData.tasks
    );

    // Step 5: Update meeting record with summary and completed status
    await dbStore.updateMeeting(meetingId, {
      processing_status: 'completed',
      summary: extractionData.meeting_summary,
      key_topics: extractionData.key_topics,
    });

    return NextResponse.json({
      success: true,
      message: 'Meeting processed successfully through AI pipeline.',
      model_used: extractionResult.model_used,
      is_live_ai: extractionResult.is_live_ai,
      data: {
        summary: extractionData.meeting_summary,
        key_topics: extractionData.key_topics,
        decisions: registeredDecisions,
        proposed_changes: extractionData.proposed_changes,
        conflicts: detectedConflicts,
        proposed_tasks: proposedTasks,
        open_questions: extractionData.open_questions,
        suggestions: extractionData.suggestions,
      },
    });
  } catch (err: any) {
    console.error('Processing error:', err);
    if (params?.id) {
      await dbStore.updateMeeting(params.id, {
        processing_status: 'failed',
        processing_error: err.message || 'Pipeline processing failed',
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: err.message || 'An unexpected error occurred during AI processing.',
      },
      { status: 500 }
    );
  }
}
