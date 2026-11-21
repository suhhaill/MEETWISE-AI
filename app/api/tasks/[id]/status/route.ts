// ==============================================================================
// PATCH /api/tasks/[id]/status — Update task execution progress
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { approvalService } from '@/lib/services/approvalService';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const body = await req.json();
    const { status } = body;

    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid task status value.' },
        { status: 400 }
      );
    }

    const updatedTask = await approvalService.updateExecutionStatus(taskId, status);

    return NextResponse.json({
      success: true,
      message: `Task status updated to ${status}`,
      task: updatedTask,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update task status' },
      { status: 400 }
    );
  }
}
