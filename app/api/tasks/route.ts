// ==============================================================================
// GET /api/tasks — Proof Before Action task listing & filtering
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/database/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspace_id') || 'a0000000-0000-0000-0000-000000000001';
    const approvalStatus = searchParams.get('approval_status');
    const taskStatus = searchParams.get('task_status');
    const assignee = searchParams.get('assignee');
    const search = searchParams.get('search')?.toLowerCase();

    let tasks = await dbStore.getTasks(workspaceId);

    if (approvalStatus) {
      tasks = tasks.filter((t) => t.approval_status === approvalStatus);
    }

    if (taskStatus) {
      tasks = tasks.filter((t) => t.task_status === taskStatus);
    }

    if (assignee) {
      tasks = tasks.filter(
        (t) =>
          t.assignee_id === assignee ||
          (t.assignee_name && t.assignee_name.toLowerCase() === assignee.toLowerCase())
      );
    }

    if (search) {
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          (t.description && t.description.toLowerCase().includes(search)) ||
          t.evidence_quote.toLowerCase().includes(search) ||
          (t.assignee_name && t.assignee_name.toLowerCase().includes(search))
      );
    }

    const pendingApprovalsCount = tasks.filter((t) => t.approval_status === 'pending').length;
    const approvedCount = tasks.filter((t) => t.approval_status === 'approved').length;

    return NextResponse.json({
      success: true,
      tasks,
      stats: {
        total: tasks.length,
        pendingApprovals: pendingApprovalsCount,
        approved: approvedCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve tasks' },
      { status: 500 }
    );
  }
}
