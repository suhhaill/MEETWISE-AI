// ==============================================================================
// MEETWISE AI — HUMAN APPROVAL SERVICE (AUDIT TRAIL & TRANSITIONS)
// Records every verification decision before tasks become active commitments
// ==============================================================================

import { Task, Approval } from '@/types';
import { dbStore } from '@/lib/database/store';

export interface ApprovalActionPayload {
  taskId: string;
  workspaceId: string;
  action: 'approved' | 'rejected' | 'modified';
  reviewer: string;
  comments?: string | null;
  modifiedFields?: {
    title?: string;
    description?: string;
    assignee_id?: string | null;
    assignee_name?: string | null;
    due_date?: string | null;
  };
}

export const approvalService = {
  // Process human approval / rejection / edit on a task
  async processTaskApproval(payload: ApprovalActionPayload): Promise<{
    task: Task | null;
    approval: Approval;
  }> {
    const { taskId, workspaceId, action, reviewer, comments, modifiedFields } = payload;

    // 1. Record the immutable audit entry
    const approval = await dbStore.recordApproval({
      workspace_id: workspaceId,
      task_id: taskId,
      action,
      reviewer,
      comments: comments || null,
    });

    // 2. Transition task state
    let taskUpdates: Partial<Task> = {};

    if (action === 'approved') {
      taskUpdates = {
        approval_status: 'approved',
        task_status: 'pending', // now an active commitment
      };
    } else if (action === 'rejected') {
      taskUpdates = {
        approval_status: 'rejected',
        task_status: 'cancelled',
      };
    } else if (action === 'modified') {
      taskUpdates = {
        approval_status: 'approved',
        task_status: 'pending',
        ...(modifiedFields || {}),
      };
    }

    const updatedTask = await dbStore.updateTask(taskId, taskUpdates);
    return { task: updatedTask, approval };
  },

  // Update ongoing task execution status (in_progress, completed, cancelled)
  async updateExecutionStatus(
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  ): Promise<Task | null> {
    return dbStore.updateTask(taskId, { task_status: status });
  },
};
