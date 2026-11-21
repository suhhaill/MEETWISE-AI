// ==============================================================================
// POST /api/tasks/[id]/approve — Human Approval & Proof Verification Action
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { approvalService } from '@/lib/services/approvalService';
import { TaskApprovalActionSchema } from '@/lib/validation/schemas';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const body = await req.json();

    const validated = TaskApprovalActionSchema.parse(body);

    const result = await approvalService.processTaskApproval({
      taskId,
      workspaceId: body.workspace_id || 'a0000000-0000-0000-0000-000000000001',
      action: validated.action,
      reviewer: validated.reviewer,
      comments: validated.comments,
      modifiedFields: validated.modified_fields,
    });

    return NextResponse.json({
      success: true,
      message: `Task verification recorded: ${validated.action}`,
      task: result.task,
      approval: result.approval,
    });
  } catch (err: any) {
    console.error('Task approval action error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process task approval' },
      { status: 400 }
    );
  }
}
