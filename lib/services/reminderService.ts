// ==============================================================================
// MEETWISE AI — REMINDER & WEEKLY DIGEST SERVICE
// Tracks approaching deadlines, overdue tasks, and organizes member digests
// ==============================================================================

import { Task, Member, Reminder } from '@/types';
import { dbStore } from '@/lib/database/store';

export interface MemberDigest {
  member: Member;
  assignedTasks: Task[];
  completedTasks: Task[];
  pendingTasks: Task[];
  overdueTasks: Task[];
  upcomingDeadlines: Task[];
}

export interface WorkspaceWeeklyDigest {
  generatedAt: string;
  totalPending: number;
  totalOverdue: number;
  memberDigests: MemberDigest[];
  deliveryStatus: {
    isConfigured: boolean;
    provider: string;
    note: string;
  };
}

export const reminderService = {
  // Generate comprehensive weekly digest grouped by team member
  async generateWeeklyDigest(
    workspaceId: string = 'a0000000-0000-0000-0000-000000000001'
  ): Promise<WorkspaceWeeklyDigest> {
    const [members, tasks] = await Promise.all([
      dbStore.getMembers(workspaceId),
      dbStore.getTasks(workspaceId),
    ]);

    const todayStr = new Date().toISOString().split('T')[0];
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const memberDigests: MemberDigest[] = members.map((member) => {
      const assigned = tasks.filter(
        (t) =>
          t.assignee_id === member.id ||
          (t.assignee_name && t.assignee_name.toLowerCase() === member.name.toLowerCase())
      );

      const completed = assigned.filter((t) => t.task_status === 'completed');
      const pending = assigned.filter((t) => t.task_status !== 'completed');
      const overdue = pending.filter((t) => t.due_date && t.due_date < todayStr);
      const upcoming = pending.filter(
        (t) => t.due_date && t.due_date >= todayStr && t.due_date <= sevenDaysFromNow
      );

      return {
        member,
        assignedTasks: assigned,
        completedTasks: completed,
        pendingTasks: pending,
        overdueTasks: overdue,
        upcomingDeadlines: upcoming,
      };
    });

    const totalOverdue = memberDigests.reduce((sum, d) => sum + d.overdueTasks.length, 0);
    const totalPending = memberDigests.reduce((sum, d) => sum + d.pendingTasks.length, 0);

    return {
      generatedAt: new Date().toISOString(),
      totalPending,
      totalOverdue,
      memberDigests,
      deliveryStatus: {
        isConfigured: false,
        provider: 'System Digest Preview',
        note: 'Email dispatch (e.g. Resend / SendGrid) and cron workers require external provider API keys. Viewing simulated weekly digest report.',
      },
    };
  },

  // Schedule a reminder record for a task
  async scheduleReminder(taskId: string, scheduledAt: string, workspaceId: string): Promise<Reminder> {
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      task_id: taskId,
      scheduled_at: scheduledAt,
      status: 'scheduled',
      created_at: new Date().toISOString(),
    };
    return reminder;
  },
};
